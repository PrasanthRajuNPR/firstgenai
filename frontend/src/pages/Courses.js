import { useState, useEffect, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import CourseCard from "./CourseCard";
import { useAuth, API } from "../context/AuthContext";
import Layout from "../components/Layout";
import "./Courses.css";
import { useNavigate } from "react-router-dom";
function Courses() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore");
  const [courses, setCourses] = useState([]);

  /* =========================
     Fetch Courses
  ========================== */
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      const courseData = Array.isArray(res.data.data) ? res.data.data : [];
      setCourses(courseData);
    } catch (error) {
      console.error("Fetch error:", error);
      setCourses([]);
    }
  };

  /* =========================
     Purchase Handler
  ========================== */
  const handlePurchase = async (courseId) => {
    try {
      const { data: orderRes } = await API.post("/courses/capturePayment", {
        courseId,
      });

      const order = orderRes.data;

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please refresh the page.");
        return;
      }

      const rzp = new window.Razorpay(getRazorpayOptions(order, courseId));
      rzp.on("payment.failed", handlePaymentFailure);
      rzp.open();
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Payment Failed to start. Check console for details.");
    }
  };

  const getRazorpayOptions = (order, courseId) => ({
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    name: "EduEmpower",
    description: "Course Enrollment",
    order_id: order.id,
    prefill: { email: user?.email },
    theme: { color: "#4080F0" },
    modal: {
      ondismiss: () => console.log("Payment modal closed."),
    },
    handler: async (response) => {
      try {
        await API.post("/courses/verifySignature", {
          ...response,
          courseId,
        });
        await refreshUser();
        alert("Payment Successful! Course added to your library.");
      } catch (error) {
        console.error("Verification error:", error);
        alert("Payment verification failed. Please contact support.");
      }
    },
  });

  const handlePaymentFailure = (response) => {
    console.error("Payment failed:", response.error);
    alert(`Payment Failed: ${response.error.description}`);
  };

  /* =========================
     Helpers
  ========================== */
  // FIX: Wrapped isPurchased in useCallback-style inline so useMemo dependency works correctly
  const isPurchased = (id) =>
    user?.enrolledCourses
      ?.map((course) => course.toString())
      .includes(id.toString()) ?? false;

  const displayedCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    if (activeTab === "my-courses") {
      return courses.filter((course) => isPurchased(course._id));
    }
    return courses;
    // FIX: added user?.enrolledCourses to dependency array so list updates after purchase
  }, [courses, activeTab, user?.enrolledCourses]);

  const getIconComponent = (iconName) =>
    LucideIcons[iconName] || LucideIcons.HelpCircle;

  /* =========================
     Render
  ========================== */
  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard__container">
          <h1 className="dashboard__title">EdTech Dashboard</h1>

          {/* Tabs */}
          <div className="dashboard__tabs">
            <TabButton
              label="Explore Courses"
              isActive={activeTab === "explore"}
              onClick={() => setActiveTab("explore")}
            />
            <TabButton
              label="My Courses"
              isActive={activeTab === "my-courses"}
              onClick={() => setActiveTab("my-courses")}
            />
          </div>

          {/* Courses Grid */}
          <div className="courses-grid">
            {displayedCourses.length === 0 ? (
              <EmptyState activeTab={activeTab} />
            ) : (
              displayedCourses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  course={{
                    ...course,
                    icon: getIconComponent(course.iconName),
                  }}
                  isPurchased={isPurchased(course._id)}
                  onPurchase={handlePurchase}
                  // FIX: navigate path lowercased to match route definition "/courses"
                  onView={(id) => navigate(`/course/${id}`)}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* =========================
   Small Reusable Components
========================== */

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      className={`tab-btn ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function EmptyState({ activeTab }) {
  return (
    <div className="empty-state">
      {activeTab === "my-courses"
        ? "You have not enrolled in any courses yet."
        : "No courses available."}
    </div>
  );
}

export default Courses;