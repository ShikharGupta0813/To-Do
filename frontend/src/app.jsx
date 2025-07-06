import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import KanbanBoard from './components/kanboard/kanboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element= {<h1 hello this is kanban board/>} />
        <Route path="/kanban" element={<KanbanBoard/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
