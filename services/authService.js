const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { formatUser } = require("../utils/formatUser");
const { createError } = require("../utils/appError");
const { expireUserInterestsIfStale } = require("../utils/userActivity");
const { touchLastActive } = require("./userService");

exports.register = async ({ name, email, password, age, gender, photos }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw createError("Email already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    age,
    gender,
    photos: photos || [],
  });

  if (!user) {
    throw createError("Invalid user data", 400);
  }

  return {
    user: formatUser(user),
    token: generateToken(user._id),
  };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw createError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  const freshUser = await expireUserInterestsIfStale(user);
  await touchLastActive(user._id);
  freshUser.lastActiveAt = new Date();

  return {
    user: formatUser(freshUser),
    token: generateToken(user._id),
  };
};

exports.getUserById = async (userId) => {
  let user = await User.findById(userId);
  if (!user) {
    throw createError("User not found", 404);
  }
  user = await expireUserInterestsIfStale(user);
  await touchLastActive(userId);
  user.lastActiveAt = new Date();
  return formatUser(user);
};
