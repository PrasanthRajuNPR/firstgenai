const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    iconName: { type: String, required: true }, // Store "Code", "Globe", etc.
    price: { type: Number, required: true }, 
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model("Course", courseSchema);