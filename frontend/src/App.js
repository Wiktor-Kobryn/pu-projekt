import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Search, MessageSquare, GraduationCap } from 'lucide-react';
import { AppProvider } from './AppContext';
import AnalysisPage from './pages/AnalysisPage';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import './App.css'; 


import AddTextPage from './pages/AddTextPage';

const Navbar = () => {
  const location = useLocation();
  
  const getLinkClass = (path) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar">
      <div className="brand">NAUKA AI</div>
      
      <Link to="/" className={getLinkClass("/")}>
        <FileText size={20} /> Dodaj tekst
      </Link>
      
      <Link to="/analiza" className={getLinkClass("/analiza")}>
        <Search size={20} /> Analiza
      </Link>
      
      <Link to="/chat" className={getLinkClass("/chat")}>
        <MessageSquare size={20} /> Zadaj pytania
      </Link>
      
      <Link to="/quiz" className={getLinkClass("/quiz")}>
        <GraduationCap size={20} /> Quiz
      </Link>
    </nav>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<AddTextPage />} />
            <Route path="/analiza" element={<AnalysisPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;