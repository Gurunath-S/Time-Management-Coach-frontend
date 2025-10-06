import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { MdEdit } from "react-icons/md";
import './QtaskReport.css'
import Button from '@mui/material/Button';
import QuickTaskModal from '../TaskForm/QuickTaskForm';
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'; 

function QtaskReport({ qtasks, setQtasks}) {
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState([]);
  const navigate = useNavigate();

  const handleUpdate = (task) => {
    const updateTask = qtasks.map((item, index) => task.id === item.id ? task : item)
    setQtasks(updateTask)
    toast.success('Task Updated')
  }
  
  useEffect(() => {
    localStorage.setItem('quickTasks', JSON.stringify(qtasks));
  }, [qtasks]);

  const todaysQuickTasks = qtasks.filter((taskItem) => {
    const taskDate = new Date(taskItem.date);
    const today = new Date();
    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <div className="task-report-container">
      <div className="qtask-table-header">
        <h3 className="table-label">
          Today's Quick Tasks
        </h3>
        <div className="qtask-header-right">
          <Button
            variant="contained"
            onClick={() => navigate('/quick-task-history')}
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
                <th className="th">Date</th>
                <th className="th">Work Tasks</th>
                <th className="th">Personal Tasks</th>
                {/* <th className="th">Done By</th> */}
                <th className="th">Notes</th>
                <th className="th">Duration</th>
              </tr>
            </thead>
            <tbody>
              {todaysQuickTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="td empty-state">
                    No Quick tasks found for today
                  </td>
                </tr>
              ) : (
                todaysQuickTasks.map((taskItem, index) => (
                  <tr key={index}>
                    <td className="td">{new Date(taskItem.date).toLocaleDateString('en-GB')}</td>
                    <td className="td">{taskItem.workTasks}</td>
                    <td className="td">{taskItem.personalTasks}</td>
                    {/* <td className="td">{taskItem.assigned_by}</td> */}
                    <td className="td">{taskItem.notes}</td>
                    <td className="td">{taskItem.timeSpent}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <QuickTaskModal
          open={open}
          onSave={handleUpdate}
          onClose={() => setOpen(false)}
          editTask={editTask}
          isUpdate={true}
          setQtasks={setQtasks}
        />
      </div>
    </div>
  );
}

export default QtaskReport
