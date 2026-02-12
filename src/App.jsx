// App.jsx
import './App.css';
import Home from './components/Home/Home';
import HelpPage from './components/HelpPage/HelpPage';
import NavComponent from './components/Nav/Nav';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './components/LoginPage/LoginPage';
import QuickTaskHistory from './components/QtaskHistory/QuickTaskHistory';
import EditPriorityTags from './components/EditTags/EditTags';
import EditTaskPage from './components/EditTask/EditTask';
import BACKEND_URL from '../Config';
import ReactGA from "react-ga4";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_GA_ID) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      });
    }
  }, [location]);

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
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
      setAuthChecked(true);
      return false;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data.user);
      setIsLoggedIn(true);
      setLoading(false);
      setAuthChecked(true);
      return true;
    } catch {
      toast.error("Session expired. Please log in again.");
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
      setIsLoggedIn(true);
      setLoading(false);
      setAuthChecked(true);

      fetchUserProfile().then(profileFetched => {
        if (!profileFetched) {
          setIsLoggedIn(false);
          setUser(null);
          navigate('/login');
        }
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      setAuthChecked(true);
    }

    const onLogoutEvent = () => {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
      setLoading(false);
    };

    window.addEventListener('logout', onLogoutEvent);
    return () => window.removeEventListener('logout', onLogoutEvent);
  }, [fetchUserProfile, navigate]);

  useEffect(() => {
    const handleOffline = () => {
      toast.error("You're offline. Check your internet connection.");
    };

    const handleOnline = () => {
      toast.info("Back online!");
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setIsLoggedIn(false);
    setLoading(false);
  };

  if (!authChecked) {
    return <div style={{ padding: 50, textAlign: "center" }}>Checking session...</div>;
  }

  return (
    <>
      <NavComponent
        user={user}
        loading={loading}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} : <LoginPage onLoginSuccess={fetchUserProfile} />}
        />
        <Route
          path="/home"
          element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} : <LoginPage onLoginSuccess={fetchUserProfile} />}
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} : <LoginPage onLoginSuccess={fetchUserProfile} />} />
        <Route path="/quick-task-history" element={<QuickTaskHistory />} />
        <Route path="/edit-tags/:id" element={<EditPriorityTags />} />
        <Route path="/edit-tasks/:id" element={<EditTaskPage />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={1500} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
