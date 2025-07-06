import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../sockets/socket';

const ActivityLogPanel = () => {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

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
    fetchLogs();

    // Listen for real-time log updates
    socket.on('update-logs', (latestLogs) => {
      setLogs(latestLogs);
    });

    return () => {
      socket.off('update-logs');
    };
  }, []);

  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
      <h3>Activity Logs (Last 20 Actions)</h3>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            {log.user?.username || 'Unknown User'}: {log.action} at {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogPanel;
