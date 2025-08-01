import React, { useState } from 'react';
import { canUserUseGoogleLogin } from '../lib/authUtils';

const LoginMethodTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [canUseGoogle, setCanUseGoogle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkLoginMethod = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const result = await canUserUseGoogleLogin(email);
      setCanUseGoogle(result);
    } catch (error) {
      console.error('Error checking login method:', error);
      setCanUseGoogle(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#232946] rounded-2xl p-6 shadow">
      <h3 className="text-lg font-bold text-[#2d3748] dark:text-white mb-4">Login Method Checker</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#2d3748] dark:text-white mb-2">
            Enter Email to Check Login Method
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#2d3748] dark:text-white"
            />
            <button
              onClick={checkLoginMethod}
              disabled={loading || !email}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>

        {canUseGoogle !== null && (
          <div className={`p-4 rounded-lg border ${
            canUseGoogle 
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'
          }`}>
            <div className={`font-semibold ${
              canUseGoogle 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {canUseGoogle ? '✅ Can Use Google Login' : '❌ Cannot Use Google Login'}
            </div>
            <div className={`text-sm mt-1 ${
              canUseGoogle 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {canUseGoogle 
                ? 'This user can login with Google (new user or originally registered with Google)'
                : 'This user must login with email/password (originally registered with email/password)'
              }
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>New users (no account) → Can use Google</li>
            <li>Google users → Can use Google</li>
            <li>Email/password users → Cannot use Google</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginMethodTest; 