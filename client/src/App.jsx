import NavComponent from './components/Nav/Nav';
import ProtectedRoutes from './ProtectedRoutes';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useGlobalStore from './store/useGlobalStore';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import ReactGA from "react-ga4";

import { useFocusStore } from './store/useFocusStore';

function AppContent() {
  const location = useLocation();
  const { user, isLoggedIn, loadingAuth, authChecked, initApp, logout } = useGlobalStore();

  useEffect(() => {
    initApp();

    const onLogout = () => {
      useFocusStore.setState({ isFocusMode: false });
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
  }, [location.pathname, location.search]);

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
      />
      <br />
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
