import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../sockets/socket";
import ConflictModal from "./conflictModal";
import TaskFormModal from "./TaskFormModal";
import "./kanbanboard.css";
import { toast } from "react-toastify";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [conflict, setConflict] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    fetchTasks();
    fetchLogs();

    // Listen to real-time logs
    socket.on("update-logs", (latestLogs) => {
      setLogs(latestLogs);
    });

    return () => {
      socket.off("update-logs");
    };
  }, []);

  const handleSmartAssign = async (taskId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks/smart-assign/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTasks();
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        {
          title: task.title,
          priority: task.priority,
          description: task.description, 
          status: newStatus,
          version: task.version,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      fetchLogs();
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

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverStatus(status);
  };
  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
    setDragOverStatus(null);
  };
  const handleResolveConflict = async (action) => {
  if (action === "overwrite") {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${conflict.taskId}`,
        {
          title: conflict.clientTask.title,
          description: conflict.clientTask.description,
          priority: conflict.clientTask.priority,
          status: conflict.clientTask.status,
          version: conflict.serverTask.version, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      fetchLogs();
      toast.success("Task overwritten successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to overwrite task");
    }
  } else {
    fetchTasks();
    fetchLogs();
    toast.info("Kept server version");
  }
  setConflict(null);
  setEditingTask(null);
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
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
        fetchLogs();
        toast.success("Task deleted sucessfully");
      } catch (err) {
        console.error(err);
        toast.error("Task is not deleted");
      }
    }
  };

  const statuses = ["Todo", "In Progress", "Done"];

  return (
    <div className="kanban-page">
      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
      <h1 className="kanban-title">Kanban Board</h1>
      <button className="add-task-btn" onClick={handleAddTask}>
        + Add Task
      </button>

      <div className="kanban-board">
        {statuses.map((status) => (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
            className={`kanban-column ${
              dragOverStatus === status ? "drag-over" : ""
            }`}
          >
            <div className="column-header">
              <h3>{status}</h3>
              <span className="task-count">
                {tasks.filter((task) => task.status === status).length}
              </span>
            </div>
            <div className="tasks-container">
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
                    <section className="status-badge">{task.status}</section>
                    <section className="priority-badge">
                      Priority: {task.priority}
                    </section>

                    <div className="task-actions">
                      <button onClick={() => handleSmartAssign(task._id)}>
                        Smart Assign
                      </button>
                      <button onClick={() => handleEditTask(task)}>Edit</button>
                      <button onClick={() => handleDeleteTask(task._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="activity-log-panel">
        <h3>Activity Logs (Last 20 Actions)</h3>
        <ul>
          {logs.slice(0, 20).map((log, idx) => (
            <li key={idx} className="log-item">
              {log.user?.username || "Unknown User"}: {log.action} at{" "}
              {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>

      <ConflictModal
        show={!!conflict}
        clientTask={conflict?.clientTask}
        serverTask={conflict?.serverTask}
        onMerge={() => handleResolveConflict("merge")}
        onOverwrite={() => handleResolveConflict("overwrite")}
        onClose={() => setConflict(null)}
      />

      {showModal && !conflict && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchTasks();
            fetchLogs();
            setShowModal(false);
          }}
          setConflict={setConflict} 
        />
      )}
    </div>
  );
};

export default KanbanBoard;
