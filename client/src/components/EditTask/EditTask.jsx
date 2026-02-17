import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BACKEND_URL from '../../../Config';
import useGlobalStore from '../../store/useGlobalStore';
import TaskForm from '../TaskForm/TaskForm';
import CircularProgress from '@mui/material/CircularProgress';

function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveTask = useGlobalStore(state => state.saveTask);
  const tasks = useGlobalStore(state => state.tasks);
  const isFocusMode = useGlobalStore(state => state.isFocusMode);
  const logTaskChangeInFocusMode = useGlobalStore(state => state.logTaskChangeInFocusMode);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (!res.ok) throw new Error('Failed to fetch task');

        const data = await res.json();
        setTask(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch task data');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleSave = async (updatedTask, isUpdate) => {
    try {
      const oldTask = task;

      await saveTask(updatedTask, isUpdate);

      if (isFocusMode && isUpdate && oldTask) {
        logTaskChangeInFocusMode(oldTask, updatedTask);
      }

      toast.success('Task updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save task');
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!task) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Task not found</div>;
  }

  return (
    <TaskForm
      open={true}
      editTask={task}
      onSave={handleSave}
      onClose={handleClose}
    />
  );
}

export default EditTaskPage;
