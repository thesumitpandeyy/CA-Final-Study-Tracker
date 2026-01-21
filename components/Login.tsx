import React, { useState } from 'react';
import { GraduationCap, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../firebase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let loggedInUser;
      if (isRegistering) {
        // Registration Logic
        if (!username || !email || !password || !confirmPassword) {
          throw new Error('All fields are required.');
        }
        if (!validateEmail(email)) {
          throw new Error('Invalid email format.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        
        loggedInUser = await registerUser({ username, email, password });
      } else {
        // Login Logic
        if (!username || !password) {
          throw new Error('Please fill in all fields.');
        }
        loggedInUser = await loginUser(username, password);
      }
      
      // On success, notify parent instantly. No page reload.
      onLoginSuccess(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
        
        {/* Header Decor */}
        <div className="h-2 bg-indigo-600 w-full" />
        
        <div className="p-8 text-center">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {isRegistering 
              ? 'Start your journey to becoming a CA with organized tracking.' 
              : 'Sign in to continue your CA Final study progress.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
              <AlertCircle size={18} />
              <p className="text-left font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">
                {isRegistering ? 'Username' : 'Username or Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white outline-none transition-all font-medium"
                  placeholder={isRegistering ? "e.g. aspirant" : "e.g. aspirant@cafinal.com"}
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Email ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white outline-none transition-all font-medium"
                    placeholder="e.g. aspirant@cafinal.com"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white outline-none transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] mt-2 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'Register' : 'Login'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {isRegistering ? 'Sign in here' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">
            CA Final Tracker • Version 2.0
          </p>
        </div>
      </div>
    </div>
  );
};