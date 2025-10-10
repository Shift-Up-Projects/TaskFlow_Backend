const asyncHandler = require('express-async-handler');
const {validateCreateTask,validateUpdateTask,Task}=require("../models/Task");
/*
@desc Get all tasks 
@route /api/tasks
@metod GET
@access public
*/ 

const getAllTasks = asyncHandler(
  //Comparison Query Operators
  async(req,res)=>{//callback func
try {
    // 1️⃣ استخراج الكويريات
    const { status, priority, user_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2️⃣ بناء فلتر ديناميكي حسب الكويريات
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (user_id) filter.user_id = user_id;

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
@route /api/tasks/:id
@metod GET
@access public
*/ 
const getTaskById = asyncHandler(
  async(req,res)=>{//callback func
  const task= await Task.findById(req.params.id);
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
res.status(201).json(result);//201 => created successfully
});

/*
@desc Update New task 
@route /api/tasks/:id
@metod PUT
@access Private (only admin )
*/ 
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, startDate } = req.body;

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
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
@route /api/tasks/:id
@metod DELETE
@access Private (only admin )
*/ 
const deleteTask = asyncHandler(
  async(req,res)=>{
 
const task=await Task.findById(req.params.id);
if(task){
  await Task.findByIdAndDelete(req.params.id);
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


// 🔹 دالة لتبديل حالة المهمة (من pending إلى done أو العكس)
const toggleTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // بدّل الحالة
    task.status = task.status === "done" ? "pending" : "done";
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