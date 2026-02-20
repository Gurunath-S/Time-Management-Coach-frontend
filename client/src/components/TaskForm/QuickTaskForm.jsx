import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import './QuickTaskForm.css';
import { toast } from 'react-toastify';
import BACKEND_URL from '../../../Config';
import { useAuthStore } from '../../store/useAuthStore';
import useGlobalStore from '../../store/useGlobalStore';
import { MdWork } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { FaHome } from "react-icons/fa";

export default function QuickTaskFormPage({ open, onClose }) {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [selectedWorkTasks, setSelectedWorkTasks] = useState([]);
  const [selectedPersonalTasks, setSelectedPersonalTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define current year
  const currentYear = new Date().getFullYear();

  const workTasks = [
    "Answer Incoming calls",
    "Emails from Customer(s) that need my response",
    "Email from Others and Required Immediate attention from me",
    "Follow up in Person that is time sensitive",
    "VIP interaction (Senior Leadership)",
    "Quick huddle(s) with 2+ people",
    "SMS or WhatsApp Conversation(s) with 10+ messages",
    "Quality issues",
    "Schedule issues",
    "Finance Matters (Bank/Invoice/Salary)",
    "Schedule/Reschedule Meetings",
    "Brainstorm options",
    "Logistics for Travel/Event",
    "Watch/Post on Social Media for work",
    "Other (Work)"
  ];

  const personalTasks = [
    "Answer Incoming calls",
    "Email from Others",
    "Follow up in Person",
    "SMS or WhatsApp 10+ messages",
    "Finance Matters",
    "Logistics for Travel/Event",
    "Run errand(s)",
    "Watch/Post on Social Media",
    "Household Chores",
    "Other (Personal)"
  ];

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setDate('');
      return;
    }

    // Prevent manual entry errors when date is incomplete (like typing '202' and getting NaN)
    const selectedDate = new Date(val);
    if (isNaN(selectedDate.getTime())) {
      setDate(val); // allow partial typing to happen
      return;
    }

    const yearStr = parseInt(val.split('-')[0]);

    if (!isNaN(yearStr) && yearStr > 0 && yearStr !== currentYear && val.length >= 4) {
      // Only alert if a full, invalid year is typed
      alert(`Please select a date from the current year (${currentYear}) only.`);
      setDate('');
      return;
    }

    setDate(val);
  };

  const handleCheckbox = (task, type) => {
    const handler = type === 'work' ? selectedWorkTasks : selectedPersonalTasks;
    const setter = type === 'work' ? setSelectedWorkTasks : setSelectedPersonalTasks;

    if (handler.includes(task)) {
      setter(handler.filter((t) => t !== task));
    } else {
      setter([...handler, task]);
    }
  };

  const handleReset = () => {
    setDate('');
    setNotes('');
    setTimeSpent('');
    setSelectedWorkTasks([]);
    setSelectedPersonalTasks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!date || !timeSpent || (selectedWorkTasks.length === 0 && selectedPersonalTasks.length === 0)) {
      alert("Please fill all required fields and select at least one task.");
      return;
    }

    // Double check full year on submit
    const yearStr = parseInt(date.split('-')[0]);
    if (yearStr !== currentYear) {
      alert(`Please select a date from the current year (${currentYear}) only.`);
      return;
    }

    setIsSubmitting(true);
    const [y, m, d] = date.split('-').map(Number);
    const localDate = new Date(y, m - 1, d);

    const quickLog = {
      id: `${Date.now()} min`, // Unique enough for quick log
      date: localDate.toISOString(),
      workTasks: selectedWorkTasks,
      personalTasks: selectedPersonalTasks,
      notes,
      timeSpent: `${timeSpent} min`,
    };

    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Not logged in");

      const req = await fetch(`${BACKEND_URL}/api/qtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quickLog),
      });

      if (!req.ok) {
        let errorData = {};
        try {
          errorData = await req.json();
        } catch (e) { }
        console.error("Backend Error Data:", errorData);
        throw new Error(errorData.message || 'Failed to save Time Log');
      }

      toast.success("Time Log entry saved.");
      handleReset();

      // Ensure frontend global store syncs with the database immediately 
      // so the Time Log tables update right after the modal closes
      await useGlobalStore.getState().fetchTasks();

      if (typeof onClose === 'function') {
        onClose();
      } else {
        // Fallback for standalone route if still used somehow
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle style={{ padding: '24px 32px 16px', margin: 0 }}>
        <div
          className="quick-task-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', /* Center content relatively */
            marginBottom: '20px',
            position: 'relative' /* For absolute positioning of back button */
          }}
        >
          <button
            onClick={onClose || (() => window.history.back())}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              color: '#334155',
              position: 'absolute',
              left: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#334155';
            }}
            aria-label="Go back"
          >
            <IoArrowBack style={{ marginRight: '6px' }} />
            Back
          </button>

          <h2 style={{ margin: 0, textAlign: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>Time Log for Completion</h2>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit} className="quick-task-form" style={{ padding: 0, gap: 0, boxShadow: 'none' }}>
        <DialogContent dividers style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Header Group: Date & Time */}
          <div className="form-header-group">
            <div className="form-input-wrapper" style={{ position: 'relative' }}>
              <label>Date</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setDate('')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: '500'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="form-input-wrapper">
              <label>Time Spent (min)</label>
              <input
                type="number"
                min="1"
                value={timeSpent}
                placeholder="e.g. 30"
                onChange={(e) => setTimeSpent(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Work Tasks Section */}
          <div className="form-section work-section">
            <h4>
              <span className="section-icon"><MdWork /></span>
              Select Tasks (Work)
            </h4>
            <div className="checkbox-group">
              {workTasks.map((task, idx) => (
                <label key={idx} className={`chip ${selectedWorkTasks.includes(task) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedWorkTasks.includes(task)}
                    onChange={() => handleCheckbox(task, 'work')}
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Personal Tasks Section */}
          <div className="form-section personal-section">
            <h4>
              <span className="section-icon"><FaHome /></span>
              Select Tasks (Personal)
            </h4>
            <div className="checkbox-group">
              {personalTasks.map((task, idx) => (
                <label key={idx} className={`chip ${selectedPersonalTasks.includes(task) ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedPersonalTasks.includes(task)}
                    onChange={() => handleCheckbox(task, 'personal')}
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="form-section">
            <label>Notes</label>
            <textarea
              className="notes-input"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </DialogContent>

        <DialogActions style={{ padding: '16px 32px', backgroundColor: '#f8fafc' }}>
          <div className="btn-group" style={{
            width: '100%',
            borderTop: 'none',
            paddingTop: 0,
            margin: 0,
            justifyContent: 'flex-end',
            display: 'flex',
            gap: '12px'
          }}>
            <button type="button" onClick={handleReset} className="btn-reset">Reset</button>
            <button type="button" onClick={onClose || (() => window.history.back())} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
}
