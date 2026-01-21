
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MasterPlan } from './components/MasterPlan';
import { Consistency } from './components/Consistency';
import { Login } from './components/Login';
import { MOCK_CHAPTERS, MOCK_LOGS, EXAM_START_DATE, INITIAL_SPOM_EXAMS } from './constants';
import { Chapter, ViewState, SPOMExam, Subject, StudyLog } from './types';
import { auth, onAuthStateChanged, signOut } from './firebase';
import * as db from './utils/db';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [user, setUser] = useState<any>(() => auth.currentUser);
  
  // Data State
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_CHAPTERS);
  const [spomExams, setSpomExams] = useState<SPOMExam[]>(INITIAL_SPOM_EXAMS);
  const [logs, setLogs] = useState<StudyLog[]>(MOCK_LOGS);
  const [completionDates, setCompletionDates] = useState<Record<Subject, string>>({
    [Subject.FR]: '', [Subject.AFM]: '', [Subject.AUDIT]: '', [Subject.DT]: '', [Subject.IDT]: '', [Subject.IBS]: '',
  });

  // Theme Handling
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged({}, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserDataFromDB(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserDataFromDB = async (uid: string) => {
    try {
      const data = await db.loadUserFullData(uid);
      if (data.chapters && data.chapters.length > 0) setChapters(data.chapters);
      if (data.spomExams && data.spomExams.length > 0) setSpomExams(data.spomExams);
      if (data.logs && data.logs.length > 0) setLogs(data.logs);
      
      if (data.metadata) {
        if (data.metadata.completionDates) setCompletionDates(data.metadata.completionDates);
        if (data.metadata.currentView) setCurrentView(data.metadata.currentView);
      }
    } catch (e) {
      console.error("Error loading DB data", e);
    }
  };

  // Sync state to IndexedDB on change (debounced)
  useEffect(() => {
    if (!user) return;
    
    const saveData = async () => {
      try {
        await db.updateUserData(user.uid, {
          chapters,
          spomExams,
          logs,
          completionDates,
          currentView
        });
      } catch (e) {
        console.error("Error saving to DB", e);
      }
    };

    const timeoutId = setTimeout(saveData, 1000); 
    return () => clearTimeout(timeoutId);
  }, [chapters, spomExams, logs, completionDates, currentView, user]);

  const daysLeft = useMemo(() => {
    const today = new Date();
    const diffTime = Math.abs(EXAM_START_DATE.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }, []);

  const handleToggleChapter = (id: string) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c));
  };

  const handleAddChapter = (chapter: Chapter) => {
    setChapters(prev => [...prev, chapter]);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setChapters(prev => prev.map(c => c.id === chapter.id ? chapter : c));
  };

  const handleDeleteChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateSpom = (id: string, field: keyof SPOMExam, value: any) => {
    setSpomExams(prev => prev.map(exam => exam.id === id ? { ...exam, [field]: value } : exam));
  };

  const handleUpdateCompletionDate = (subject: Subject, date: string) => {
    setCompletionDates(prev => ({ ...prev, [subject]: date }));
  };

  const handleUpdateLog = (date: string, hours: number) => {
    setLogs(prev => {
        const existingIndex = prev.findIndex(l => l.date === date);
        if (existingIndex >= 0) {
            if (hours <= 0) return prev.filter((_, i) => i !== existingIndex);
            const newLogs = [...prev];
            newLogs[existingIndex] = { ...newLogs[existingIndex], hours };
            return newLogs;
        } else {
            if (hours <= 0) return prev;
            return [...prev, { id: `log-${Date.now()}`, date, subject: Subject.FR, hours }];
        }
    });
  };

  const handleLogout = () => {
    setUser(null);
    signOut();
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    loadUserDataFromDB(userData.uid);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <main className="md:ml-20 lg:ml-64 p-4 md:p-8 pt-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'dashboard' && (
            <Dashboard 
              chapters={chapters} 
              daysLeft={daysLeft} 
              onToggleChapter={handleToggleChapter}
              spomExams={spomExams}
              onUpdateSpom={handleUpdateSpom}
              completionDates={completionDates}
              onUpdateCompletionDate={handleUpdateCompletionDate}
            />
          )}
          {currentView === 'master-plan' && (
            <MasterPlan 
              chapters={chapters} 
              onToggleChapter={handleToggleChapter}
              onAddChapter={handleAddChapter}
              onEditChapter={handleEditChapter}
              onDeleteChapter={handleDeleteChapter}
            />
          )}
          {currentView === 'consistency' && (
            <Consistency 
              logs={logs} 
              onUpdateLog={handleUpdateLog}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
