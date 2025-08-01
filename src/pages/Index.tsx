
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, UserCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import TiltedCard from "@/components/TiltedCard";

const Index = () => {
  const navigate = useNavigate();
  
  const handleHODLogin = () => {
    navigate("/login_hod");
  };
  
  const handleStaffLogin = () => {
    navigate("/login_staff");
  };

  // Smooth scrolling function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/hod_dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 glass-card flex items-center justify-between border-b border-[#265d4a]/10 shadow-lg transition-colors duration-300 sticky top-0 z-50" style={{ minHeight: '70px' }}>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-[#265d4a]" />
          <span className="text-2xl font-extrabold tracking-tight animated-logo-gradient-blue font-[Poppins] rounded-full">Gradeify</span>
        </div>
        <div className="flex items-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2 cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2 cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('steps')}
            className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2 cursor-pointer"
          >
            Steps
          </button>
          <button 
            onClick={() => scrollToSection('contact')}
            className="text-[#265d4a] dark:text-[#56dfcf] text-lg font-semibold font-[Poppins] rounded-full hover:text-[#56dfcf] transition px-5 mx-2 cursor-pointer"
          >
            Contact
          </button>
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
      <main className="flex flex-col items-center justify-center px-6 py-8 md:py-12">
        <div className="w-full max-w-md flex flex-col items-center text-center p-6" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
          {/* Typewriter Welcome */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sans mb-4 whitespace-nowrap typewriter-text" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            Welcome to Gradeify
          </h1>
          {/* Headline */}
          <div className="mb-2">
            <span className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
              <span className="bg-gradient-to-r from-[#265d4a] via-[#56dfcf] to-[#265d4a] dark:from-[#56dfcf] dark:via-[#265d4a] dark:to-[#56dfcf] bg-clip-text text-transparent mr-2">Your Grading</span>
              <span className="text-black dark:text-white">Companion</span>
            </span>
          </div>
          {/* Subtitle */}
          <div className="mb-4">
            <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">Select your role to continue</span>
          </div>
          {/* Login Buttons */}
          <div className="w-full flex flex-col gap-3 items-center max-w-xs">
            <Button
              onClick={handleHODLogin}
              className="w-full h-11 md:h-12 bg-[#265d4a] hover:bg-[#1e4636] text-white font-semibold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <UserCheck className="h-5 w-5 md:h-6 md:w-6 mr-3" />
              Login as HOD
            </Button>
            <Button
              onClick={handleStaffLogin}
              variant="outline"
              className="w-full h-11 md:h-12 border-2 border-[#265d4a] hover:border-[#56dfcf] text-[#265d4a] dark:text-[#56dfcf] hover:text-[#56dfcf] font-semibold text-base md:text-lg rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-white dark:bg-[#1e293b] hover:bg-[#e0f7fa] dark:hover:bg-[#334155]"
            >
              <Users className="h-5 w-5 md:h-6 md:w-6 mr-3" />
              Login as Staff
            </Button>
          </div>
        </div>
        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Efficient Grading</h3>
              <p className="text-sm text-slate-600">Streamline your grading process with our intuitive tools</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Role-Based Access</h3>
              <p className="text-sm text-slate-600">Secure access controls for different user roles</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Team Collaboration</h3>
              <p className="text-sm text-slate-600">Collaborate seamlessly with your academic team</p>
            </div>
          </div>
        </div>
      </main>

      {/* About Section (Reference Style) */}
      <section id="about" className="py-16 px-4 flex justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8 items-stretch">
          {/* Left: Text Card */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-md p-8 flex flex-col justify-center min-h-[340px]">
            <span className="text-base font-bold mb-2 font-[Poppins]" style={{ color: '#265d4a' }}>
  How It Started
</span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 font-[Poppins]">Beyond Grades: Towards Meaningful Learning</h2>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-[Poppins]">
              The Continuous Grading Assessment Sheet (CGAS) is at the core of Gradeify’s mission. It’s a smart academic management tool designed to support Continuous Internal Evaluation (CIE) by tracking student performance throughout the semester—not just at the end. With CGAS, we close the gap left by traditional grading methods and bring real-time insights to both teachers and learners.</p>
          </div>
          {/* Right: Image Card */}
          <div className="flex-1 flex items-center justify-center">
            <TiltedCard
              imageSrc="https://cdn.dribbble.com/userupload/17730954/file/original-1ca571d72aed46b341defcb0bf9a18e1.png?resize=1504x1128&vertical=center"
              altText="Educational Analytics Dashboard"
              captionText="Gradeify Analytics Dashboard"
              containerHeight="400px"
              containerWidth="100%"
              imageHeight="400px"
              imageWidth="100%"
              rotateAmplitude={8}
              scaleOnHover={1.05}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={false}
              overlayContent={
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Gradeify Analytics</h3>
                  <p className="text-sm opacity-90">Smart academic management tool</p>
                </div>
              }
            />
          </div>
        </div>
        {/* Feature Cards Grid Below */}
      </section>
      {/* Key Features Section (3-3 cards, with icons) */}
      <section id="features" className="py-10 px-4 bg-[#f9fafc] dark:bg-slate-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon="📁" title="Modular assessment entries" desc="Assignment, quiz, mid-term, lab work, etc." />
            <FeatureCard icon="📊" title="Weighted average grade calculation" desc="Flexible grading with custom weights." />
            <FeatureCard icon="📈" title="Auto-generated performance reports" desc="Instant analytics for every student." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon="👩‍🏫" title="Teacher & student access portals" desc="Role-based dashboards for all users." />
            <FeatureCard icon="📤" title="Export data to Excel or PDF" desc="Download grades and reports easily." />
            <FeatureCard icon="💬" title="Feedback and improvement suggestions" desc="Actionable insights for growth." />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="steps" className="py-16 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 font-[Poppins]">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started with Gradeify in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#265d4a] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Register & Setup</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your account and set up your academic profile with department details
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#56dfcf] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Add Students & Courses</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Import student data and configure your courses with assessment criteria
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#265d4a] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Grading</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Begin tracking student performance with our intuitive grading interface
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 font-[Poppins]">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions about Gradeify? We're here to help you get the most out of our platform.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-[#265d4a] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get help from our support team
              </p>
              <a href="mailto:support@gradeify.com" className="text-[#265d4a] dark:text-[#56dfcf] font-semibold hover:underline">
                support@gradeify.com
              </a>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-[#56dfcf] rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Live Chat</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Chat with our support team
              </p>
              <button className="text-[#265d4a] dark:text-[#56dfcf] font-semibold hover:underline">
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-3 text-center mt-auto">
        <p className="text-xs text-slate-400">
          © 2024 Gradeify. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 cursor-pointer">
    <div className="text-4xl mb-3">{icon}</div>
    <div className="text-lg font-extrabold text-gray-900 dark:text-white font-[Poppins] text-center mb-1">{title}</div>
    <div className="text-sm text-gray-600 dark:text-gray-300 font-[Poppins] text-center">{desc}</div>
  </div>
);

export default Index;
