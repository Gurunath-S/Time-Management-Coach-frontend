import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../Config';
import useGlobalStore from '../../store/useGlobalStore';
import './LoginPage.css';
import ibtLogo from '../../assets/ibt-logo1.png';
import tech4uLogo from '../../assets/tech4u-logo.webp';
import logintmc from '../../assets/tmc-login.png';

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSlowLoadingMsg, setShowSlowLoadingMsg] = useState(false);
  const initRef = useRef(false);
  const initApp = useGlobalStore(state => state.initApp);
  const loginSuccess = useGlobalStore(state => state.loginSuccess);

  // Generate random particles for background
  const particles = useState(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.floor(Math.random() * 30) + 10; // 10px to 40px
      const shapeType = Math.random();
      let shape = 'circle';
      if (shapeType > 0.66) shape = 'square';
      else if (shapeType > 0.33) shape = 'triangle';

      return {
        id: i,
        left: Math.floor(Math.random() * 100),
        size: size,
        delay: -Math.floor(Math.random() * 20), // Use negative delay so they appear instantly mid-animation
        duration: Math.floor(Math.random() * 15) + 10, // 10s to 25s
        shape: shape
      };
    });
  })[0];


  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        await loginSuccess(data.token, data.user);
        navigate('/home');
      } else {
        console.error('Login failed', data);
      }
    } catch (err) {
      console.error('Error during login', err);
    } finally {
      setLoading(false);
    }
  }, [navigate, loginSuccess]);

  useEffect(() => {
    let timer;
    if (loading) {
      // If loading takes more than 5 seconds, assume a cold start
      timer = setTimeout(() => {
        setShowSlowLoadingMsg(true);
      }, 5000);
    } else {
      setShowSlowLoadingMsg(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    // If token exists, bootstrap
    const token = localStorage.getItem('token');
    if (token) {
      (async () => {
        setLoading(true);
        await initApp();
        setLoading(false);
        if (useGlobalStore.getState().isLoggedIn) navigate('/home');
        else localStorage.removeItem('token');
      })();
      return;
    }

    if (initRef.current) return;
    initRef.current = true;

    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(document.getElementById('google-signin'), {
          theme: 'outline',
          size: 'large',
          width: '280'
        });

        const isAuthError = sessionStorage.getItem('authError');
        if (!isAuthError) {
          window.google.accounts.id.prompt();
        } else {
          sessionStorage.removeItem('authError');
        }
      }
    };

    if (window.google && window.google.accounts) {
      initGoogleSignIn();
    } else {
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
  }, [handleCredentialResponse, initApp, navigate]);

  return (
    <div className="login-container">
      <div className="animated-background">
        <ul className="circles">
          {particles.map((particle) => (
            <li
              key={particle.id}
              style={{
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                borderRadius: particle.shape === 'square' ? '4px' : particle.shape === 'circle' ? '50%' : '0',
                clipPath: particle.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                background: particle.shape === 'triangle' ? 'rgba(78, 84, 200, 0.35)' : 'rgba(78, 84, 200, 0.25)'
              }}
            ></li>
          ))}
        </ul>
      </div>
      <div className="content-wrapper">

        {/* Main Login Card */}
        <div className="login-card-wrapper">
          {/* Left Side - Brand Visual */}
          <div className="login-brand-section">
            <div className="brand-content">
              <img src={logintmc} alt="Time Management Coach" className="brand-logo-main" />
              <h1>Time Management Coach</h1>
              <p className="tagline">Master your time. Master your life.</p>
              <div className="feature-pills">
                <span>Focus</span>
                <span>Clarity</span>
                <span>Growth</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className="form-header">
              <h2>Welcome Back 👋</h2>
              <p>Login using your Google Account to continue</p>
            </div>

            <div
              className="google-btn-container"
              style={{ display: loading ? 'none' : 'block' }}
            >
              <div id="google-signin"></div>
            </div>

            {loading && (
              <div className="loading-state-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">
                  {showSlowLoadingMsg
                    ? "Waking up server... This may take up to 60 seconds."
                    : "Signing in..."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Marketing Section Cards - Restored */}
        <div className="marketing-section">
          <h3 className="marketing-heading">Empowering Growth & Smarter Decisions</h3>

          <div className="marketing-cards-grid">
            {/* Card 1: Ibacus Tech */}
            <div className="marketing-card">
              <div className="card-header-log">
                <img src={ibtLogo} alt="Ibacus Logo" className="card-logo" />
                <h4>I BACUS TECH SOLUTIONS</h4>
              </div>
              <p>
                <strong>I BACUS TECH</strong> is a leading digital transformation company based in India,
                driving innovation across industries worldwide — from startups to Fortune 500s. Our solutions span AI automation,
                mobile apps, and cloud optimization, helping businesses unlock their full potential.
              </p>
              <a href="https://www.ibacustech.com/" target="_blank" rel="noopener noreferrer" className="learn-more-link">
                Visit Website &rarr;
              </a>
            </div>

            {/* Card 2: TechCoach4U */}
            <div className="marketing-card">
              <div className="card-header-log">
                <img src={tech4uLogo} alt="TechCoach4U Logo" className="card-logo" />
                <h4>TechCoach4U</h4>
              </div>
              <p>
                <strong>TechCoach4U</strong> is a thoughtfully designed decision-support app developed by I BACUS TECH.
                It helps users think critically, make confident decisions, and build long-term habits through structured guidance.
              </p>

              <div className="benefits-list">
                <span>Build Habits</span>
                <span>Improve Clarity</span>
                <span>Reflect & Grow</span>
              </div>

              <a href="https://decisioncoach.onrender.com/" target="_blank" rel="noopener noreferrer" className="learn-more-link">
                Visit TechCoach4U &rarr;
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
