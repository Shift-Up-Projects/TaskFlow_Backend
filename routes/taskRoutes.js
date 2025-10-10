const express = require('express');
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPriority,
  toggleTaskStatus
} = require('../controllers/taskController');
;

const { verifyTokenAndAdmin,verifyToken, verifyTokenAndOnlyUser } = require('../middlewares/verifyToken');
const validateObjectId = require("../middlewares/validateObjectId");



// /api/tasks
router.route('/')
  .get(getAllTasks)
  .post(verifyToken,createTask);

// /api/tasks/:id
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.route('/priority/:id/:taskId')
  .put(validateObjectId, verifyTokenAndOnlyUser, updateTaskPriority);

router.route('/toggle-status/:id/:taskId')
  .put(validateObjectId, verifyTokenAndOnlyUser, toggleTaskStatus);

module.exports = router;
