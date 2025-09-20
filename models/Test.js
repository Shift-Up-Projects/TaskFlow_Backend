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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
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

const User = mongoose.model("User", UserSchema);

const validateRegisterUser = (obj) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    role: Joi.string().valid("user", "admin"),
  });

  return schema.validate(obj);
};

module.exports = {
  User,
  validateRegisterUser,
};
