const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpire: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    fcmToken: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate Token
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_KEY
  );
};

UserSchema.virtual("tasks", {
  ref: "Task",
  foreignField: "user_id",
  localField: "_id",
});

UserSchema.virtual("notifications", {
  ref: "Notification",
  foreignField: "createdForUser",
  localField: "_id",
});

const User = mongoose.model("User", UserSchema);

const validateRegisterUser = (obj) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required(),
    fcmToken: Joi.string(),
  });

  return schema.validate(obj);
};

const vlidateLoginUser = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

const validateUpdateUser = (obj) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    fcmToken: Joi.string(),
  }); 
  return schema.validate(obj);
}

const validateForgotPassword = (obj) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
  });
  return schema.validate(obj);
}

const validateResetPassword = (obj) => {
  const schema = Joi.object({
    newPassword: Joi.string().trim().min(6).required(),
    confirmPassword: Joi.string().trim().min(6).required(),
    userId: Joi.string().required(),
    resetPasswordToken: Joi.string().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  vlidateLoginUser,
  validateUpdateUser,
  validateForgotPassword,
  validateResetPassword
};
