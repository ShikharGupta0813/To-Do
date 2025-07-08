import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Homepage from './components/homepage/pag'
import KanbanBoard from './components/kanboard/kanboard';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Homepage/>} />
        <Route path="/kanban" element={<KanbanBoard/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
