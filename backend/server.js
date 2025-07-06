const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const ActionLog = require('./models/ActionLog');
const actionRoutes = require('./routes/actionRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

connectDB();

app.use(cors());
app.use(express.json());

app.use('/actions', actionRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

io.on('connection', (socket) => {
  console.log('Client Connected');

  socket.on('task-updated', async ({ action, userId }) => {
    await ActionLog.create({ action, user: userId });
    const last20 = await ActionLog.find().sort({ timestamp: -1 }).limit(20).populate('user', 'username');
    io.emit('update-logs', last20);
  });

  socket.on('disconnect', () => console.log('Client Disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
