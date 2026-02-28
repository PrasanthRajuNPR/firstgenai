const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  branch: { type: String, default: '' },
  year: { type: String, default: '' },
  goal: { type: String, enum: ['placement', 'higher', 'core', 'startup', ''], default: '' },
  dailyStudyTime: { type: String, default: '' },
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', ''], default: '' },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  onboardingComplete: { type: Boolean, default: false },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
