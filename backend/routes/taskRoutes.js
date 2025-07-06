const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Apply to all task routes
router.use(protect);


// ✅ GET: Get all tasks (for Kanban Board)
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST: Create a new task
router.post('/', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ PUT: Update a task (title, description, status, priority, assignedUser)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Conflict Check (compare versions sent by frontend)
    if (req.body.version !== undefined && task.version !== req.body.version) {
      return res.status(409).json({ message: 'Conflict detected', currentTask: task });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE: Delete a task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ POST: Smart Assign — Assign task to user with fewest active tasks
router.post('/smart-assign/:taskId', async (req, res) => {
  try {
    const users = await User.find({});
    let minTasks = Infinity;
    let targetUser = null;

    for (let user of users) {
      const count = await Task.countDocuments({
        assignedUser: user._id,
        status: { $ne: 'Done' }
      });
      if (count < minTasks) {
        minTasks = count;
        targetUser = user;
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { assignedUser: targetUser._id },
      { new: true }
    );

   } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
