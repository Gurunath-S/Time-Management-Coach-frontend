import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './QtaskReport.css';

function QtaskReport({ qtasks, setQtasks }) {
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('quickTasks', JSON.stringify(qtasks));
  }, [qtasks]);

  const handleUpdate = (task) => {
    const updatedTasks = qtasks.map((item) => (task.id === item.id ? task : item));
    setQtasks(updatedTasks);
    toast.success('Task Updated');
  };

  const todaysQuickTasks = qtasks.filter((taskItem) => {
    // We treat the stored date string as the local date reference.
    // If it's a full ISO string, we need to extract YYYY-MM-DD.
    if (!taskItem.date) return false;

    // Parse date parts to strictly match local day
    const taskDateStr = taskItem.date.split('T')[0];

    // Get today's local date string YYYY-MM-DD
    const today = new Date();
    // use simple formatting to avoid timezone offset issues when stringifying
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    return taskDateStr === todayStr;
  });

  const formatDate = (dateStr) => {
    // Force local date display
    if (!dateStr) return '';
    const part = dateStr.split('T')[0];
    const [y, m, d] = part.split('-');
    return `${d}/${m}/${y.slice(-2)}`;
  };

  return (
    <div className="task-report-container">
      <div className="qtask-table-header">
        <h3 className="table-label">Today's Time Log</h3>
        <div className="qtask-header-right">
          <Button variant="contained" onClick={() => navigate('/quick-task-history')}>
            View History
          </Button>
        </div>
      </div>

      <div className="qtask-table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'rgb(51, 95, 141)', color: 'white' }}>
                <th className="th">Date</th>
                <th className="th">Work Tasks</th>
                <th className="th">Personal Tasks</th>
                <th className="th">Notes</th>
                <th className="th">Duration</th>
              </tr>
            </thead>
            <tbody>
              {todaysQuickTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="td empty-state">
                    No Time Log found for today
                  </td>
                </tr>
              ) : (
                todaysQuickTasks.map((taskItem, index) => (
                  <tr key={index}>
                    <td className="td">{formatDate(taskItem.date)}</td>
                    <td className="td">{Array.isArray(taskItem.workTasks) ? taskItem.workTasks.join(', ') : taskItem.workTasks}</td>
                    <td className="td">{Array.isArray(taskItem.personalTasks) ? taskItem.personalTasks.join(', ') : taskItem.personalTasks}</td>
                    <td className="td">{taskItem.notes}</td>
                    <td className="td">{taskItem.timeSpent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default QtaskReport;

