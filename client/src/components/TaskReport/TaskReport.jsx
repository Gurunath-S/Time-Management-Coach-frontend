import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { MdEdit } from 'react-icons/md';
import './TaskReport.css';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import TaskForm from '../TaskForm/TaskForm';
import useGlobalStore from '../../store/useGlobalStore';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../Config';
import { format } from 'date-fns';

function TaskReport({ tasks, setTask, filterStatus }) {
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const navigate = useNavigate();
  const { saveTask, isFocusMode, logTaskChangeInFocusMode } = useGlobalStore();

  useEffect(() => {
    let filtered = [];

    if (filterStatus === 'completed') {
      filtered = tasks.filter((task) => task.status === 'completed');
    } else if (filterStatus === 'pending') {
      filtered = tasks.filter((task) => task.status === 'pending');
    } else if (filterStatus === 'in progress') {
      filtered = tasks.filter((task) => task.status === 'in progress');
    } else if (filterStatus === 'cancelled') {
      filtered = tasks.filter((task) => task.status === 'cancelled');
    } else if (filterStatus === 'deferred') {
      filtered = tasks.filter((task) => task.status === 'deferred');
    } else {
      filtered = tasks.filter((task) => task.status !== 'completed');
    }

    // Sort the filtered tasks chronologically (newest first) by created_at date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA;
    });

    setFilteredTasks(filtered);
  }, [tasks, filterStatus]);

  const saveTaskHandler = async (task) => {
    try {
      const oldTask = tasks.find((t) => t.id === task.id);
      const savedTask = await saveTask(task, true); // true indicates it's an update

      if (isFocusMode && oldTask) {
        logTaskChangeInFocusMode(oldTask, savedTask);
      }

      setEditTask(null);
      setOpen(false);
    } catch (error) {
      console.error('Failed to update task via modal', error);
      toast.error('Failed to update task');
    }
  };

  const handleEditClick = (task) => {
    setEditTask(task);
    setOpen(true);
  };

  const handleSearch = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredData = tasks.filter((task) =>
      task.title.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredTasks(filteredData);
  };

  const getBorderColor = () => {
    switch (filterStatus) {
      case 'completed':
        return '#28a745'; // green
      case 'pending':
        return '#FF0000'; // red
      case 'in progress':
        return '#ffc107'; // yellow
      case 'cancelled':
        return '#7f8c8d'; // grey
      case 'deferred':
        return '#9b59b6'; // purple
      default:
        return '#335f8d'; // default blue for 'all'
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="task-report-container">
      <div className="table-header-row">
        <h3
          className={`table-label ${filterStatus.replace(/\s/g, '-')}-table`}
          style={{ borderLeft: `5px solid ${getBorderColor()}` }}
        >
          Showing:{' '}
          {filterStatus === 'all'
            ? 'All Active Tasks'
            : filterStatus === 'completed'
              ? 'Completed Tasks'
              : filterStatus === 'pending'
                ? 'Pending Tasks'
                : filterStatus === 'in progress'
                  ? 'In Progress Tasks'
                  : filterStatus === 'cancelled'
                    ? 'Cancelled Tasks'
                    : filterStatus === 'deferred'
                      ? 'Deferred Tasks'
                      : 'Tasks'}
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
                <th className="th">S.No</th>
                <th className="th task-name-col">Task Name</th>
                <th className="th">Created Date</th>
                <th className="th">Due Date</th>
                <th className="th">Priority</th>
                <th className="th">Status</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="td empty-state">
                    No tasks found
                  </td>
                </tr>
              ) : (
                filteredTasks
                  .filter((task) => Object.values(task).some((val) => val !== null && val !== ''))
                  .map((taskItem, index) => (
                    <tr key={index}>
                      <td className="td">{index + 1}</td>
                      <td className="td task-name-col" title={taskItem.title}>{taskItem.title || "-"}</td>
                      <td className="td">
                        {formatDate(taskItem.created_at) || "-"}
                      </td>
                      <td className="td">
                        {formatDate(taskItem.due_date) || "-"}
                      </td>
                      <td className="td">{taskItem.priority || "-"}</td>
                      <td className="td">{taskItem.status || "-"}</td>
                      <td className="td">
                        <button
                          className="editButton"
                          onClick={() => handleEditClick(taskItem)}
                          style={{ backgroundColor: getBorderColor() }}
                        >
                          <MdEdit fontSize={16} style={{ marginRight: 4 }} />
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

      <TaskForm
        open={open}
        onSave={saveTaskHandler}
        onClose={() => {
          setOpen(false);
          setEditTask(null);
        }}
        isUpdate={!!editTask}
        editTask={editTask}
      />
    </div>
  );
}

export default TaskReport;

