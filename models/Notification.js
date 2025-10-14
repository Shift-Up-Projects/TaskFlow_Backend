const Joi = require("joi");
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    createdForUser: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refType: {
        type: String,
        required: true,
        enum: ['Task', 'User']
    }, // نوع العنصر المرتبط
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'refType',
        required: true
    }, // معرف العنصر المرتبط
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Notification = mongoose.model("Notification", NotificationSchema);

const validateCreateNotification = (obj) => {
  const schema = Joi.object({
    title: Joi.string().trim().required(),
    createdForUser: Joi.string().required(),
    refType: Joi.string().valid('Task', 'User').required(),
    refId: Joi.string().required(),
    message: Joi.string().trim().required(),
  }); 
  return schema.validate(obj);
}

const validateUpdateNotification = (obj) => {
  const schema = Joi.object({
    title: Joi.string().trim(),
    message: Joi.string().trim(),
  }); 
  return schema.validate(obj);
}

module.exports = {
  Notification,
  validateCreateNotification,
  validateUpdateNotification
};
