const express = require('express');
const router=express.Router();
const {
     getAllTasks,
     getTaskById,
     createTask,
     updateTask, 
     deleteTask,
     getTasksByStatus,
     getTasksByPriority, 
     updateTaskPriority,
     toggleTaskStatus
    } = require('../controllers/taskController');
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser} = require('../middlewares/verifyToken');
const validateObjectId = require("../middlewares/validateObjectId")

//Http Methods /Verbs
// /api/tasks
router.route('/')
.get(getAllTasks)
.post(createTask);

// /api/tasks/:id
router.route('/:id')
.get(getTaskById)
.put(updateTask)
.delete(deleteTask);

// /api/tasks/status/:status
router.route('/status/:status').get(getTasksByStatus);

// /api/tasks/priority/:priority
router.route('/priority/:priority').get(getTasksByPriority);

router.route('/priority/:id/:taskId')
    .put(validateObjectId, verifyTokenAndOnlyUser, updateTaskPriority);

router.route('/toggle-status/:id/:taskId')
    .put(validateObjectId, verifyTokenAndOnlyUser, toggleTaskStatus);
  







module.exports= router;