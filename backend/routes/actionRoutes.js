const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');
const { protect } = require('../middleware/authMiddleware');

// Apply to all task routes
router.use(protect);


//  Fetch last 20 action logs
router.get('/', async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
