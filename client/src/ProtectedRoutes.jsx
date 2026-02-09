// src/ProtectedRoutes.jsx
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Home from './components/Home/Home';
import HelpPage from './components/HelpPage/HelpPage';
import LoginPage from './components/LoginPage/LoginPage';
import QuickTaskForm from './components/TaskForm/QuickTaskForm';
import QuickTaskHistory from './components/QtaskHistory/QuickTaskHistory';
import EditPriorityTags from './components/EditTags/EditTags';
import EditTaskPage from './components/EditTask/EditTask';
import FocusSummary from './components/FourQuadrants/ViewSummary/FocusSummary';
import NavComponent from './components/Nav/Nav';
import useGlobalStore from './store/useGlobalStore';
import { toast } from 'react-toastify';

export default function ProtectedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef(false);
  const { isLoggedIn, isFocusMode } = useGlobalStore();

  useEffect(() => {
    const allowedPatterns = [
      /^\/edit-tasks\/[^/]+$/,
      /^\/focus-summary$/,
    ];
    const isAllowed = allowedPatterns.some((p) => p.test(location.pathname));

    if (isFocusMode && !isAllowed && location.pathname !== '/home') {
      if (!toastShownRef.current) {
        toast.warn('Navigation disabled in Focus Mode', { toastId: 'focus-mode-warning' });
        toastShownRef.current = true;
      }
      navigate('/home', { replace: true });
    }

    if (!isFocusMode) {
      toastShownRef.current = false;
    }
  }, [location, isFocusMode, navigate]);

  return (
    <Routes>
      <Route path="/" element={isLoggedIn ? <Home isLoggedIn={isLoggedIn} /> : <LoginPage />} />
      <Route path="/home" element={<RequireAuth><Home isLoggedIn={isLoggedIn} /></RequireAuth>} />
      <Route path="/help" element={<RequireAuth><HelpPage /></RequireAuth>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/time-log" element={<RequireAuth><QuickTaskForm /></RequireAuth>} />
      <Route path="/quick-task-history" element={<RequireAuth><QuickTaskHistory /></RequireAuth>} />
      <Route path="/edit-tags/:id" element={<RequireAuth><EditPriorityTags /></RequireAuth>} />
      <Route path="/edit-tasks/:id" element={<RequireAuth><EditTaskPage /></RequireAuth>} />
      <Route path="/focus-summary" element={<RequireAuth><FocusSummary /></RequireAuth>} />
    </Routes>
  );
}

const RequireAuth = ({ children }) => {
  const { isLoggedIn } = useGlobalStore();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};
