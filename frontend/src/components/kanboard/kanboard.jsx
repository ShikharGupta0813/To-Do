import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../sockets/socket';
import ConflictModal from './conflictModal';
import TaskFormModal from './TaskFormModal';
import './kanbanboard.css';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem('token');
  const [logs, setLogs] = useState([]);


  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();

  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        { status: newStatus, version: task.version },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit('task-updated', {
        action: `Updated task status to ${newStatus}`,
        userId: JSON.parse(localStorage.getItem('user')).id,
      });
      fetchTasks();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflict({
          clientTask: { ...task, status: newStatus },
          serverTask: err.response.data.currentTask,
          taskId,
        });
      } else {
        console.error(err);
      }
    }
  };
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSmartAssign = async (taskId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/tasks/smart-assign/${taskId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socket.emit('task-updated', {
        action: `Smart assigned task`,
        userId: JSON.parse(localStorage.getItem('user')).id,
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, status);
    setDragOverStatus(null);
  };

  const handleResolveConflict = async (action) => {
    if (action === 'overwrite') {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/tasks/${conflict.taskId}`,
          { status: conflict.clientTask.status, version: conflict.serverTask.version },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        socket.emit('task-updated', {
          action: `Forced overwrite task`,
          userId: JSON.parse(localStorage.getItem('user')).id,
        });
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    } else {
      fetchTasks();
    }
    setConflict(null);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const statuses = ['Todo', 'In Progress', 'Done'];

  return (
    <div className="kanban-page">
      <h1 className="kanban-title">Kanban Board</h1>
      <button className="add-task-btn" onClick={handleAddTask}>+ Add Task</button>

      <div className="kanban-board">
        {statuses.map((status) => (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
            className={`kanban-column ${dragOverStatus === status ? 'drag-over' : ''}`}
          >
            <div className="column-header">
              <h3>{status}</h3>
              <span className="task-count">{tasks.filter((task) => task.status === status).length}</span>
            </div>
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="task-card"
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <span className="status-badge">{task.status}</span>
                  <div className="task-actions">
                    <button onClick={() => handleSmartAssign(task._id)}>Smart Assign</button>
                    <button onClick={() => handleEditTask(task)}>Edit</button>
                    <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="activity-log-panel">
        <h3>Activity Logs (Last 20 Actions)</h3>
        <ul>
          {tasks.slice(0, 20).map((log, idx) => (
            <li key={idx} className="log-item">
              Task: {log.title} — Status: {log.status}
            </li>
          ))}
        </ul>
      </div>

      <ConflictModal
        show={!!conflict}
        clientTask={conflict?.clientTask}
        serverTask={conflict?.serverTask}
        onMerge={() => handleResolveConflict('merge')}
        onOverwrite={() => handleResolveConflict('overwrite')}
        onClose={() => setConflict(null)}
      />

      {showModal && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchTasks();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
