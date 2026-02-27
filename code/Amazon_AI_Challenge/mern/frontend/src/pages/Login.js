import React, { useState, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState('login');
  const googleButtonRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    const result = await login(credentialResponse.credential);
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  const handleCustomGoogleClick = () => {
    if (googleButtonRef.current) {
      const googleButton = googleButtonRef.current.querySelector('div[role="button"]');
      if (googleButton) {
        googleButton.click();
      } else {
        // Fallback for if Google changes their button structure
        console.error("Could not find Google's sign-in button to click.");
        setError("Could not initiate Google Sign-In. Please try refreshing the page.");
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#181811] dark:text-[#e8e8e3] transition-colors duration-200">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <header className="flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-10 lg:py-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary bg-black/90 dark:bg-white rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-primary dark:text-background-dark">account_balance</span>
            </div>
            <h2 className="text-[#181811] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Scheme Saarthi</h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <a className="text-sm font-medium text-[#181811] dark:text-[#e8e8e3] opacity-70 hover:opacity-100 px-4 py-2" href="#">Help Center</a>
          </div>
        </header>
        <div className="layout-container flex h-full grow flex-col justify-center items-center py-10 px-4 sm:px-10">
          <div className="layout-content-container flex flex-col items-center justify-center w-full max-w-full flex-1">
            <div className="@container w-full flex justify-center">
              <div className="w-full max-w-md flex flex-col gap-8 p-8 sm:p-10 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-black/5 dark:border-white/5">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-3xl font-black leading-tight tracking-[-0.033em]">Citizen Portal</h1>
                  <p className="text-sm opacity-70">Access government schemes with AI assistance.</p>
                </div>
                <div className="flex p-1 bg-[#f5f5f0] dark:bg-[#34332a] rounded-full">
                  <label className="flex-1 cursor-pointer">
                    <input checked={authType === 'login'} className="peer sr-only" name="auth_type" type="radio" value="login" onChange={() => setAuthType('login')} />
                    <div className="flex items-center justify-center py-2.5 rounded-full text-sm font-bold text-[#8c8b5f] dark:text-[#a0a090] peer-checked:bg-white dark:peer-checked:bg-[#4a493a] peer-checked:text-[#181811] dark:peer-checked:text-white peer-checked:shadow-sm transition-all duration-200">
                      Log In
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input checked={authType === 'signup'} className="peer sr-only" name="auth_type" type="radio" value="signup" onChange={() => setAuthType('signup')} />
                    <div className="flex items-center justify-center py-2.5 rounded-full text-sm font-bold text-[#8c8b5f] dark:text-[#a0a090] peer-checked:bg-white dark:peer-checked:bg-[#4a493a] peer-checked:text-[#181811] dark:peer-checked:text-white peer-checked:shadow-sm transition-all duration-200">
                      Sign Up
                    </div>
                  </label>
                </div>

                <div ref={googleButtonRef} style={{ display: 'none' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    size="large"
                    text="continue_with"
                    width="100%"
                    disabled={loading}
                  />
                </div>

                <button
                  className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-white dark:bg-[#2d2c1b] border border-[#e6e6e0] dark:border-[#444335] text-[#181811] dark:text-white hover:bg-gray-50 dark:hover:bg-[#363525] transition-colors gap-3"
                  onClick={handleCustomGoogleClick}
                  disabled={loading}
                >
                  <span className="material-symbols-outlined text-[24px]">account_circle</span>
                  <span className="text-base font-bold leading-normal tracking-[0.015em]">Continue with Google</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-[#e6e6e0] dark:border-[#444335]"></div>
                  <span className="flex-shrink-0 mx-4 text-sm text-[#8c8b5f] dark:text-[#a0a090]">Or continue with email</span>
                  <div className="flex-grow border-t border-[#e6e6e0] dark:border-[#444335]"></div>
                </div>
                <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex flex-col gap-5">
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8b5f] dark:text-[#a0a090] pointer-events-none flex items-center">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <input className="w-full bg-[#f5f5f0] dark:bg-[#2d2c1b] text-[#181811] dark:text-white placeholder-[#8c8b5f] dark:placeholder-[#666555] rounded-full h-14 pl-14 pr-5 border-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#363525] transition-all text-base" placeholder="Email address" required type="email" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8c8b5f] dark:text-[#a0a090] pointer-events-none flex items-center">
                        <span className="material-symbols-outlined">lock</span>
                      </div>
                      <input className="w-full bg-[#f5f5f0] dark:bg-[#2d2c1b] text-[#181811] dark:text-white placeholder-[#8c8b5f] dark:placeholder-[#666555] rounded-full h-14 pl-14 pr-5 border-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#363525] transition-all text-base" placeholder="Password" required type="password" />
                      <button className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8c8b5f] dark:text-[#a0a090] hover:text-[#181811] dark:hover:text-white transition-colors cursor-pointer flex items-center" type="button">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-[#2d2c1b] dark:border-[#444335]" type="checkbox" />
                      <span className="text-sm font-medium text-[#181811]/70 dark:text-white/70 group-hover:text-[#181811] dark:group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <a className="text-sm font-bold text-[#181811] dark:text-white hover:underline decoration-primary decoration-2 underline-offset-4" href="#">Forgot password?</a>
                  </div>
                  <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-primary hover:bg-[#eae605] text-[#181811] shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]" type="submit">
                    <span className="text-base font-bold leading-normal tracking-[0.015em]">{authType === 'login' ? 'Log In' : 'Sign Up'}</span>
                    <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                  </button>
                </form>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4">
                    {error}
                  </div>
                )}
                {loading && (
                  <div className="text-center text-sm text-gray-600 mt-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    Signing in...
                  </div>
                )}
                <p className="text-center text-sm text-[#8c8b5f] dark:text-[#a0a090] mt-2">
                  By joining, you agree to our <a className="font-bold text-[#181811] dark:text-white hover:underline" href="#">Terms of Service</a> and <a className="font-bold text-[#181811] dark:text-white hover:underline" href="#">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginWrapper = () => (
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "dummy-id"}>
    <Login />
  </GoogleOAuthProvider>
);

export default LoginWrapper;
