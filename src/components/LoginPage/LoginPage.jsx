import { useEffect, useCallback, useState } from 'react';
import './LoginPage.css';
import illustration from '../../assets/login-illustration.svg';
import { useNavigate } from 'react-router-dom';

function LoginPage({onLoginSuccess}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await fetch('https://time-management-coach-backend.onrender.com/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        if(onLoginSuccess){
            await onLoginSuccess();
        }
        navigate('/home')
      } else {
        console.error('Login failed:', data.message);
      }
      } catch (err) {
        console.error('Error during login:', err);
      } finally {
        setLoading(false);
      }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
      return;
    }

    // Load Google One Tap
    const scriptId = 'google-signin-script';
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

        window.google.accounts.id.prompt();
      }
    };

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
  }, [handleCredentialResponse, navigate]);

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
