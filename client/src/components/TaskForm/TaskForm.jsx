import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './TaskForm.css';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import enGB from 'date-fns/locale/en-GB';

function TaskForm({ open, onSave, onClose, editTask = null, setTask }) {
  const isUpdate = !!editTask;

  const [newtask, setNewTask] = useState({
    id: '',
    title: '',
    created_at: '',
    due_date: '',
    priority: '',
    note: '',
    reason: '',
    status: ''
  });

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return format(d, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (open) {
      if (editTask) {
        setNewTask({
          ...editTask,
          created_at: editTask.created_at ? formatDateForInput(editTask.created_at) : '',
          due_date: editTask.due_date ? formatDateForInput(editTask.due_date) : '',
        });
      } else {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        setNewTask({
          id: '',
          title: '',
          created_at: todayStr, // Default to today
          due_date: '',
          priority: '',
          note: '',
          reason: '',
          status: ''
        });
      }
    }
  }, [open, editTask]);


  const handlechange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, newValue) => {
    if (!newValue || isNaN(newValue)) {
      setNewTask((prev) => ({ ...prev, [name]: '' }));
      return;
    }

    try {
      const y = newValue.getFullYear();
      const m = String(newValue.getMonth() + 1).padStart(2, '0');
      const d = String(newValue.getDate()).padStart(2, '0');
      setNewTask((prev) => ({ ...prev, [name]: `${y}-${m}-${d}` }));
    } catch (e) {
      console.error("Date conversion error", e);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const requiredFields = ['title', 'created_at', 'priority', 'status'];
    const missingFields = requiredFields.filter((field) => !newtask[field]);

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate due date is not before created date
    if (newtask.due_date) {
      const dueDate = getDateObject(newtask.due_date);
      const createdDate = getDateObject(newtask.created_at);

      if (dueDate && createdDate && dueDate < createdDate) {
        alert("Due date cannot be before the created date.");
        return;
      }
    }

    if (newtask.priority === 'high' && !newtask.reason) {
      alert("Please provide a reason for high priority.");
      return;
    }

    const toLocalISO = (dateStr) => {
      if (!dateStr) return null;
      const [y, m, dPart] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, dPart).toISOString();
    };

    const cleanedTask = {
      ...newtask,
      id: newtask.id || uuidv4(),
      created_at: newtask.created_at ? toLocalISO(newtask.created_at) : null,
      due_date: newtask.due_date ? toLocalISO(newtask.due_date) : null,
    };

    if (typeof onSave === 'function') {
      onSave(cleanedTask, isUpdate);
    }

    setNewTask({
      id: '',
      title: '',
      created_at: '',
      due_date: '',
      priority: '',
      note: '',
      reason: '',
      status: '',
    });

    onClose();
  };

  const getDateObject = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (y < 100) {
      date.setFullYear(y);
    }
    return date;
  };

  return (
    <Dialog open={open}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
        <form className="dialog-form" onSubmit={handleSave}>
          <DialogTitle style={{ textAlign: 'center', color: 'blue' }}>
            {isUpdate ? 'Edit Task' : 'Add Task'}
          </DialogTitle>

          <DialogContent>
            <div className="form-row full-width">
              <label>Task Name <span style={{ color: 'red' }}>*</span></label>
              <TextField
                autoFocus
                required
                type="text"
                name="title"
                variant="outlined"
                value={newtask.title}
                onChange={handlechange}
              />
            </div>

            <div className="form-columns">
              <div className="form-column">
                <div className="form-row">
                  <label>Task Create Date<span style={{ color: 'red' }}>*</span></label>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={getDateObject(newtask.created_at)}
                    onChange={(newValue) => handleDateChange('created_at', newValue)}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </div>

                <div className="form-row">
                  <label>Priority<span style={{ color: 'red' }}>*</span></label>
                  <Select
                    name="priority"
                    value={newtask.priority}
                    onChange={handlechange}
                    defaultValue=""
                    required
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </div>

                <div className="form-row">
                  <label>Status<span style={{ color: 'red' }}>*</span></label>
                  <Select
                    name="status"
                    value={newtask.status}
                    defaultValue=""
                    onChange={handlechange}
                    required
                  >
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in progress">In Progress</MenuItem>
                  </Select>
                </div>
              </div>

              <div className="form-column">
                <div className="form-row">
                  <label>Due Date (Optional)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <DatePicker
                      format="dd/MM/yyyy"
                      value={getDateObject(newtask.due_date)}
                      onChange={(newValue) => handleDateChange('due_date', newValue)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />

                    {newtask.due_date && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          setNewTask((prev) => ({ ...prev, due_date: '' }))
                        }
                        style={{ minWidth: '80px', padding: '4px 8px', height: '56px' }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>


                <div className="form-row">
                  <label>Note (Optional)</label>
                  <TextField
                    type="text"
                    name="note"
                    variant="outlined"
                    value={newtask.note || ''}
                    onChange={handlechange}
                    multiline
                    rows={4}
                    inputProps={{ maxLength: 4000 }}
                  />
                  <small style={{ color: '#666' }}>
                    {newtask.note?.length || 0}/4000 characters
                  </small>
                </div>


              </div>
            </div>

            {newtask.priority === 'high' && (
              <div className="form-row full-width">
                <label>Reason for High Priority<span style={{ color: 'red' }}>*</span></label>

                <TextField
                  required
                  type="text"
                  name="reason"
                  variant="outlined"
                  value={newtask.reason || ''}
                  onChange={handlechange}
                  multiline
                  rows={4}
                  inputProps={{ maxLength: 4000 }}
                />
              </div>
            )}

          </DialogContent>

          <DialogActions>
            <Button style={{ backgroundColor: '#a1a1a1ff', color: 'white' }} onClick={onClose}>
              Cancel
            </Button>
            <Button style={{ backgroundColor: '#0b87b1ff', color: 'white' }} type="submit">
              Save
            </Button>
          </DialogActions>
        </form>
      </LocalizationProvider>
    </Dialog>
  );
}

export default TaskForm;
