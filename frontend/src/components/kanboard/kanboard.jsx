import ConflictModal from './conflictModal';
import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../sockets/socket';
import ActivityLogPanel from '../activityLog/activityLogPannel';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [conflict, setConflict] = useState(null);
  const token = localStorage.getItem('token');

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

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('taskId');
    updateTaskStatus(taskId, status);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
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
      fetchTasks(); // Merge → just reload server version
    }
    setConflict(null);
  };

  const statuses = ['Todo', 'In Progress', 'Done'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {statuses.map((status) => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            style={{
              flex: 1,
              padding: '10px',
              border: '2px dashed gray',
              minHeight: '300px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3>{status}</h3>
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  style={{
                    padding: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                    borderRadius: '4px',
                    cursor: 'grab',
                  }}
                >
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <button onClick={() => handleSmartAssign(task._id)}>Smart Assign</button>
                </div>
              ))}
          </div>
        ))}
      </div>

      <ActivityLogPanel />

      {/* Conflict Modal */}
      <ConflictModal
        show={!!conflict}
        clientTask={conflict?.clientTask}
        serverTask={conflict?.serverTask}
        onMerge={() => handleResolveConflict('merge')}
        onOverwrite={() => handleResolveConflict('overwrite')}
        onClose={() => setConflict(null)}
      />
    </div>
  );
};

export default KanbanBoard;
