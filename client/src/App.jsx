import NavComponent from './components/Nav/Nav';
import ProtectedRoutes from './ProtectedRoutes';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useGlobalStore from './store/useGlobalStore';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import ReactGA from "react-ga4";

import { useFocusStore } from './store/useFocusStore';
import { useTaskStore } from './store/useTaskStore';

function AppContent() {
  const location = useLocation();
  const { user, isLoggedIn, loadingAuth, authChecked, initApp, logout } = useGlobalStore();
  const isFocusMode = useGlobalStore(state => state.isFocusMode);

  useEffect(() => {
    initApp();

    const onLogout = () => {
      // Clear focus state completely to prevent data bleed
      useFocusStore.setState({
        isFocusMode: false,
        focusStartTime: null,
        focusCompletedTasks: [],
        focusTaskChanges: []
      });
      // Clear task state completely to prevent data bleed between users
      useTaskStore.setState({
        tasks: [],
        qtasks: [],
        error: null,
        loadingTasks: false
      });
    };
    window.addEventListener('logout', onLogout);
    return () => window.removeEventListener('logout', onLogout);
  }, [initApp]);

  useEffect(() => {
    if (import.meta.env.VITE_GA_ID) {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      });
    }
  }, [location]);

  if (!authChecked) {
    return <div style={{ padding: 50, textAlign: 'center' }}>Checking session...</div>;
  }

  return (
    <>
      <NavComponent
        user={user}
        loading={loadingAuth}
        isLoggedIn={isLoggedIn}
        onLogout={logout}
        isFocusMode={isFocusMode}
      />
      <ProtectedRoutes />
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
