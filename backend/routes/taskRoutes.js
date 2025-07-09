module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const Task = require("../models/Task");
  const User = require("../models/User");
  const ActionLog = require("../models/ActionLog");
  const { protect } = require("../middleware/authMiddleware");

  // Protect all task routes
  router.use(protect);

  router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUser", "username");
    
    // Sort by priority High > Medium > Low
    const priorityOrder = { High: 3, Medium: 2, Low: 1 };
    const sortedTasks = tasks.sort(
      (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    res.json(sortedTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  //  Create a new task
  router.post("/", async (req, res) => {
    try {
      const forbiddenTitles = ["Todo", "In Progress", "Done"];
      const { title } = req.body;

      // Check if title is forbidden
      if (forbiddenTitles.includes(title)) {
        return res
          .status(400)
          .json({ message: "Task title cannot be same as column names" });
      }

      // Check for duplicate task title (within board)
      const existingTask = await Task.findOne({ title });
      if (existingTask) {
        return res.status(400).json({ message: "Task title must be unique" });
      }
      const newTask = await Task.create(req.body);

      await ActionLog.create({
        user: req.user.id,
        action: `Created new task "${newTask.title}"`,
        timestamp: new Date(),
      });

      const latestLogs = await ActionLog.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .populate("user", "username");
      io.emit("update-logs", latestLogs);

      res.json(newTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  
  router.put("/:id", async (req, res) => {
    try {
      const task = await Task.findById(req.params.id); 
      if (!task) return res.status(404).json({ message: "Task not found" });
      

      const forbiddenTitles = ["Todo", "In Progress", "Done"];
      const { title } = req.body;

      
      if (title && forbiddenTitles.includes(title)) {
        return res
          .status(400)
          .json({ message: "Task title cannot be same as column names" });
      }

      //  Check duplicate titles 
      if (title) {
        const existingTask = await Task.findOne({
          title,
          _id: { $ne: req.params.id },
        });
        if (existingTask) {
          return res.status(400).json({ message: "Task title must be unique" });
        }
      }

      // ✅ Version conflict check
      if (req.body.version !== undefined && task.version !== req.body.version) {
        return res
          .status(409)
          .json({ message: "Conflict detected", currentTask: task });
      }

      //  Now Compare Changes
      const isStatusChange = req.body.status && req.body.status !== task.status;
      const isTitleChange = req.body.title && req.body.title !== task.title;
      const isDescriptionChange =
        req.body.description && req.body.description !== task.description;
      const isPriorityChange =
        req.body.priority && req.body.priority !== task.priority;

      let actionMessage = "";
      if (isStatusChange) {
        actionMessage += `Changed status of task "${task.title}" from "${task.status}" to "${req.body.status}" `;
      }
      if (isTitleChange && isDescriptionChange && isPriorityChange) {
      } else if (isTitleChange && isDescriptionChange) {
        actionMessage += `Edited Task : Changed Title and Description of "${task.title}" `;
      } else if (isTitleChange && isPriorityChange) {
        actionMessage += `Edited Task : Changed Title and Priority of "${task.title}" `;
      } else if (isDescriptionChange && isPriorityChange) {
        actionMessage += `Edited Task : Changed Priority and Description of "${task.title}" `;
      } else if (isTitleChange) {
        actionMessage += `Edited Task : Changed Title of "${task.title}" to "${req.body.title} `;
      } else if (isDescriptionChange) {
        actionMessage += `Edited Task : Changed Description of "${task.title}" to "${req.body.description}" `;
      } else if (isPriorityChange) {
        actionMessage += `Edited Task : Changed Priority of "${task.title}" to "${req.body.priority}" `;
      }

      //  Update Task in DB
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
         { ...req.body, version: task.version + 1 },
        { new: true }
      );

      //  Log the Action (only if changes detected)
      if (actionMessage.trim() !== "") {
        await ActionLog.create({
          user: req.user.id,
          action: actionMessage.trim(),
          timestamp: new Date(),
        });
      }

      //  Emit Updated Logs via Socket
      const latestLogs = await ActionLog.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .populate("user", "username");
      io.emit("update-logs", latestLogs);

      res.json(updatedTask);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  //  Delete a task
  routr.delete("/:id", async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      await Task.findByIdAndDelete(req.params.id);

      await ActionLog.create({
        user: req.user.id,
        action: `Deleted task "${task.title}"`,
        timestamp: new Date(),
      });

      const latestLogs = await ActionLog.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .populate("user", "username");
      io.emit("update-logs", latestLogs);

      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  //  Assign task to user with fewest active tasks
  router.post("/smart-assign/:taskId", async (req, res) => {
    try {
      const users = await User.find({});
      let minTasks = Infinity;
      let targetUser = null;

      for (let user of users) {
        const count = await Task.countDocuments({
          assignedUser: user._id,
          status: { $ne: "Done" },
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

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      await ActionLog.create({
        user: req.user.id,
        action: `Smart Assign: Assigned task "${task.title}" to ${targetUser.username}`,
        timestamp: new Date(),
      });

      const latestLogs = await ActionLog.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .populate("user", "username");

      io.emit("update-logs", latestLogs);

      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  return router;
};
