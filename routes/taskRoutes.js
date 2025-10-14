const express = require('express');
const router = express.Router();

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

const { verifyTokenAndAdmin, verifyTokenAndAuthorization, verifyToken, verifyTokenAndOnlyUser } = require('../middlewares/verifyToken');
const validateObjectId = require("../middlewares/validateObjectId");



// /api/tasks
router.route('/:id')
  .get(validateObjectId, verifyTokenAndAuthorization, getAllTasks)

router.route('/')
  .post(verifyToken,createTask);

// /api/tasks/:id
router.route('/:id/:taskId')
  .get(validateObjectId, verifyTokenAndAuthorization, getTaskById)
  .put(validateObjectId, verifyTokenAndAuthorization, updateTask)
  .delete(validateObjectId, verifyTokenAndAuthorization, deleteTask);

router.route('/priority/:id/:taskId')
  .put(validateObjectId, verifyTokenAndOnlyUser, updateTaskPriority);
  .put(validateObjectId, verifyTokenAndOnlyUser, updateTaskPriority);

router.route('/toggle-status/:id/:taskId')
  .put(validateObjectId, verifyTokenAndOnlyUser, toggleTaskStatus);

module.exports = router;

  .put(validateObjectId, verifyTokenAndOnlyUser, toggleTaskStatus);

module.exports = router;
