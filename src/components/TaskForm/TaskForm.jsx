import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import './TaskForm.css'
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify'

function TaskForm({ open, onSave, onClose, editTask = null, setTask }) {
    const isUpdate = !!editTask;
    const [newtask, setNewTask] = useState({
        id: "",
        title: "",
        created_at: "",
        due_date: "",
        priority: "",
        note: "",
        reason: "",
        status: "",
        assigned_to: "",
    })

    useEffect(() => {
        if (editTask) {
        const formatDate = (dateString) => {
            const d = new Date(dateString);
            const year = d.getFullYear();
            const month = (`0${d.getMonth() + 1}`).slice(-2);
            const day = (`0${d.getDate()}`).slice(-2);
            return `${year}-${month}-${day}`;
        };

        setNewTask({
            ...editTask,
            created_at: formatDate(editTask.created_at),
            due_date: editTask.due_date ? formatDate(editTask.due_date) : "",
        });
        } else {
            setNewTask({
                id: "",
                title: "",
                created_at: "",
                due_date: "",
                priority: "",
                note: "",
                reason: "",
                status: "",
                assigned_to: "",
            })
        }
    }, [editTask])
    
    const handlechange = (e) => {
        const { name, value } = e.target
        setNewTask((prev) => ({
            ...prev,
            [name]: value
        }))

    }
        const handleSave = (e) => {
            e.preventDefault();

            // Pass clean task back to parent (FourQuadrants)
            onClose(); // Close the modal
            const cleanedTask = {
                ...newtask,
                created_at: new Date(newtask.created_at),
                due_date: new Date(newtask.due_date),
                id: newtask.id || uuidv4(),
            };

            // Send to parent
            if (typeof onSave === 'function') {
                onSave(cleanedTask);
            }
        };



    return (
        <>
            <Dialog open={open}>
                <form className="dialog-form" onSubmit={handleSave}>
                    <DialogTitle style={{ textAlign: "center", color: 'blue' }}>{isUpdate ? 'Edit Task' : 'Add Task'}</DialogTitle>
                    <DialogContent>
                        <div className="form-row">
                            <label>Task Name</label>
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
                        <div className="form-row">
                            <label>Task Create Date</label>
                            <TextField
                                
                                required
                                type="date"
                                name="created_at"
                                variant="outlined"
                                value={newtask.created_at}
                                InputLabelProps={{ shrink: true }}
                                onChange={handlechange}
                            />
                        </div>
                        <div className="form-row">
                            <label>Due Date</label>
                            <TextField
                                type="date"
                                name="due_date"
                                variant="outlined"
                                value={newtask.due_date}
                                InputLabelProps={{ shrink: true }}
                                onChange={handlechange}
                            />
                        </div>

                        <div className="form-row">
                            <label>Priority (Optional)</label>
                            <Select
                                name="priority"
                                value={newtask.priority}
                                onChange={handlechange}
                                defaultValue="" required>
                                <MenuItem value="high">High</MenuItem>
                                <MenuItem value="normal">Normal</MenuItem>
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="" disabled></MenuItem>
                            </Select>
                        </div>
                        {newtask.priority === "high" && (
                            <div className="form-row">
                                <label>Reason for High Priority</label>
                                <TextField
                                required
                                type="text"
                                name="reason"
                                variant="outlined"
                                value={newtask.reason || ""}
                                onChange={handlechange}
                                />
                            </div>
                            )}

                            <div className="form-row">
                            <label>Note (Optional)</label>
                            <TextField
                                type="text"
                                name="note"
                                variant="outlined"
                                value={newtask.note || ""}
                                onChange={handlechange}
                            />
                            </div>

                        <div className="form-row">
                            <label>Status</label>
                            <Select name="status"
                              
                                value={newtask.status}
                                defaultValue=""
                                onChange={handlechange}required>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in progress">In Progress</MenuItem>
                            </Select>
                        </div>

                        <div className="form-row">
                            <label>Assigned To</label>
                            <Select
                               
                                name="assigned_to"
                                value={newtask.assigned_to}
                                defaultValue=""
                                onChange={handlechange} required>
                                <MenuItem value="user1">User 1</MenuItem>
                                <MenuItem value="user2">User 2</MenuItem>
                                <MenuItem value="user3">User 3</MenuItem>
                            </Select>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button style={{backgroundColor:"#a1a1a1ff", color:"white"}} onClick={onClose}>Cancel</Button> 
                         <Button style={{backgroundColor:"#0b87b1ff", color:"white"}} type='submit'>Save</Button> {/*{ isUpdate ? "Edit" : "Save"} */}
                    </DialogActions>
                </form>
            </Dialog>

        </>
    )
}
export default TaskForm
