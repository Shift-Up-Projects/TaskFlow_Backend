const express = require('express');
const router=express.Router();
const {
     getAllTasks,
     getTaskById,
     createTask,
     updateTask, 
     deleteTask,
     getTasksByStatus,
     getTasksByPriority 
    } = require('../controllers/taskController');
const { verifyTokenAndAdmin} = require('../middlewares/verifyToken');
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
  







module.exports= router;