import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { MdEdit } from "react-icons/md";
import './TaskReport.css'
import Button from '@mui/material/Button';
import TaskForm from '../TaskForm/TaskForm';
import { toast } from 'react-toastify'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../Config'

function TaskReport({ tasks, setTask, filterStatus }) {
  const [filteredTask, setFilteredTask] = useState(tasks);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    let filtered = [];

    if (filterStatus === "completed") {
      filtered = tasks.filter(task => task.status === "completed");
    } else if (filterStatus === "pending") {
      filtered = tasks.filter(task => task.status === "pending");
    } else if (filterStatus === "in progress") {
      filtered = tasks.filter(task => task.status === "in progress");
    } else {
      filtered = tasks.filter(task => task.status !== "completed");
    }

    setFilteredTask(filtered);
  }, [tasks, filterStatus]);

  const handleUpdate = async (task) => {
    const res = await axios.put(`${BACKEND_URL}/api/tasks/${task.id}`, task, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const updateTask = tasks.map((item) => task.id === item.id ? res.data : item)
    setTask(updateTask)
    toast.success('Task Updated')
  }

  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    const filteredData = tasks.filter(item =>
      item.title.toLowerCase().startsWith(searchValue)
    );
    setFilteredTask(filteredData);
  };
  
  const getBorderColor = () => {
    if (filterStatus === "all") return "#335f8d";
    if (filterStatus === "completed") return "#28a745";
    if (filterStatus === "pending") return "#FF0000"; 
    if (filterStatus === "in progress") return "#ffc107"; 
  };

  return (
    <div className="task-report-container">
      <div className="table-header-row">
        <h3 className={`table-label ${filterStatus.replace(/\s/g, '-')}-table`}
          style={{ borderLeft: `5px solid ${getBorderColor()}` }}>
          Showing: {
            filterStatus === 'all'
              ? 'Ongoing Tasks (Pending + In Progress)'
              : filterStatus === 'completed'
              ? 'Completed Tasks'
              : filterStatus === 'pending'
              ? 'Pending Tasks'
              : 'In Progress Tasks'
          }
        </h3>

        <TextField
          id="outlined-search"
          label="Search By Task Name"
          type="search"
          size="small"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className={`table ${filterStatus.replace(/\s/g, '-')}-table`}>
            <thead>
              <tr>
                <th className="th">Task Name</th>
                <th className="th">Created Date</th>
                <th className="th">Due Date</th>
                <th className="th">Priority</th>
                <th className="th">Status</th>
                {/* <th className="th">Assigned To</th> */}
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTask.length === 0 ? (
                <tr>
                  <td colSpan="7" className="td empty-state">
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTask
                  .filter(task => Object.values(task).some(val => val !== null && val !== ''))
                  .map((taskItem, index) => (
                    <tr key={index}>
                      <td className="td">{taskItem.title}</td>
                      <td className="td">{new Date(taskItem.created_at).toLocaleDateString('en-GB')}</td>
                      <td className="td">{new Date(taskItem.due_date).toLocaleDateString('en-GB')}</td>
                      <td className="td">{taskItem.priority}</td>
                      <td className="td">{taskItem.status}</td>
                      {/* <td className="td">{taskItem.assigned_to}</td> */}
                      <td className="td">
                        <button
                          className='editButton'
                          onClick={() => {
                            navigate(`/edit-tasks/${taskItem.id}`);
                          }}
                          style={{ 
                            backgroundColor: getBorderColor(),
                          }}
                        >
                          <MdEdit fontSize={16} />
                          Edit
                        </button>
                      </td>
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

export default TaskReport
