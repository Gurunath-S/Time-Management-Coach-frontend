import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { MdEdit } from "react-icons/md";
import './QtaskReport.css'
import Button from '@mui/material/Button';
import QuickTaskModal from '../TaskForm/QuickTaskForm';
import { toast } from 'react-toastify'
import { use } from 'react';
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

  return (
    <>
    <div className="task-report-container">
     
      <h3 className="table-label"
      style={{ borderLeft: '5px solid #335f8d' }}>
      Showing: All Quick Tasks
    </h3>

        <div className="qtask-table-container">
          <Button
            variant="contained"
            onClick={() => navigate('/quick-task-history')}
            style={{ marginBottom: '1rem' }}
          >
            View History
          </Button>

          <table className={'table'}>
            <thead>
            <tr>
              <th className="th">date</th>
              <th className="th">Today's Work Tasks</th>
              <th className="th">Today's Non-Work Tasks</th>
              <th className="th">Done By</th>
              <th className="th">Notes</th>
              <th className="th">Task Duration</th>
             
            </tr>
            </thead>
            <tbody>
            {
              qtasks.filter((taskItem) => {
                const taskDate = new Date(taskItem.date);
                const today = new Date();
                return (
                  taskDate.getDate() === today.getDate() &&
                  taskDate.getMonth() === today.getMonth() &&
                  taskDate.getFullYear() === today.getFullYear()
                );
              }).length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "10px", color: 'green' }}>
                    No Quick tasks found for today
                  </td>
                </tr>
              ) : (
                qtasks
                  .filter((taskItem) => {
                    const taskDate = new Date(taskItem.date);
                    const today = new Date();
                    return (
                      taskDate.getDate() === today.getDate() &&
                      taskDate.getMonth() === today.getMonth() &&
                      taskDate.getFullYear() === today.getFullYear()
                    );
                  })
                  .map((taskItem, index) => (
                    <tr key={index}>
                      <td className="td">{new Date(taskItem.date).toLocaleDateString('en-GB')}</td>
                      <td className="td">{taskItem.workTasks}</td>
                      <td className="td">{taskItem.personalTasks}</td>
                      <td className="td">{taskItem.assigned_by}</td>
                      <td className="td">{taskItem.notes}</td>
                      <td className="td">{taskItem.timeSpent}</td>
                    </tr>
                  ))
              )
            }
          </tbody>

          </table>
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
    </>
  );
}

export default QtaskReport