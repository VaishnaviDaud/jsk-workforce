import React from 'react';
import { Auth } from './Auth';
import { LayoutDashboard, Users, CalendarCheck, Wallet, FileText, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'advances', label: 'Advances', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden glass border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-2 rounded-xl text-white">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter">JSK <span className="text-brand-600">Workforce</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            className={`fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-100 z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <div className="p-8 h-full flex flex-col">
              <div className="hidden md:flex items-center gap-3 mb-12">
                <div className="bg-brand-600 p-3 rounded-2xl text-white shadow-lg shadow-brand-200">
                  <LayoutDashboard size={24} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter">JSK <span className="text-brand-600">Workforce</span></h1>
              </div>
              
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-brand-600 text-white shadow-xl shadow-brand-100 font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    <item.icon size={22} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-slate-50">
                <Auth />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
