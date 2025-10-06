import { useEffect, useCallback, useState, useRef } from 'react';
import './LoginPage.css';
import illustration from '../../assets/login-illustration.svg';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../Config'

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const initRef = useRef(false); // guard to prevent double init

  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);

        if (onLoginSuccess) {
          const ok = await onLoginSuccess(); // verifies token with backend
          if (ok) {
            navigate('/home');
          } else {
            // verification failed
            localStorage.removeItem('token');
            navigate('/login');
          }
        } else {
          navigate('/home');
        }
      } else {
        console.error('Login failed:', data.message);
        // optionally show a toast
      }
    } catch (err) {
      console.error('Error during login:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, onLoginSuccess]);

  useEffect(() => {
    // If token exists, validate it via onLoginSuccess instead of blind navigate
    const token = localStorage.getItem('token');
    if (token && onLoginSuccess) {
      (async () => {
        setLoading(true);
        const ok = await onLoginSuccess();
        setLoading(false);
        if (ok) navigate('/home');
        else localStorage.removeItem('token');
      })();
      return;
    }

    // init Google sign-in once
    if (initRef.current) return;
    initRef.current = true;

    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin'),
          { theme: 'outline', size: 'large', width: '300' }
        );

        // Prompt can be intrusive; comment out if not wanted or call it conditionally.
        window.google.accounts.id.prompt();
      }
    };

    // If you included the script in index.html, it may already be available:
    if (window.google && window.google.accounts) {
      initGoogleSignIn();
    } else {
      // otherwise, dynamically add script (safe fallback)
      const scriptId = 'google-signin-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.id = scriptId;
        script.onload = initGoogleSignIn;
        document.body.appendChild(script);
      } else {
        initGoogleSignIn();
      }
    }
  }, [handleCredentialResponse, navigate, onLoginSuccess]);

  return (
    <div className="login-container">
      <div className="illustration">
        <img src={illustration} alt="Login Illustration" />
      </div>
      <div className="login-box">
        <h2>Welcome Back 👋</h2>
        <p>Login using your Google Account to continue</p>
        <div id="google-signin" className="google-signin"></div>
        {loading && <p>Signing in...</p>}
      </div>
    </div>
  );
}

export default LoginPage;
