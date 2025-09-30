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
const tasks=await Task.find();
  res.status(200).json(tasks);
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
user_id :req.body.user_id,
description:req.body.description,
status:req.body.status,
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
const updateTask =asyncHandler(
  async(req,res)=>{
 
  const {error}=validateUpdateTask(req.body);
 
  if(error){
  return res.status(400).json({message: error.details[0].message});//400 error from client
}
const updatedTask= await Task.findByIdAndUpdate(req.params.id,{
$set:{
title:req.body.title,
user_id :req.body.user_id,
description:req.body.description,
status:req.body.status,
priority:req.body.priority,
dueDate:req.body.dueDate,
startDate:req.body.startDate,
}
},{new:true})
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

//NEED TO MAKE SURE THAT THE STATUS & PRIORITY ROUTES WORKS//////

/*
@desc get Tasks By Status 
@route /api/tasks/status/:status
@metod GET
@access Public
*/ 
const getTasksByStatus = asyncHandler(
  async(req,res)=>{
 const task = await Task.find({ status: req.params.status });
 if (task){   
    res.status(200).json(task);
}else {
    res.status(500).json({ message: error.message });
  }
});


/*
@desc get Tasks By Priority 
@route /api/tasks/priority/:priority
@metod GET
@access Public
*/ 
const getTasksByPriority = asyncHandler(
    async (req, res) => {
    const tasks = await Task.find({ priority: req.params.priority });
    if (tasks){   
    res.status(200).json(tasks);
}else {
    res.status(500).json({ message: error.message });
  }
});

module.exports={
     getAllTasks,
     getTaskById,
     createTask,
     updateTask, 
     deleteTask,
     getTasksByStatus,
     getTasksByPriority 
};