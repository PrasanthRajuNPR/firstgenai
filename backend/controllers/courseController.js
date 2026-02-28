const crypto = require("crypto");
const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const { instance } = require("../config/razorPay"); // ✅ Import from config, no duplicate instance

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({});
        res.status(200).json({ success: true, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.capturePayment = async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user._id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ success: false, message: "Course not found" });

        const options = {
            amount: course.price * 100, // INR to Paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: { courseId: courseId.toString(), userId: userId.toString() },
        };

        const paymentResponse = await instance.orders.create(options);
        res.status(200).json({ success: true, data: paymentResponse });
    } catch (err) {
        console.error("capturePayment error:", err);
        res.status(500).json({ success: false, message: "Could not initiate order" });
    }
};

exports.verifySignature = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user._id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        try {
            await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
            await Course.findByIdAndUpdate(courseId, { $addToSet: { studentsEnrolled: userId } });
            await CourseProgress.create({ courseID: courseId, userId: userId, completedVideos: [] });

            res.status(200).json({ success: true, message: "Enrolled Successfully" });
        } catch (error) {
            console.error("Enrollment error:", error);
            res.status(500).json({ success: false, message: "Enrollment failed" });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid Signature" });
    }
};