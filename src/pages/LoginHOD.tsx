import { Button } from "@/components/ui/button";
import { Info, User, Lock, GraduationCap, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../components/firebase";
import { useNavigate } from "react-router-dom";
import { signInWithEmailPassword, registerWithEmailPassword } from "../lib/authUtils";

const LoginHOD = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [regFirstname, setRegFirstname] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  React.useEffect(() => {
    setMounted(true);
    
    // Check for remembered credentials on component mount
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberMeStatus = localStorage.getItem('rememberMe');
    
    if (rememberedEmail && rememberMeStatus === 'true') {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only auto-login if user is already authenticated (not from registration)
      if (user && !justRegistered) {
        // Show success popup before navigating
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate("/hod_dashboard", { replace: true });
        }, 2000); // 2 seconds
      }
    });
    return () => unsubscribe();
  }, [navigate, justRegistered]);

  // Add a function to clear remembered credentials
  const clearRememberedCredentials = () => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    setEmail("");
    setRememberMe(false);
  };

  // Input styles for light/dark
  const inputClass =
    "w-full pl-12 pr-4 py-3 rounded-xl border focus:border-[#265d4a] focus:ring-2 focus:ring-[#265d4a]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 bg-white dark:bg-[#181f2a] border-gray-200 dark:border-gray-700 transition";



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);
    try {
      await signInWithEmailPassword(email, password);
      
      // Handle "Remember Me" functionality
      if (rememberMe) {
        // Store login credentials in localStorage (for demo purposes)
        // In production, you might want to use more secure methods
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Clear any previously stored credentials
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      setLoadingLogin(false);
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loadingRegister) {
      return;
    }
    
    setRegisterError("");
    setRegisterSuccess("");
    
    if (regPassword !== regConfirm) {
      setRegisterError("Passwords do not match");
      return;
    }
    
    setLoadingRegister(true);
    
    try {
      // Set flag to prevent auto-login
      setJustRegistered(true);
      
      // Ultra-fast registration
      await registerWithEmailPassword(regEmail, regPassword, regFirstname, regLastname);
      
      // Sign out immediately to prevent auto-login
      await signOut(auth);
      
      // Show success message immediately
      setRegisterSuccess("Registration Successful!");
      
      // Clear form data immediately
      setRegFirstname(""); 
      setRegLastname(""); 
      setRegEmail(""); 
      setRegPassword(""); 
      setRegConfirm("");
      
      // Switch to login tab after 0.5 seconds (faster)
      setTimeout(() => {
        setTab('login');
        setRegisterSuccess(""); // Clear success message when switching tabs
        // Reset the flag after switching tabs
        setJustRegistered(false);
      }, 500);
      
    } catch (err: any) {
      // Handle Firebase auth errors
      if (err.message && err.message.includes('already exists')) {
        setRegisterError("An account with this email already exists. Please use a different email or try logging in.");
      } else {
        setRegisterError(err.message || "Registration failed");
      }
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Success Popup (only after login) */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-[#232946] rounded-2xl shadow-lg px-10 py-10 text-center flex flex-col items-center" style={{ minWidth: 320 }}>
            {/* Shield with animated tick */}
            <div className="mb-4 flex items-center justify-center">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="72" height="72" rx="20" fill="#e8f0fa" className="dark:fill-[#181f2a]"/>
                <path d="M36 14L56 22V34C56 48 36 58 36 58C36 58 16 48 16 34V22L36 14Z" fill="#fff" stroke="#265d4a" strokeWidth="2.5"/>
                <path className="tick-animate" d="M28 36.5L34 42.5L44 30.5" stroke="#56dfcf" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <style>{`
                .tick-animate {
                  stroke-dasharray: 30;
                  stroke-dashoffset: 30;
                  animation: tick 0.8s 0.2s cubic-bezier(0.4,1.6,0.4,1) forwards;
                }
                @keyframes tick {
                  to { stroke-dashoffset: 0; }
                }
              `}</style>
            </div>
            <div className="text-2xl font-bold mb-2 text-[#265d4a] dark:text-[#56dfcf]">Login Successful!</div>
            <div className="text-gray-700 dark:text-gray-200 mb-2">Redirecting to dashboard...</div>
          </div>
        </div>
      )}
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 glass-card flex items-center justify-between border-b border-[#265d4a]/10 shadow-lg transition-colors duration-300" style={{ minHeight: '70px' }}>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-[#265d4a]" />
          <span className="text-2xl font-extrabold tracking-tight animated-logo-gradient-blue font-[Poppins] rounded-full">Gradeify</span>
        </div>
        <div className="flex items-center">
          <a href="/" className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2">Home</a>
          <a href="#about" className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2">About</a>
          <a href="#steps" className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2">Steps</a>
          <a href="#contact" className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2">Contact</a>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-2 text-[#265d4a] dark:text-[#56dfcf] hover:text-yellow-300 focus:outline-none"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</TooltipContent>
          </Tooltip>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-24 min-h-[80vh]">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-16 items-stretch justify-between">
          {/* Login/Register Box */}
          <div className="flex-1 max-w-md min-w-[300px] md:ml-0 md:mr-0 ml-auto mr-auto flex flex-col items-center gap-6 md:self-start">
            <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl shadow-lg bg-white dark:bg-[#101624] flex flex-col items-center border border-gray-100 dark:border-gray-800">
              {/* Tabs */}
              <div className="flex w-full mb-8 bg-[#f3f4f6] dark:bg-[#181f2a] rounded-full p-1">
                <button
                  className={`flex-1 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${tab === 'login' ? 'bg-white dark:bg-[#232946] shadow text-[#265d4a] dark:text-[#56dfcf]' : 'text-gray-400 dark:text-gray-400'}`}
                  onClick={() => !loadingRegister && setTab('login')}
                  disabled={loadingRegister}
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${tab === 'register' ? 'bg-white dark:bg-[#232946] shadow text-[#265d4a] dark:text-[#56dfcf]' : 'text-gray-400 dark:text-gray-400'}`}
                  onClick={() => !loadingRegister && setTab('register')}
                  disabled={loadingRegister}
                >
                  Register
                </button>
              </div>
              {/* Form Switcher */}
              {tab === 'login' ? (
                <form className="w-full" onSubmit={handleLogin}>
                  {/* Email Field */}
                  <div className="w-full mb-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#265d4a] dark:text-[#56dfcf]">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="4"/><path d="m22 6-10 7L2 6"/></svg>
                      </span>
                      <input
                        type="email"
                        placeholder="micahmad@potarastudio.com"
                        className={inputClass}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* Password Field */}
                  <div className="w-full mb-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Password</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#265d4a] dark:text-[#56dfcf]">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="mic4hmad#"
                        className={inputClass.replace('pr-4', 'pr-10')}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      {/* Show/Hide password icon */}
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 cursor-pointer" onClick={() => setShowPassword(v => !v)}>
                        {showPassword ? (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Error Message */}
                  {loginError && <div className="w-full mb-2 text-red-600 text-sm text-center">{loginError}</div>}
                  {/* Remember me and Forgot Password */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#265d4a] dark:hover:text-[#56dfcf] transition-colors">
                      <input 
                        type="checkbox" 
                        className="accent-[#265d4a] dark:accent-[#56dfcf] rounded cursor-pointer" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember me
                    </label>
                    <button 
                      onClick={() => navigate('/forget')} 
                      className="text-xs text-[#265d4a] dark:text-[#56dfcf] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  {/* Login Button */}
                  <button type="submit" className="w-full h-12 bg-[#4d6b57] hover:bg-[#265d4a] text-white font-semibold text-lg rounded-full shadow-lg transition-all duration-300 mb-4 flex items-center justify-center" disabled={loadingLogin}>
                    {loadingLogin && (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    )}
                    {loadingLogin ? "Logging in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form className="w-full" onSubmit={handleRegister}>
                  {/* Register Form */}
                  <div className="w-full mb-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Firstname</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Firstname"
                        className={inputClass.replace('pl-12', 'pl-4')}
                        value={regFirstname}
                        onChange={e => setRegFirstname(e.target.value)}
                        required
                        disabled={loadingRegister}
                      />
                    </div>
                  </div>
                  <div className="w-full mb-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Lastname</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Lastname"
                        className={inputClass.replace('pl-12', 'pl-4')}
                        value={regLastname}
                        onChange={e => setRegLastname(e.target.value)}
                        required
                        disabled={loadingRegister}
                      />
                    </div>
                  </div>
                  <div className="w-full mb-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email"
                        className={inputClass.replace('pl-12', 'pl-4')}
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        required
                        disabled={loadingRegister}
                      />
                    </div>
                  </div>
                  <div className="w-full mb-3">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Password"
                        className={inputClass.replace('pl-12', 'pl-4').replace('pr-4', 'pr-10')}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        required
                        disabled={loadingRegister}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 cursor-pointer" onClick={() => !loadingRegister && setShowRegPassword(v => !v)}>
                        {showRegPassword ? (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="w-full mb-4">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showRegConfirm ? "text" : "password"}
                        placeholder="Confirm Password"
                        className={inputClass.replace('pl-12', 'pl-4').replace('pr-4', 'pr-10')}
                        value={regConfirm}
                        onChange={e => setRegConfirm(e.target.value)}
                        required
                        disabled={loadingRegister}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 cursor-pointer" onClick={() => !loadingRegister && setShowRegConfirm(v => !v)}>
                        {showRegConfirm ? (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.81 21.81 0 0 1 5.06-6.06M1 1l22 22"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Error/Success Message */}
                  {registerError && <div className="w-full mb-2 text-red-600 text-sm text-center">{registerError}</div>}
                  {registerSuccess && (
                    <div className="w-full mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-green-700 dark:text-green-300 font-semibold">{registerSuccess}</span>
                    </div>
                  )}
                  <button 
                    type="submit" 
                    className={`w-full h-12 text-white font-semibold text-lg rounded-full shadow-lg transition-all duration-300 mb-4 flex items-center justify-center ${
                      loadingRegister 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#4d6b57] hover:bg-[#265d4a]'
                    }`}
                    disabled={loadingRegister}
                  >
                    {loadingRegister && (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    )}
                    {loadingRegister ? "Registering..." : "Register"}
                  </button>
                </form>
              )}

            </div>
          </div>
          {/* Instructions Box */}
          <div className="flex-1 max-w-md min-w-[300px] md:ml-0 md:mr-0 ml-auto mr-auto bg-black/90 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col gap-6 justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-6 w-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-white">Login Instructions</h3>
            </div>
            <div className="text-left text-base text-slate-200 space-y-6">
              <section>
                <h4 className="font-semibold text-lg mb-1 text-white">HoD Account</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Login credentials (email & password) are provided by the system admin.</li>
                  <li>HoDs must log in using the official email and change the password after first login.</li>
                  <li>Only HoDs have the authority to create Faculty accounts.</li>
                </ul>
              </section>
              <section>
                <h4 className="font-semibold text-lg mb-1 text-white">Faculty Account</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Faculty IDs are created by the HoD.</li>
                  <li>Login credentials are shared with faculty by the HoD.</li>
                  <li>Faculty can change their password after logging in.</li>
                </ul>
              </section>

              <section>
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 px-4 py-3 flex items-start gap-2">
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">Note:</span>
                  <span className="text-yellow-800 dark:text-yellow-100">Use a strong password and keep your login credentials secure.</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginHOD; 