import { useNavigate } from 'react-router-dom';

const Homepage = () => {
  const navigate = useNavigate();

  const handleNav = () => {
    navigate('/login');
  };

  return (
    <>
      <h1>Hello, this is Kanban Board</h1>
      <button onClick={handleNav}>Go to Login</button>
    </>
  );
};

export default Homepage;
