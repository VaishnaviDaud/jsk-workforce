import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export const Auth: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (auth.currentUser) {
    return (
      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
          <img 
            src={auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser.displayName}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm truncate">{auth.currentUser.displayName}</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest truncate">{auth.currentUser.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-rose-500"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all border border-slate-100 w-full"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      Continue with Google
    </motion.button>
  );
};
