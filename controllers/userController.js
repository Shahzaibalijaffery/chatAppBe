const User = require("../models/User");

// Helper function to format user response
const formatUserResponse = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    age: user.age,
    bio: user.bio || null,
    photos: user.photos || [],
    location: user.location?.latitude
      ? {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          city: user.location.city || null,
        }
      : null,
    preferences: user.preferences
      ? {
          ageRange: user.preferences.ageRange,
          maxDistance: user.preferences.maxDistance || null,
          interests: user.preferences.interests || [],
        }
      : null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users.map(formatUserResponse),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/:userId
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    const { name, age, bio, photos, location, preferences } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (bio !== undefined) updateData.bio = bio;
    if (photos !== undefined) updateData.photos = photos;
    if (location !== undefined) updateData.location = location;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
