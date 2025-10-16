const asyncHandler = require('express-async-handler');
const {validateCreateTask,validateUpdateTask,Task, validateUpdateTaskPriority}=require("../models/Task");
const { User } = require('../models/User');
const { createAndSendMessageNotification } = require('../utils/firebaseNotification');
const { Notification } = require('../models/Notification');
/*
@desc Get all tasks 
@route /api/tasks/:id
@metod GET
@access public
*/ 

const getAllTasks = asyncHandler(
  //Comparison Query Operators
  async(req,res)=>{//callback func
try {
    // 1️⃣ استخراج الكويريات
    const { status, priority } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2️⃣ بناء فلتر ديناميكي حسب الكويريات
    const filter = {};
    filter.user_id = req.user.id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // 3️⃣ تنفيذ الاستعلام مع الباجينيشن
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Task.countDocuments(filter)
    ]);

    // 4️⃣ الرد
    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      hasNextPage: page * limit < total,
      filterUsed: filter,
      data: tasks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/*
@desc Get task By Id 
@route /api/tasks/:id/:taskId
@metod GET
@access public
*/ 
const getTaskById = asyncHandler(
  async(req,res)=>{//callback func
  const task= await Task.findById(req.params.taskId);
  if(task){
  res.status(200).json(task);
}else{
   res.status(400).json({message:"task not found"});
}});

/*
@desc Create New task 
@route /api/tasks
@metod POST
@access Private (only admin )
*/ 
const createTask = asyncHandler(
  async(req,res)=>{//callback func

  const {error}=validateCreateTask(req.body);

  if(error){
  return res.status(400).json({message: error.details[0].message});//400 error from client
}

const task= new Task({
title:req.body.title,
user_id: req.user.id,
description:req.body.description,
status: "pending",
priority:req.body.priority,
dueDate:req.body.dueDate,
startDate:req.body.startDate,
});
const result= await task.save();

const user = await User.findById(result.user_id);

  const createdForUser = user._id;
  const title = "New Task Created";
  const refType = "Task";
  const refId = result._id;
  const body = `${user.username}, You must work hard to reach your goal, let's go to complete your task.`;
  createAndSendMessageNotification(createdForUser, refType, refId, title, body);

res.status(201).json(result);//201 => created successfully
});

/*
@desc Update New task 
@route /api/tasks/:id/:taskId
@metod PUT
@access Private (only admin )
*/ 
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, startDate } = req.body;

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.taskId,
    {
      $set: {
        title,
        description,
        priority,
        dueDate,
        startDate
      },
    },
    { new: true }
  );

  res.status(200).json(updatedTask);
});

/*
@desc Delete New task 
@route /api/tasks/:id/:taskId
@metod DELETE
@access Private (only admin )
*/ 
const deleteTask = asyncHandler(
  async(req,res)=>{
 
const task=await Task.findById(req.params.taskId);
if(task){
  await Task.findByIdAndDelete(req.params.taskId);
  
  const delNotifications = await Notification.find({ refId: req.params.taskId  });
  for(const delNotification of delNotifications) {
    await Notification.findByIdAndDelete(delNotification._id);
  }
  
  res.status(200).json({massage: "task has been deleted"});
}else{
  res.status(404).json({massage: "task not found"});
}
})


// 🔹 دالة لتحديث أولوية المهمة
const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      { priority },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(200).json({
      success: true,
      message: "Task priority updated successfully",
      data: task
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔹 دالة لتبديل حالة المهمة (من in-progress إلى completed أو العكس)
const toggleTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if(task.status === 'pending'){
      return res.status(400).json({ message: 'the task is pending, not allowed to toggled its status' })
    }

    // بدّل الحالة
    task.status = task.status === "completed" ? "in-progress" : "completed";
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status toggled successfully",
      data: task,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports={
     getAllTasks,
     getTaskById,
     createTask,
     updateTask, 
     deleteTask,
     updateTaskPriority,
     toggleTaskStatus 
};