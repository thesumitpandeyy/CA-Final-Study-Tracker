
import React from 'react';
import { LayoutDashboard, BookOpen, Moon, Sun, GraduationCap, Activity, LogOut, User } from 'lucide-react';
import { ViewState } from '../types';
import { auth } from '../firebase';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, onChangeView, isDarkMode, toggleTheme, onLogout 
}) => {
  const user = auth.currentUser;
  
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'master-plan', label: 'Plan', icon: <BookOpen size={20} /> },
    { id: 'consistency', label: 'Focus', icon: <Activity size={20} /> },
  ];

  const handleLogoutClick = () => {
    // Directly call the instant logout from props
    onLogout();
  };

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg mr-0 lg:mr-3 shadow-lg shadow-indigo-500/30">
              <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl hidden lg:block text-slate-800 dark:text-white">CA Final</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all duration-200 group relative
                ${currentView === item.id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className={currentView === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}>
                  {item.icon}
              </span>
              <span className="hidden lg:block ml-3">{item.label}</span>
              {currentView === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full lg:hidden"></div>
              )}
            </button>
          ))}
        </nav>

        {/* User & Footer Actions */}
        <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          {user && (
            <div className="flex items-center justify-center lg:justify-start gap-3 p-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/20 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <User size={20} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.displayName || 'CA Aspirant'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle dark mode"
            >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="hidden lg:block ml-3 text-sm font-medium">
                    {isDarkMode ? 'Light' : 'Dark'}
                </span>
            </button>
            <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center lg:justify-start p-3 rounded-xl bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 font-bold"
                aria-label="Logout"
            >
                <LogOut size={20} />
                <span className="hidden lg:block ml-3 text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-4 py-2 safe-area-pb">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all
                ${currentView === item.id 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-400 dark:text-slate-500'
                }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogoutClick}
            className="flex flex-col items-center justify-center p-2 rounded-lg text-red-500 dark:text-red-400 font-bold"
          >
            <LogOut size={20} />
            <span className="text-[10px] mt-1">Exit</span>
          </button>
        </div>
      </nav>
    </>
  );
};
