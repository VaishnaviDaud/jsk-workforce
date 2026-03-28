import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, getDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WorkerList } from './components/WorkerList';
import { AttendanceMarking } from './components/Attendance';
import { AdvanceEntry } from './components/AdvanceEntry';
import { SalaryReport } from './components/SalaryReport';
import { Auth } from './components/Auth';
import { Worker, Attendance, Advance, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, AlertCircle, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Ensure user profile exists
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const profile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'User',
            email: currentUser.email || '',
            role: currentUser.email === 'vaishnavidaud8@gmail.com' ? 'admin' : 'user',
          };
          await setDoc(userRef, profile);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setWorkers([]);
      setAttendance([]);
      setAdvances([]);
      return;
    }

    const qWorkers = query(collection(db, 'workers'), where('uid', '==', user.uid));
    const unsubWorkers = onSnapshot(qWorkers, (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'workers'));

    const qAttendance = query(collection(db, 'attendance'), where('uid', '==', user.uid));
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'attendance'));

    const qAdvances = query(collection(db, 'advances'), where('uid', '==', user.uid));
    const unsubAdvances = onSnapshot(qAdvances, (snapshot) => {
      setAdvances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advance)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'advances'));

    return () => {
      unsubWorkers();
      unsubAttendance();
      unsubAdvances();
    };
  }, [user]);

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=2000" 
            alt="Workforce Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-br from-brand-900/90 via-brand-800/80 to-indigo-900/90" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 glass p-10 md:p-16 rounded-[2.5rem] shadow-2xl max-w-lg w-full text-center border-white/30"
        >
          <div className="mb-8 inline-flex p-4 bg-brand-100 rounded-3xl text-brand-600 shadow-inner">
            <LayoutDashboard size={48} />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            JSK <span className="text-brand-600">Workforce</span>
          </h1>
          <p className="text-slate-600 mb-10 text-lg leading-relaxed">
            The ultimate companion for modern workforce management. Track attendance, manage salaries, and grow your business.
          </p>
          <div className="flex justify-center">
            <Auth />
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200/50 flex justify-center gap-8 opacity-60">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900">50+</span>
              <span className="text-xs uppercase tracking-widest font-semibold">Workers</span>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900">100%</span>
              <span className="text-xs uppercase tracking-widest font-semibold">Secure</span>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900">24/7</span>
              <span className="text-xs uppercase tracking-widest font-semibold">Support</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-400/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 blur-[120px] rounded-full" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard workers={workers} attendance={attendance} advances={advances} />;
      case 'workers':
        return <WorkerList workers={workers} />;
      case 'attendance':
        return <AttendanceMarking workers={workers} attendance={attendance} />;
      case 'advances':
        return <AdvanceEntry workers={workers} advances={advances} />;
      case 'reports':
        return <SalaryReport workers={workers} attendance={attendance} advances={advances} />;
      default:
        return <Dashboard workers={workers} attendance={attendance} advances={advances} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      
      {/* Error Boundary Placeholder */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <AlertCircle size={24} />
            <p className="font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-4 hover:bg-red-700 p-1 rounded">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
