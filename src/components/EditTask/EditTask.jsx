import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import './EditTask.css';

function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isUpdate = Boolean(id);
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (isUpdate) {
      fetch(`https://time-management-coach-backend.onrender.com/api/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          const formatDate = (dateString) => {
            const d = new Date(dateString);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
              d.getDate()
            ).padStart(2, '0')}`;
          };

            const safeData = {
                id: data.id || '',
                title: data.title || '',
                created_at: data.created_at ? formatDate(data.created_at) : '',
                due_date: data.due_date ? formatDate(data.due_date) : '',
                priority: data.priority || '',
                note: data.note || '',
                reason: data.reason || '',
                status: data.status || '',
                assigned_to: data.assigned_to || '',
              };

              setTaskId(safeData.id);
              setTitle(safeData.title);
              setCreatedAt(safeData.created_at);
              setDueDate(safeData.due_date);
              setPriority(safeData.priority);
              setNote(safeData.note);
              setReason(safeData.reason);
              setStatus(safeData.status);
              setAssignedTo(safeData.assigned_to);
            })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to fetch task');
        });
    }
  }, [id, isUpdate]);

  const handleSave = useCallback((e) => {
    e.preventDefault();

    const cleanedTask = {
      id: taskId || uuidv4(),
      title,
      created_at: new Date(createdAt),
      due_date: dueDate ? new Date(dueDate) : null,
      priority,
      note,
      reason,
      status,
      assigned_to: assignedTo,
    };

    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate
      ? `https://time-management-coach-backend.onrender.com/api/tasks/${id}`
      : `https://time-management-coach-backend.onrender.com/api/tasks`;

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(cleanedTask),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save task');
        return res.json();
      })
      .then(() => {
        toast.success(isUpdate ? 'Task updated!' : 'Task created!');
        navigate('/');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error saving task');
      });
  }, [taskId, title, createdAt, dueDate, priority, note, reason, status, assignedTo, id, isUpdate, navigate]);

  return (
    <div className="edit-task-container" style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#0b87b1' }}>
        {isUpdate ? 'Edit Task' : 'Add Task'}
      </h1>

      <form onSubmit={handleSave} className="form-grid">
        <div className="form-row">
          <label>Task Name</label>
          <TextField fullWidth required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Task Create Date</label>
          <TextField fullWidth required type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Due Date</label>
          <TextField fullWidth type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Priority (Optional)</label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} fullWidth>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </div>

        {priority === 'high' && (
          <div className="form-row full-width">
            <label>Reason for High Priority</label>
            <TextField fullWidth required value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}

        <div className="form-row">
          <label>Note (Optional)</label>
          <TextField fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} fullWidth required>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in progress">In Progress</MenuItem>
          </Select>
        </div>

        <div className="form-row">
          <label>Assigned To</label>
          <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} fullWidth required>
            <MenuItem value="user1">User 1</MenuItem>
            <MenuItem value="user2">User 2</MenuItem>
            <MenuItem value="user3">User 3</MenuItem>
          </Select>
        </div>

        <div className="form-actions full-width">
          <Button variant="contained" style={{ backgroundColor: '#a1a1a1', color: 'white' }} onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button variant="contained" style={{ backgroundColor: '#0b87b1', color: 'white' }} type="submit">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditTaskPage;
