import React, { useState } from 'react';
import { Worker, Attendance } from '../types';
import { Check, X, Calendar, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

interface AttendanceProps {
  workers: Worker[];
  attendance: Attendance[];
}

export const AttendanceMarking: React.FC<AttendanceProps> = ({ workers, attendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const getAttendanceForWorker = (workerId: string) => {
    return attendance.find(a => a.workerId === workerId && a.date === selectedDate);
  };

  const sendSMS = async (worker: Worker) => {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: worker.phone,
          message: `Dear ${worker.name}, you were marked absent today (${selectedDate}). Please inform if any issue. - JSK Workforce`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`SMS sent to ${worker.name}`);
      } else {
        console.error("SMS failed:", data.error);
      }
    } catch (error) {
      console.error("SMS error:", error);
    }
  };

  const handleMark = async (worker: Worker, status: 'present' | 'absent') => {
    if (!auth.currentUser) return;
    setLoading(true);

    const existing = getAttendanceForWorker(worker.id);

    try {
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), { status });
      } else {
        await addDoc(collection(db, 'attendance'), {
          workerId: worker.id,
          date: selectedDate,
          status,
          uid: auth.currentUser.uid,
        });
      }

      if (status === 'absent') {
        const confirmSMS = window.confirm(`Marked ${worker.name} absent. Send SMS notification?`);
        if (confirmSMS) {
          await sendSMS(worker);
        }
      }
    } catch (error) {
      handleFirestoreError(error, existing ? OperationType.UPDATE : OperationType.CREATE, 'attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Daily Attendance</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <Calendar size={20} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="outline-none text-gray-700 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Worker Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workers.map((worker) => {
                const record = getAttendanceForWorker(worker.id);
                return (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{worker.name}</p>
                      <p className="text-xs text-gray-500">{worker.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {record ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          record.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Not marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleMark(worker, 'present')}
                          className={`p-2 rounded-lg transition-all ${
                            record?.status === 'present'
                              ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600'
                          }`}
                          title="Mark Present"
                        >
                          <Check size={20} />
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleMark(worker, 'absent')}
                          className={`p-2 rounded-lg transition-all ${
                            record?.status === 'absent'
                              ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'
                          }`}
                          title="Mark Absent"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {workers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">
                    No workers found. Add workers first to mark attendance.
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
