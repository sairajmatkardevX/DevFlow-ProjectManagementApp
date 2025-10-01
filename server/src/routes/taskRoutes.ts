import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getUserTasks
} from '../controllers/taskController';

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);
router.get('/user/:userId', getUserTasks);

export default router;