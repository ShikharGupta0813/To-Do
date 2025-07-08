import { useNavigate } from 'react-router-dom';
import './page.css';
import myImg from "./images.png" 

const ExpandedLandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">KanbanPro</div>
        <nav className="nav-buttons">
          <button onClick={() => navigate('/login')}>Login</button>
          <button className="primary-btn" onClick={() => navigate('/register')}>
            Register
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Visualize. Organize. Succeed.</h1>
          <p>Manage your tasks effectively with our powerful Kanban Board.</p>
          <button className="cta-btn" onClick={() => navigate('/login')}>
            Try Kanban Board Now
          </button>
        </div>
        <img src={myImg} alt="Kanban Board" className="hero-image" />
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-box">
            <h3>Drag & Drop</h3>
            <p>Easily move tasks between columns to organize your workflow.</p>
          </div>
          <div className="feature-box">
            <h3>Task History</h3>
            <p>Track task changes with automatic activity logs.</p>
          </div>
          <div className="feature-box">
            <h3>Conflict Handling</h3>
            <p>Detect & resolve task conflicts with ease using our smart system.</p>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section className="process-section">
        <h2>Our Simple 4-Step Process</h2>
        <div className="process-grid">
          <div className="process-step">
            <div className="step-number">1</div>
            <h4>Create Account</h4>
            <p>Register and set up your profile quickly.</p>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <h4>Create Boards</h4>
            <p>Make Kanban boards for different projects.</p>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <h4>Add Tasks</h4>
            <p>Add tasks, assign team members & set priorities.</p>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <h4>Track & Complete</h4>
            <p>Visualize progress and complete tasks efficiently.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>Trusted by Growing Businesses</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <p>"KanbanPro has completely streamlined our task management!"</p>
            <h4>- Alex, Project Manager</h4>
          </div>
          <div className="testimonial">
            <p>"We love the simplicity and power of this Kanban tool."</p>
            <h4>- Maya, Startup Founder</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} KanbanPro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ExpandedLandingPage;
