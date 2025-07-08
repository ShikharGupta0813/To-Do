import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import Homepage from './components/landingpage/page'
import KanbanBoard from './components/kanboard/kanboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (<>
    <Router>
      <Routes>
      <Route path="/" element={<Homepage/>} />
        <Route path="/kanban" element={<KanbanBoard/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
     <ToastContainer position="top-center" autoClose={3000} />
     </>
  );
}

export default App;
