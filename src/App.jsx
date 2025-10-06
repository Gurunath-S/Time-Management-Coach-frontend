// App.jsx
import './App.css';
import Home from './components/Home/Home';
import HelpPage from './components/HelpPage/HelpPage';
import NavComponent from './components/Nav/Nav';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './components/LoginPage/LoginPage';
import QuickTaskHistory from './components/QtaskHistory/QuickTaskHistory';
import EditPriorityTags from './components/EditTags/EditTags';
import EditTaskPage from './components/EditTask/EditTask';
import BACKEND_URL from '../Config';
import { toast } from 'react-toastify';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is seconds since epoch
      return payload.exp < Math.floor(Date.now()/1000);
    } catch (e) {
      // broken token -> treat as expired
      return true;
    }
  }

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      setAuthChecked(true); // ✅
      return false;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
        setAuthChecked(true); 
        return false;
      }

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
        setLoading(false);
        setAuthChecked(true); 
        return true;
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
        setLoading(false);
        setAuthChecked(true); 
        return false;
      }
    } catch (err) {
      console.error('Profile fetch failed', err);
      toast.error("Unable to connect to server. Please try again later.");
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
      setAuthChecked(true); 
      return false;
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      // stay logged in immediately
      setIsLoggedIn(true);
      setLoading(false);
      setAuthChecked(true);

      // optional: fetch user profile in background to update user info
      fetchUserProfile().then(profileFetched => {
        if (!profileFetched) {
          setIsLoggedIn(false);
          setUser(null);
          navigate('/login'); // only redirect if profile actually invalid
        }
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      setAuthChecked(true);
    }

    // listen to global logout event
    const onLogoutEvent = () => {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
    };
    window.addEventListener('logout', onLogoutEvent);
    return () => window.removeEventListener('logout', onLogoutEvent);
  }, [fetchUserProfile]);


  useEffect(() => {
      const handleOffline = () => {
        toast.error("You're offline. Check your internet connection.");
      };
      const handleOnline = () => {
        toast.info("Back online!");
      };

      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);

      // Cleanup when component unmounts
      return () => {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      };
    }, []);


  // handle logout in a React-way and pass to NavComponent
  const handleLogout = () => {
    localStorage.removeItem('token');        // only token removed
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setIsLoggedIn(false);
    setLoading(false);
    // Nav will call navigate('/login') after calling onLogout
  };

  if (!authChecked) {
    return <div style={{ padding: 50, textAlign: "center" }}>Checking session...</div>;
  }

  return (
    <BrowserRouter>
      <NavComponent
        user={user}
        loading={loading}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} /> : <LoginPage onLoginSuccess={fetchUserProfile} />}
        />
        <Route
          path="/home"
          element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} /> : <LoginPage onLoginSuccess={fetchUserProfile} />}
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} /> : <LoginPage onLoginSuccess={fetchUserProfile} />} />
        <Route path="/quick-task-history" element={<QuickTaskHistory />} />
        <Route path="/edit-tags/:id" element={<EditPriorityTags />} />
        <Route path="/edit-tasks/:id" element={<EditTaskPage />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={1500} />
    </BrowserRouter>
  );
}

export default App;
