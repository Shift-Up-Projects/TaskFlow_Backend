const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");

/**
 * @desc Update User
 * @route /api/users/:id
 * @method PUT
 * @access private
 */
module.exports.updateUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { id } = req.params;
    const { username } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(id, { $set: { username } }, { new: true }).select("-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationTokenExpire");
    return res.status(200).json({ user: updatedUser });
});

/**
 * @desc Delete user
 * @route /api/users/:id
 * @method DELETE
 * @access private
 */
module.exports.deleteUserCtrl = asyncHandler(async (req, res) => {
    const { id } = req.params;
   
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted" });
});

/**
 * @desc Get current user
 * @route /api/users/current-user
 * @method GET
 * @access private
 */
module.exports.getSingleUserCtrl = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const user = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationTokenExpire");
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user })
});

/**
 * @desc Get all users with pagination
 * @route /api/users
 * @method GET
 * @access private
 */
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;
    const total = await User.countDocuments();
    const users = await User.find().skip(skip).limit(perPage).select("-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationTokenExpire");
    return res.status(200).json({ users, total, page, pages: Math.ceil(total / perPage) });
});

/**
 * @desc verify user account
 * @route /api/users/verrify-account/:id/:verificationToken
 * @method Get
 * @access public
 */
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const { id, verificationToken } = req.params;
  
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if(user.verificationToken === null || verificationToken !== user.verificationToken){
    return res.status(400).json({ message: "Invalid link" });
  }

  if(user.verificationTokenExpire === null || user.verificationTokenExpire < Date.now()){
    return res.status(400).json({ message: "Link has been expired" });
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpire = null;
  await user.save();

  return res.status(200).json({ message: "Account is verified succesfully" });
});