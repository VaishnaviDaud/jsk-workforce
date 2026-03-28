import React, { useState } from 'react';
import { Worker } from '../types';
import { Plus, Edit2, Trash2, X, Phone, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

interface WorkerListProps {
  workers: Worker[];
}

export const WorkerList: React.FC<WorkerListProps> = ({ workers }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', dailyWage: '' });

  const resetForm = () => {
    setFormData({ name: '', phone: '', dailyWage: '' });
    setIsAdding(false);
    setEditingWorker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const data = {
      name: formData.name,
      phone: formData.phone,
      dailyWage: Number(formData.dailyWage),
      uid: auth.currentUser.uid,
    };

    try {
      if (editingWorker) {
        await updateDoc(doc(db, 'workers', editingWorker.id), data);
      } else {
        if (workers.length >= 50) {
          alert('Maximum 50 workers allowed.');
          return;
        }
        await addDoc(collection(db, 'workers'), data);
      }
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingWorker ? OperationType.UPDATE : OperationType.CREATE, 'workers');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await deleteDoc(doc(db, 'workers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `workers/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Workers</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Worker
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingWorker) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl relative">
              <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold mb-6">{editingWorker ? 'Edit Worker' : 'Add New Worker'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (₹)</label>
                  <input
                    required
                    type="number"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  {editingWorker ? 'Update Worker' : 'Save Worker'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {workers.map((worker) => (
          <motion.div
            key={worker.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:border-brand-200 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-brand-200 transition-colors">
                  <img 
                    src={`https://picsum.photos/seed/${worker.id}/200`} 
                    alt={worker.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{worker.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 font-medium">
                    <Phone size={14} className="text-brand-500" />
                    {worker.phone}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingWorker(worker);
                    setFormData({ name: worker.name, phone: worker.phone, dailyWage: worker.dailyWage.toString() });
                  }}
                  className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(worker.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 text-2xl font-black text-slate-900">
                <span className="text-brand-500 text-lg">₹</span>
                {worker.dailyWage}
                <span className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">/ day</span>
              </div>
              <div className="bg-slate-50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-400">
                ID: {worker.id.slice(-4)}
              </div>
            </div>
          </motion.div>
        ))}
        {workers.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">No workers added yet. Click "Add Worker" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
