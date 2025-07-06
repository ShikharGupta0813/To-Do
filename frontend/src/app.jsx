import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import KanbanBoard from './components/kanboard/kanboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KanbanBoard/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
