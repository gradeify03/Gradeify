import { Button } from "@/components/ui/button";
import { GraduationCap, Sun, Moon, Mail, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../components/firebase";

const ForgotPassword = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Input styles for light/dark
  const inputClass =
    "w-full pl-12 pr-4 py-3 rounded-xl border focus:border-[#265d4a] focus:ring-2 focus:ring-[#265d4a]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 bg-white dark:bg-[#181f2a] border-gray-200 dark:border-gray-700 transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("DEBUG: Form submitted with email:", email);
    setLoading(true);
    setMessage("");
    setMessageType('');
    setShowPopup(false);

    try {
      // First check if the email exists in Firebase Auth
      console.log("DEBUG: Checking if email exists:", email);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log("DEBUG: signInMethods for", email, "=>", signInMethods);
      
      if (signInMethods.length === 0) {
        console.log("DEBUG: No sign-in methods found - user doesn't exist");
        setMessage("No account found with this email address. Please check your email or create a new account.");
        setMessageType('error');
        setShowPopup(true);
        return;
      }

      // Check if the user has password authentication enabled
      if (!signInMethods.includes("password")) {
        console.log("DEBUG: User exists but doesn't use password authentication");
        setMessage("This email is registered with a third-party provider (e.g., Google). Please use the appropriate sign-in method.");
        setMessageType('error');
        setShowPopup(true);
        return;
      }

      // User exists and supports password authentication, send reset email
      console.log("DEBUG: User exists and supports password auth, sending reset email");
      await sendPasswordResetEmail(auth, email);
      
      console.log("DEBUG: Password reset email sent successfully for:", email);
      setMessage("Password reset email sent successfully! Please check your inbox and follow the instructions.");
      setMessageType('success');
      setShowPopup(true);
      setEmail("");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login_hod');
      }, 3000);
    } catch (error: any) {
      console.error('DEBUG: Password reset error:', error);
      console.error('DEBUG: Error code:', error.code);
      console.error('DEBUG: Error message:', error.message);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-email':
          setMessage("Invalid email address. Please enter a valid email.");
          break;
        case 'auth/user-not-found':
          setMessage("No account found with this email address. Please check your email or create a new account.");
          break;
        case 'auth/too-many-requests':
          setMessage("Too many requests. Please try again later.");
          break;
        case 'auth/missing-email':
          setMessage("Please enter your email address.");
          break;
        case 'auth/operation-not-allowed':
          setMessage("Password reset is not enabled for this account. Please contact support.");
          break;
        case 'auth/network-request-failed':
          setMessage("Network error. Please check your internet connection and try again.");
          break;
        case 'auth/email-already-in-use':
          setMessage("This email is already in use. Please try a different email.");
          break;
        default:
          // If we get here, it might be a different type of error
          console.error('DEBUG: Unhandled error code:', error.code);
          if (error.message && error.message.includes('user-not-found')) {
            setMessage("No account found with this email address. Please check your email or create a new account.");
          } else if (error.message && error.message.includes('invalid-email')) {
            setMessage("Invalid email address. Please enter a valid email.");
          } else {
            setMessage("Failed to send reset email. Please try again.");
          }
      }
      setMessageType('error');
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#265d4a] dark:text-[#56dfcf] hover:text-[#56dfcf] transition mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </button>

          {/* Forgot Password Form */}
          <div className="w-full p-6 sm:p-8 rounded-3xl shadow-lg bg-white dark:bg-[#101624] border border-gray-100 dark:border-gray-800">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-[#265d4a]/10 dark:bg-[#56dfcf]/10 rounded-full flex items-center justify-center mb-3">
                <Mail className="h-7 w-7 text-[#265d4a] dark:text-[#56dfcf]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300 mb-1 ml-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#265d4a] dark:text-[#56dfcf]">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className={inputClass}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`w-full h-11 text-white font-semibold text-base rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                  loading || !email.trim()
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#4d6b57] hover:bg-[#265d4a]'
                }`}
                disabled={loading || !email.trim()}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                )}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <button
                  onClick={() => navigate(-1)}
                  className="text-[#265d4a] dark:text-[#56dfcf] hover:underline font-semibold"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Success/Error Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white dark:bg-[#232946] rounded-2xl shadow-lg px-8 py-8 text-center flex flex-col items-center max-w-sm mx-4" style={{ minWidth: 320 }}>
            {/* Icon */}
            <div className="mb-4 flex items-center justify-center">
              {messageType === 'success' ? (
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Message */}
            <div className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
              {messageType === 'success' ? 'Success!' : 'Error'}
            </div>
            <div className="text-gray-700 dark:text-gray-200 mb-6 text-sm">
              {message}
            </div>
            
            {/* Button */}
            <button
              onClick={() => {
                setShowPopup(false);
                if (messageType === 'success') {
                  navigate('/login_hod');
                }
              }}
              className={`w-full py-3 px-6 rounded-full font-semibold transition-colors ${
                messageType === 'success'
                  ? 'bg-[#265d4a] hover:bg-[#1e4a3a] text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {messageType === 'success' ? 'Go to Login' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword; 