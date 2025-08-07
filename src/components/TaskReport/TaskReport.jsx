import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { MdEdit } from "react-icons/md";
import './TaskReport.css'
import Button from '@mui/material/Button';
import TaskForm from '../TaskForm/TaskForm';
import { toast } from 'react-toastify'

function TaskReport({ tasks, setTask, filterStatus }) {
  const [filteredTask, setFilteredTask] = useState(tasks);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState([]);

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
      // filtered = tasks;
    }

    setFilteredTask(filtered);
  }, [tasks, filterStatus]);

  const handleUpdate = (task) => {
    const updateTask = tasks.map((item, index) => task.id === item.id ? task : item)
    setTask(updateTask)
    toast.success('Task Updated')
  }
  // const handledelte = () => {
  //   const updatedTasks = tasks.filter((item) => item.id !== editTask.id);
  //   setTask(updatedTasks);
  //   toast.success('Task Deleted');
  //   setEditTask(null);
  //   setOpen(false);
  // };

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
    <>
    <div className="task-report-container">
      <div className="table-header-row">
        <h3 className="table-label"
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
        <table className={`${filterStatus.replace(/\s/g, '-')}-table`}>
          <thead>
            <tr>
              <th className="th">Task Name</th>
              <th className="th">Created Date</th>
              <th className="th">Due Date</th>
              <th className="th">Priority</th>
              <th className="th">Status</th>
              <th className="th">Assigned To</th>
              <th className="th">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTask.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                  No tasks found
                </td>
              </tr>
            ) : (
              
                filteredTask.filter(task => Object.values(task).some(val => val !== null && val !== ''))
                .map((taskItem, index) => (
                <tr key={index}>
                  <td className="td">{taskItem.title}</td>
                  <td className="td">{new Date(taskItem.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="td">{new Date(taskItem.due_date).toLocaleDateString('en-GB')}</td>
                  <td className="td">{taskItem.priority}</td>
                  <td className="td">{taskItem.status}</td>
                  <td className="td">{taskItem.assigned_to}</td>
                  <td>
                    <button
                      className='editButton'
                      onClick={() => {
                        setOpen(true);
                        setEditTask(taskItem);
                      }}
                      style={{ gap: 10 ,
                        borderColor: getBorderColor(),
                        backgroundColor: getBorderColor(), 
                        color: 'white', 
                        borderRadius: '5px',
                        fontSize: '14px' , 
                        width: '100px',
                        marginLeft: '10px',
                        marginRight: '10px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <MdEdit fontSize={18} />
                      Edit Task
                    </button>
                    {/* <button
                      style={{ gap: 10 }}
                      onClick={() => {
                        setEditTask(taskItem);
                        handledelte();
                        
                      }}
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <TaskForm
          open={open}
          onSave={handleUpdate}
          onClose={() => setOpen(false)}
          editTask={editTask}
          isUpdate={true}
        />

      </div>
      </div>
    </>
  );
}

export default TaskReport