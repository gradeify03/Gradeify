import { Button } from "@/components/ui/button";
import { Users, Sun, Moon, User, Lock, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import React, { useState } from "react";

const LoginStaff = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="w-full px-6 py-4 glass-card flex items-center justify-between border-b border-[#265d4a]/10 shadow-lg transition-colors duration-300" style={{ minHeight: '70px' }}>
        <div className="flex items-center gap-2">
          <Users className="h-7 w-7 text-[#265d4a]" />
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
          {/* Login Box */}
          <div
            className="flex-1 max-w-md min-w-[300px] md:ml-0 md:mr-0 ml-auto mr-auto glass-card p-8 flex flex-col items-center gap-6 md:self-start"
            style={{}}
          >
            <div className="flex flex-col items-center mb-2">
              <Users className="h-12 w-12 text-[#265d4a] mb-2 drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#265d4a] dark:text-[#56dfcf]">Staff Login</h2>
            <div className="relative w-full mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#265d4a]/60 dark:text-[#56dfcf]/80">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Staff ID"
                className="w-full pl-12 pr-4 py-3 glass-input text-[#265d4a] dark:text-[#56dfcf] focus:outline-none focus:ring-2 focus:ring-[#265d4a]"
              />
            </div>
            <div className="relative w-full mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#265d4a]/60 dark:text-[#56dfcf]/80">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 glass-input text-[#265d4a] dark:text-[#56dfcf] focus:outline-none focus:ring-2 focus:ring-[#265d4a]"
              />
            </div>
            <Button className="w-full h-12 bg-[#265d4a] hover:bg-[#1e4636] text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-300">Login</Button>
          </div>
          {/* Instructions Box */}
          <div
            className="flex-1 max-w-md min-w-[300px] md:ml-0 md:mr-0 ml-auto mr-auto bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col gap-6 justify-center"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-6 w-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-black dark:text-white">Login Instructions</h3>
            </div>
            <div className="text-left text-base text-slate-700 dark:text-slate-200 space-y-6">
              <section>
                <h4 className="font-semibold text-lg mb-1 text-blue-700 dark:text-blue-300">Staff Account</h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Staff IDs are created by the HoD.</li>
                  <li>Login credentials are shared with staff by the HoD.</li>
                  <li>Staff can change their password after logging in.</li>
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

export default LoginStaff; 