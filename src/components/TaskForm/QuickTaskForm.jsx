import React, { useState } from 'react';
import './QuickTaskForm.css'; // You'll style the popup here
import { toast } from 'react-toastify'

export default function QuickTaskModal({ open, onClose, onSave }) {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [selectedWorkTasks, setSelectedWorkTasks] = useState([]);
  const [selectedPersonalTasks, setSelectedPersonalTasks] = useState([]);
  const [user,setUser] = useState('');
  
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
  const handleCheckbox = (task, type) => {
    const handler = type === 'work' ? selectedWorkTasks : selectedPersonalTasks;
    const setter = type === 'work' ? setSelectedWorkTasks : setSelectedPersonalTasks;

    if (handler.includes(task)) {
      setter(handler.filter((t) => t !== task));
    } else {
      setter([...handler, task]);
    }
  };

  const handleCancel = (e) => {
    setDate("");
    setSelectedWorkTasks([]);
    setSelectedPersonalTasks([]);
    setUser(""); 
    setNotes("");
    setTimeSpent(""); 
    onClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !timeSpent || (selectedWorkTasks.length === 0 && selectedPersonalTasks.length === 0)) {
      alert("Please fill all required fields and select at least one task.");
      return;
    }

    const quickLog = {
      id:`${Date.now()} min`,
      date:new Date(date),
      workTasks: selectedWorkTasks,
      personalTasks: selectedPersonalTasks,
      assigned_by: user,
      notes,
      timeSpent: `${timeSpent} min`
    };
    
    try {
      const req = await fetch('https://time-management-coach-backend.onrender.com/api/qtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(quickLog),
      });
      
      if (!req.ok) {
        throw new Error('Failed to save Quick task');
      }
      
      // Call onSave to update parent state
      onSave(quickLog);
     
      setDate("");
      setSelectedWorkTasks([]);
      setSelectedPersonalTasks([]);
      setUser(""); 
      setNotes("");
      setTimeSpent("");

      toast.success("Quick Task entry saved.")

      onClose();
    } catch(error) {
      console.error("Error saving task:", error);
      toast.error('Failed to save task');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="quick-modal">
        <h2>Log Completed Quick Tasks</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Assigned To</label>
          <select
            name="assigned_by"
            value={user}
            onChange={(e)=>setUser(e.target.value)}
            style={{marginTop: '10px',hieght: '40px',color: 'black'}}
            required
          >
            <option value="" disabled>Select user</option>
            <option value="user1">User 1</option>
            <option value="user2">User 2</option>
            <option value="user3">User 3</option>
          </select>
        </div>

        <div style={{gridColumn: "1 / span 2"}}>
          <h4>Select Tasks (Work) :</h4>
          <div className="checkbox-group">
            {workTasks.map((task, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  checked={selectedWorkTasks.includes(task)}
                  onChange={() => handleCheckbox(task, 'work')}
                />
                {task}
              </label>
            ))}
          </div>
        </div>

        <div style={{gridColumn: "1 / span 2"}}>
          <h4>Select Tasks (Outside Work):</h4>
          <div className="checkbox-group">
            {personalTasks.map((task, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  checked={selectedPersonalTasks.includes(task)}
                  onChange={() => handleCheckbox(task, 'personal')}
                />
                {task}
              </label>
            ))}
          </div>
        </div>

        <div style={{gridColumn: "1 / span 2"}}>
          <label>Notes:</label>
          <textarea
            placeholder="Add any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <div>
          <label>Total time spent in min:</label>
          <input
            type="number"
            min="1"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            required
          />
        </div>

        <div className="btn-group" style={{gridColumn: "1 / span 2"}}>
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
      </div>
    </div>
  );
}
