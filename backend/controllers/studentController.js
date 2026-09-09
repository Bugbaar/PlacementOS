import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

// @desc    Get student profile for logged-in user
// @route   GET /api/students/profile
// @access  Private (Student)
export const getProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role'
    );

    // If profile doesn't exist yet for student, auto-create empty profile
    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
      profile = await StudentProfile.findById(profile._id).populate(
        'user',
        'name email role'
      );
    }

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching student profile',
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
export const updateProfile = async (req, res) => {
  try {
    const { phone, college, branch, graduationYear, cgpa, skills, resumeUrl, name } = req.body;

    // Update User name if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    let profile = await StudentProfile.findOne({ user: req.user._id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user._id });
    }

    if (phone !== undefined) profile.phone = phone;
    if (college !== undefined) profile.college = college;
    if (branch !== undefined) profile.branch = branch;
    if (graduationYear !== undefined) profile.graduationYear = Number(graduationYear) || null;
    if (cgpa !== undefined) profile.cgpa = Number(cgpa) || 0;
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;

    await profile.save();

    const updatedProfile = await StudentProfile.findById(profile._id).populate(
      'user',
      'name email role'
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating student profile',
    });
  }
};
