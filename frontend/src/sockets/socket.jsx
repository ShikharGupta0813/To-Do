import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
  transports: ['websocket'], // for better real-time performance
});

export default socket;
