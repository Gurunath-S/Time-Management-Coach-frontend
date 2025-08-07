import Grid from '../Grid/Grid'
import { useState, useEffect } from 'react';
import './FourQuadrants.css'
import TaskForm from '../TaskForm/TaskForm';
import Button from '@mui/material/Button';
import { IoAddOutline } from "react-icons/io5";
import Switch from '@mui/material/Switch';
import { toast } from 'react-toastify'
import EditPriorityTags from '../TaskForm/EditPriorityTags';
import QuickTaskForm from '../TaskForm/QuickTaskForm';

const label = { inputProps: { 'aria-label': 'Size switch demo' } };

function FourQuadrants({ tasks, setTask, setHideTable, setQtasks }) {
  const color = ["#2196F3", "#F44336", "#000000", "#FF9800"];
  const [gridData, setGridData] = useState([]);
  const [open, setOpen] = useState(false)
  const [openqt, setOpenqt] = useState(false)
  const [switchChecked, setSwitchChecked] = useState(true);
  const [editTask, setEditTask] = useState(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [preFocusGridCount, setPreFocusGridCount] = useState({});
  const [openTagEditor, setOpenTagEditor] = useState(false);
  const [taskToTagEdit, setTaskToTagEdit] = useState(null);

  const handleTagEdit = (task) => {
    setTaskToTagEdit(task);
    setOpenTagEditor(true);
  };

  const handleTagSave = async (updatedTask) => {
    try {
      // Replace with your actual API call
      // const response = await axios.put(`http://localhost:5000/api/tasks/${updatedTask.id}`, updatedTask);
      // const savedTask = response.data;
      setTask(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      toast.success("Priority tags updated");
    } catch (error) {
      console.error("Error saving priority tags", error);
      toast.error("Failed to save priority tags");
    }
  };

  const startFocusMode = () => {
    setIsFocusMode(true);
    setStartTime(Date.now());
    const initialCounts = {};
    gridData.forEach(grid => {
      initialCounts[grid.title] = grid.list.length;
    });
    setPreFocusGridCount(initialCounts);
    toast.info("Focus Mode Started!");
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setOpen(true);
  };

  const endFocusMode = () => {
    setIsFocusMode(false);
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    const postCounts = {};
    gridData.forEach(grid => {
      postCounts[grid.title] = grid.list.length;
    });
    console.log("Focus Mode Time (sec):", timeSpent);
    console.log("Before:", preFocusGridCount);
    console.log("After:", postCounts);
    toast.success(`Focus Mode Ended. Time Spent: ${timeSpent}s`);
  };

  const handleTaskSave = async (task) => {
    try {
      if (editTask) {
        // Replace with your actual API call
        // const res = await axios.put(`http://localhost:5000/api/tasks/${task.id}`, task);
        setTask(prev => prev.map(t => t.id === task.id ? task : t));
        toast.success("Task updated");
      } else {
        // Replace with your actual API call
        // const res = await axios.post('http://localhost:5000/api/tasks', task);
        setTask(prev => [...prev, task]);
        toast.success("Task created");
      }
      setEditTask(null);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save task", error);
      toast.error("Something went wrong");
    }
  };

  const handleQtaskSave = (task) => {
    try {
      setQtasks(prev => [...prev, task]);
      toast.success('Quick Task created')
    } catch (error) {
      console.error("Error saving quick task:", error);
    }
  }

  const handleSwitchChange = (event) => {
    setSwitchChecked(event.target.checked);
    console.log("Default Switch:", event.target.checked);
    setHideTable(event.target.checked)
  };

  useEffect(() => {
    const categorizeTasksByPriority = (tasks) => {
      const impUrgentGrid = [], impNotUrgentGrid = [], notImpUrgentGrid = [], notImpNotUrgentGrid = [];
      const today = new Date();
      const offsetToday = new Date(today.getTime() + 5.5 * 60 * 60 * 1000);
      const todayDate = offsetToday.toISOString().split("T")[0];
      let weekLastDate = new Date(offsetToday);
      weekLastDate.setDate(weekLastDate.getDate() + 5);
      weekLastDate = weekLastDate.toISOString().split("T")[0];

      for (let single of tasks) {
        if (single.status === "completed") continue;
        const dueDate = single.due_date ? new Date(single.due_date).toISOString().split("T")[0] : null;
        const createdAt = single.created_at ? new Date(single.created_at).toISOString().split("T")[0] : null;

        if (!dueDate) {
          notImpNotUrgentGrid.push(single);
          continue;
        }
        if (dueDate === todayDate && single.priority === "high") {
          impUrgentGrid.push(single);
        } else if (dueDate > todayDate && dueDate <= weekLastDate && (single.priority === "high" || single.priority === "normal")) {
          impNotUrgentGrid.push(single);
        } else if (createdAt === todayDate && dueDate === todayDate) {
          notImpUrgentGrid.push(single);
        } else if (dueDate < todayDate && single.priority === "high") {
          single.suggestion = "overdueTask";
          impUrgentGrid.push(single);
        } else {
          notImpNotUrgentGrid.push(single);
        }
      }

      const updatedTask = [
        { title: "Important & Not Urgent", list: impNotUrgentGrid },
        { title: "Important & Urgent", list: impUrgentGrid },
        { title: "Not Important & Not Urgent", list: notImpNotUrgentGrid },
        { title: "Not Important & Urgent", list: notImpUrgentGrid }
      ];
      setGridData(updatedTask);
    };

    categorizeTasksByPriority(tasks);
  }, [tasks]);

  return (
    <>
      <div>
        <Button variant="contained" style={{ fontWeight: "bolder", marginLeft: 15 }} onClick={() => setOpen(true)}>
          <IoAddOutline /> Add Task
        </Button>
        <Button variant="outlined" style={{ fontWeight: "bold", marginLeft: 10 }} onClick={() => startFocusMode()}>
          Focus Mode
        </Button>
        {isFocusMode && (
          <Button variant="contained" color="error" style={{ fontWeight: "bold", marginLeft: 10 }} onClick={endFocusMode}>
            Exit Focus Mode
          </Button>
        )}
        <Button variant="contained" style={{ fontWeight: "bolder", marginLeft: 15, display: 'flex', marginTop: 10 }} onClick={() => setOpenqt(true)}>
          <IoAddOutline /> Add Quick Task
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 15 }}>
          <label htmlFor="toggleSwitch" name="toggle">Toggle to show table</label>
          <Switch {...label} checked={switchChecked} onChange={handleSwitchChange} size="medium" id='toggleSwitch' name="toggle" />
        </div>
      </div>

      <div className='gird-content'>
        <p>Aim to focus on Important and Not Urgent tasks to avoid these becoming urgent. This is a key trait of highly productive people</p>
        <p>Reprioritize your tasks by changing due dates or priority to focus on what matters most.</p>
      </div>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {gridData.map((grid, index) => (
          <Grid
            key={index}
            title={grid.title}
            taskList={grid.list}
            color={color}
            colorIndex={index}
            isFocusMode={isFocusMode}
            onEditTask={handleEditTask}
            onEditPriorityTags={handleTagEdit}
          />
        ))}
      </div>

      <TaskForm
        open={open}
        onSave={handleTaskSave}
        onClose={() => {
          setOpen(false);
          setEditTask(null);
        }}
        isUpdate={!!editTask}
        editTask={editTask}
        setTask={setTask}
      />
      <QuickTaskForm
        open={openqt}
        onSave={handleQtaskSave}
        onClose={() => {
          setOpenqt(false);
          setEditTask(null);
        }}
        editTask={editTask}
      />
      <EditPriorityTags
        open={openTagEditor}
        onClose={() => setOpenTagEditor(false)}
        task={taskToTagEdit}
        onSave={handleTagSave}
        onEditPriorityTags={handleTagEdit}
      />
    </>
  );
}

export default FourQuadrants