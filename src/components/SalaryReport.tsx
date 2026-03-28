import React, { useState, useMemo } from 'react';
import { Worker, Attendance, Advance } from '../types';
import { FileText, Download, Filter, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface SalaryReportProps {
  workers: Worker[];
  attendance: Attendance[];
  advances: Advance[];
}

export const SalaryReport: React.FC<SalaryReportProps> = ({ workers, attendance, advances }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const reportData = useMemo(() => {
    const start = startOfMonth(parseISO(`${selectedMonth}-01`));
    const end = endOfMonth(start);

    return workers.map(worker => {
      const workerAttendance = attendance.filter(a =>
        a.workerId === worker.id &&
        isWithinInterval(parseISO(a.date), { start, end })
      );

      const presentDays = workerAttendance.filter(a => a.status === 'present').length;
      const absentDays = workerAttendance.filter(a => a.status === 'absent').length;

      const workerAdvances = advances.filter(a =>
        a.workerId === worker.id &&
        isWithinInterval(parseISO(a.date), { start, end })
      );

      const totalAdvance = workerAdvances.reduce((sum, a) => sum + a.amount, 0);
      const grossSalary = presentDays * worker.dailyWage;
      const netSalary = grossSalary - totalAdvance;

      return {
        ...worker,
        presentDays,
        absentDays,
        totalAdvance,
        grossSalary,
        netSalary
      };
    });
  }, [workers, attendance, advances, selectedMonth]);

  const totalPayable = reportData.reduce((sum, d) => sum + d.netSalary, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Salary Reports</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Filter size={20} className="text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="outline-none text-gray-700 font-medium"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
          <p className="text-blue-100 font-medium">Total Payable for {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</p>
          <p className="text-3xl font-bold mt-2">₹{totalPayable.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Worker</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Daily Wage</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Present</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Absent</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Gross Salary</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Advance</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.map((data) => (
                <tr key={data.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{data.name}</p>
                    <p className="text-xs text-gray-500">{data.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">₹{data.dailyWage}</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">{data.presentDays}</td>
                  <td className="px-6 py-4 text-center font-bold text-red-600">{data.absentDays}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{data.grossSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-amber-600">-₹{data.totalAdvance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold">
                      ₹{data.netSalary.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                    No data available for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
