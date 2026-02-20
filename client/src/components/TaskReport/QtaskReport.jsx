import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useGlobalStore from '../../store/useGlobalStore';
import './QtaskReport.css';

function QtaskReport({ qtasks, setQtasks }) {
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const navigate = useNavigate();
  const isFocusMode = useGlobalStore(state => state.isFocusMode);

  useEffect(() => {
    localStorage.setItem('quickTasks', JSON.stringify(qtasks));
  }, [qtasks]);

  const handleUpdate = (task) => {
    const updatedTasks = qtasks.map((item) => (task.id === item.id ? task : item));
    setQtasks(updatedTasks);
    toast.success('Task Updated');
  };

  const todaysQuickTasks = (qtasks || [])
    .filter((taskItem) => {
      if (!taskItem.date) return false;

      const taskDate = new Date(taskItem.date);
      const today = new Date();

      return (
        taskDate.getFullYear() === today.getFullYear() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getDate() === today.getDate()
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="task-report-container">
      <div className="qtask-table-header">
        <h3 className="table-label">Today's Time Log</h3>
        <div className="qtask-header-right">
          <Button
            variant="contained"
            onClick={() => navigate('/quick-task-history')}
            disabled={isFocusMode}
          >
            View History
          </Button>
        </div>
      </div>

      <div className="qtask-table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr style={{ backgroundColor: 'rgb(51, 95, 141)', color: 'white' }}>
                <th className="th">S.No</th>
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
                  <td colSpan="7" className="td empty-state">
                    No Time Log found for today
                  </td>
                </tr>
              ) : (
                todaysQuickTasks.map((taskItem, index) => (
                  <tr key={index}>
                    <td className="td">{index + 1}</td>
                    <td className="td">{formatDate(taskItem.date) || "-"}</td>
                    <td className="td">{Array.isArray(taskItem.workTasks) ? taskItem.workTasks.join(', ') || "-" : taskItem.workTasks || "-"}</td>
                    <td className="td">{Array.isArray(taskItem.personalTasks) ? taskItem.personalTasks.join(', ') || "-" : taskItem.personalTasks || "-"}</td>
                    <td className="td">{taskItem.notes || "-"}</td>
                    <td className="td">{taskItem.timeSpent || "-"}</td>
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

