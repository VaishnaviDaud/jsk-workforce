import React from 'react';
import { Worker, Attendance, Advance } from '../types';
import { Users, UserCheck, UserX, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  workers: Worker[];
  attendance: Attendance[];
  advances: Advance[];
}

export const Dashboard: React.FC<DashboardProps> = ({ workers, attendance, advances }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;

  const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);

  const stats = [
    { label: 'Total Workers', value: workers.length, icon: Users, color: 'from-brand-500 to-brand-600', shadow: 'shadow-brand-200' },
    { label: 'Present Today', value: presentToday, icon: UserCheck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
    { label: 'Absent Today', value: absentToday, icon: UserX, color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-200' },
    { label: 'Total Advance', value: `₹${totalAdvance.toLocaleString()}`, icon: Wallet, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`bg-white p-8 rounded-[2rem] shadow-xl ${stat.shadow} border border-slate-100 flex flex-col gap-6 relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br ${stat.color} opacity-5 rounded-bl-[5rem] transition-transform group-hover:scale-110`} />
            
            <div className={`bg-linear-to-br ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={28} />
            </div>
            
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-linear-to-br from-brand-600 to-brand-700 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Workforce Insights</h3>
            <p className="text-brand-100 mb-8 max-w-md leading-relaxed">
              Your workforce is currently at <span className="text-white font-bold">{workers.length > 0 ? Math.round((presentToday / workers.length) * 100) : 0}%</span> capacity today. 
              Keep track of attendance to optimize your daily operations.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <span className="text-xs uppercase font-bold text-brand-100 block mb-1">Capacity</span>
                <span className="text-xl font-bold">{workers.length > 0 ? Math.round((presentToday / workers.length) * 100) : 0}%</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <span className="text-xs uppercase font-bold text-brand-100 block mb-1">Avg Wage</span>
                <span className="text-xl font-bold">₹{workers.length > 0 ? Math.round(workers.reduce((s, w) => s + w.dailyWage, 0) / workers.length) : 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Tips</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Advance Tracking</p>
                <p className="text-sm text-slate-500 leading-relaxed">Recording advances immediately prevents disputes during month-end salary settlements.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Attendance Accuracy</p>
                <p className="text-sm text-slate-500 leading-relaxed">Marking attendance daily ensures that SMS notifications are sent to absentees on time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
