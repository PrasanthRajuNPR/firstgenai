const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const courses = [
  { title: "Data Structures & Algorithms", iconName: "Code", price: 20, description: "Master problem-solving..." },
  { title: "Web Development (MERN)", iconName: "Globe", price: 30, description: "Build full-stack apps..." },
  { title: "AR/VR Development", iconName: "Box", price: 40, description: "Create immersive experiences..." },
  { title: "AI & Machine Learning", iconName: "Brain", price: 50, description: "Dive into neural networks..." },
  { title: "Cybersecurity", iconName: "Shield", price: 35, description: "Learn ethical hacking..." },
  { title: "Cloud Computing", iconName: "Cloud", price: 45, description: "Master AWS and Azure..." },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Course.insertMany(courses);
  console.log("Courses Seeded!");
  process.exit();
});