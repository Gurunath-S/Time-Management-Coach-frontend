import './App.css';
import Home from './components/Home/Home';
import HelpPage from './components/HelpPage/HelpPage';
import NavComponent from './components/Nav/Nav';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './components/LoginPage/LoginPage';
import QuickTaskHistory from './components/QtaskHistory/QuickTaskHistory';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('https://time-management-coach-backend.onrender.com/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  }; 
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <>
      <BrowserRouter>
      {/* {isLoggedIn ? <NavComponent user={user} />: <LoginPage onLoginSuccess={fetchUserProfile} />} */}
      <NavComponent user={user} />
        <Routes>
          <Route
            path="/"
            element={isLoggedIn ? <Home /> : <LoginPage onLoginSuccess={fetchUserProfile} />}
          />
          <Route
            path="/home"
            element={<Home />}
          />
          <Route
            path="/help"
            element={<HelpPage/>}
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={fetchUserProfile} />}
          />
          <Route
            path='/quick-task-history'
            element={<QuickTaskHistory/>}
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </>
  );
}

export default App;
