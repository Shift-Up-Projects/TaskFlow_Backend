const asyncHandler = require("express-async-handler");
const { User, validateRegisterUser, vlidateLoginUser, validateForgotPassword, validateResetPassword } = require("../models/User");
const { sendEmailToResetPassword, sendEmailToVerifyAccount } = require("../utils/mailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createAndSendMessageNotification } = require("../utils/firebaseNotification");

/**
 * @desc Register User
 * @route /api/users/auth/register
 * @method POST
 * @access public
 */
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { username, email, password, fcmToken } = req.body;
  
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
   
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = Date.now() + 3600000; // 1 hour

    let user = await User.create({ username, email, password: hashedPassword, verificationToken, verificationTokenExpire, fcmToken });

    const link = `http://localhost:8000/api/users/verrify-account/${user.id}/${user.verificationToken}`;
    await sendEmailToVerifyAccount(username, email, link);

    user = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationTokenExpire");

    const createdForUser = user._id;
    const title = "Welcome to TaskFlow";
    const refType = "User";
    const refId = user._id;
    const body = `Hello ${user.username}, welcome to TaskFlow! We're excited to have you on board.`;
    createAndSendMessageNotification(createdForUser, refType, refId, title, body);

    return res.status(200).json({user, message: 'Verification token has sent to your email, Please verify your account' });
});

/**
 * @desc Login User
 * @route /api/users/auth/login
 * @method POST
 * @access public
 */
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = vlidateLoginUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  
    if(!user.isVerified){
      let verificationToken = user.verificationToken;
      if(!verificationToken){
          user.verificationToken = crypto.randomBytes(32).toString('hex');
          user.verificationTokenExpire = Date.now() + 3600000; // 1 hour
          const result = await user.save();
          verificationToken = result.verificationToken;
      }
      const link = `http://localhost:8000/api/users/verrify-account/${user.id}/${verificationToken}`;
      await sendEmailToVerifyAccount(user.username, email, link);
      
       return res.status(200).json({ message: 'Verification token has sent to your email, Please verify your account' });
    }


    const token = user.generateToken();
    return res.status(200).json({ token });
});

/**
 * @desc send reset password link to email
 * @route /api/users/forgot-password
 * @method POST
 * @access public
 */
module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const { error } = validateForgotPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
 
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
 
  user.resetPasswordToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
  await user.save();
 
  const link = `http://localhost:8000/api/users/reset-password/${user.id}/${user.resetPasswordToken}`;
  await sendEmailToResetPassword(user.username, email, link)
  return res.status(200).json({ message: "Password reset link sent, please check your email"})
});

/**
 * @desc get reset password link
 * @route /api/users/reset-password/:id/:resetPasswordToken
 * @method POST
 * @access public
 */
module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const { id, resetPasswordToken } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if(user.resetPasswordToken === null || resetPasswordToken !== user.resetPasswordToken){
    return res.status(400).json({ message: "Invalid link" });
  }
  if(user.resetPasswordExpire === null || user.resetPasswordExpire < Date.now()){
    return res.status(400).json({message: "Link has been expired"});
  }
  return res.status(200).json({ message: "Valid link" });
});

/**
 * @desc reset password
 * @route /api/users/reset-password
 * @method POST
 * @access public
 */
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateResetPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { newPassword, confirmPassword, resetPasswordToken, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if(user.resetPasswordToken === null || resetPasswordToken !== user.resetPasswordToken){
    return res.status(400).json({ message: "Invalid link" });
  }
  if(user.resetPasswordExpire === null || user.resetPasswordExpire < Date.now()){
    return res.status(400).json({message: "Link has been expired"});
  }
  if(newPassword !== confirmPassword){
    return res.status(400).json({message: "password does not match"});
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  
  await user.save();

  const createdForUser = user._id;
  const title = "Reset Password";
  const refType = "User";
  const refId = user._id;
  const body = `Hello ${user.username}, you are reset your password now, don't forgot it ^_^.`;
  createAndSendMessageNotification(createdForUser, refType, refId, title, body);

  return res.status(200).json({ message: "Password reset successfully" });
});