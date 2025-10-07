const cron = require("node-cron");
const { required, ref } = require("joi");
const mongoose=require("mongoose");
const Joi = require('joi');
//Task Schema
const TaskSchema=new mongoose.Schema({
title:{
    type:String,
    required:true,
    trim:true,
},
user_id:{
      type : mongoose.Schema.ObjectId,
      ref : 'User',
      required : [true, 'Please enter name  user'],
     },
description:{
    type:String,
    required:true,
    trim:true,
    minlength:5,
},
status:{
    type:String,
    enum:['pending','in-progress','completed', 'not-completed'],
    default:'pending',
    required:true,
},
priority:{
    type: String,
    enum: ['high', 'mid', 'low'],
    default: 'mid',
    required: true
},
dueDate:{
    type:Date,
    required:true,  
},
startDate:{
    type:Date,
    required:true,  
}
},{timestamps:{
    createdAt:'created_at',
    updatedAt:'updated_at'
}});

const Task=mongoose.model("Task",TaskSchema);




//Validate Create Task
function validateCreateTask(obj){
const schema=Joi.object({
title:Joi.string().trim().required(),
 user_id:Joi.string().required(),
description:Joi.string().trim().min(5).required(),
status:Joi.string().valid('pending','in-progress','completed', 'not-completed').required(),
priority:Joi.string().valid('high', 'mid', 'low').required(),
dueDate:Joi.date().required(),
startDate:Joi.date().required(),
});  
return schema.validate(obj);
}

//Validate Update Task
function validateUpdateTask(obj){
  const schema=Joi.object({
title:Joi.string().trim(),
user_id:Joi.string(),
description:Joi.string().trim().min(5),
status:Joi.string().valid('pending','in-progress','completed', 'not-completed'),
priority:Joi.string().valid('high', 'mid', 'low'),
dueDate:Joi.date(),
startDate:Joi.date(),
});  
return schema.validate(obj);//return error if its not complete

}

//validate Update Task Priority
function validateUpdateTaskPriority(obj){
  const schema=Joi.object({
    priority:Joi.string().valid('high', 'mid', 'low'),
});  
return schema.validate(obj);

}



cron.schedule("*/5 * * * *", async () => { // كل 5 دقائق
  const startTime = Date.now();
  const currentDate = new Date();

  try {
    console.log(`[CRON] Task update started at ${new Date().toISOString()}`);

    await Task.updateMany(
      { startDate: { $lte: currentDate }, status: 'pending' },
      { $set: { status: 'in-progress' } }
    );

    await Task.updateMany(
      { dueDate: { $lt: currentDate }, status: 'in-progress' },
      { $set: { status: 'not-completed' } }
    );

    const endTime = Date.now();
    console.log(`[CRON] Task update finished in ${endTime - startTime}ms`);
  } catch (error) {
    console.error("[CRON] Error in tasks update", error);
  }
});

module.exports={Task,validateCreateTask,validateUpdateTask, validateUpdateTaskPriority};

