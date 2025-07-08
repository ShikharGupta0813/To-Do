import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import "./kanbanboard.css";

const TaskFormModal = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState(task ? task.title : "");
  const [description, setDescription] = useState(task ? task.description : "");
  const [priority, setPriority] = useState(task ? task.priority : "Medium"); 
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      if (task) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/tasks/${task._id}`,
          {
            title,
            description,
            priority,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Task updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/tasks`,
          {
            title,
            description,
            priority,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Task created successfully");
      }
      onSave(); // ✅ Refresh Kanban
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save task");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{task ? "Edit Task" : "Add New Task"}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          ></textarea>
          <label>Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
