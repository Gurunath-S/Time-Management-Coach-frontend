import Grid from '../Grid/Grid';
import { useState, useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import { IoAddOutline } from "react-icons/io5";
import Switch from '@mui/material/Switch';
import { toast } from 'react-toastify';
import EditPriorityTags from '../TaskForm/EditPriorityTags';
import QuickTaskForm from '../TaskForm/QuickTaskForm';
import TaskForm from '../TaskForm/TaskForm';
import { MdFilterList } from 'react-icons/md';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FourQuadrants.css';
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
  const navigate = useNavigate();
  // Global filter states
  const [globalFilters, setGlobalFilters] = useState({
    complexity: [],
    type: [],
    category: [],
    impact: []
  });
  const [showGlobalFilters, setShowGlobalFilters] = useState(false);

  useEffect(() => {
  const saved = localStorage.getItem("focusMode");
  if (saved) {
    const { isFocusMode, startTime } = JSON.parse(saved);
    if (isFocusMode) {
      setIsFocusMode(true);
      setStartTime(startTime);
    }
  }
}, []);

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

  // Calculate available filters across all tasks
  const globalAvailableFilters = useMemo(() => {
    const tagCounts = { complexity: {}, type: {}, category: {}, impact: {} };
    
    tasks.forEach(task => {
      if (task.priority_tags) {
        Object.keys(tagCounts).forEach(group => {
          if (task.priority_tags[group]) {
            task.priority_tags[group].forEach(tag => {
              tagCounts[group][tag] = (tagCounts[group][tag] || 0) + 1;
            });
          }
        });
      }
    });

    // Return tags with >0 tasks (you can change to >5 for production)
    const filters = {};
    Object.keys(tagCounts).forEach(group => {
      filters[group] = Object.keys(tagCounts[group]).filter(tag => tagCounts[group][tag] > 0);
    });

    return filters;
  }, [tasks]);

  const toggleGlobalFilter = (group, tag) => {
    setGlobalFilters(prev => ({
      ...prev,
      [group]: prev[group].includes(tag) 
        ? prev[group].filter(f => f !== tag)
        : [...prev[group], tag]
    }));
  };

  const clearAllGlobalFilters = () => {
    setGlobalFilters({ complexity: [], type: [], category: [], impact: [] });
  };

  const hasActiveGlobalFilters = Object.values(globalFilters).some(arr => arr.length > 0);

  const handleTagEdit = (task) => {
    console.log("Edit task clicked:", task.id);
    navigate(`/edit-tags/${task.id}`);
  };

  const handleTagSave = async (updatedTask) => {
    try {
      const response = await axios.put(`https://time-management-coach-backend.onrender.com/api/tasks/${updatedTask.id}`, updatedTask);
      setTask(prev => prev.map(t => t.id === updatedTask.id ? response.data : t));
      toast.success("Priority tags updated");
    } catch (error) {
      console.error("Error saving priority tags", error);
      toast.error("Failed to save priority tags");
    }
  };

    const startFocusMode = () => {
      const now = Date.now();
      localStorage.setItem("focusMode", JSON.stringify({
        isFocusMode: true,
        startTime: now,
      }));

      setIsFocusMode(true);
      setStartTime(now);

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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

    const endFocusMode = () => {
      localStorage.removeItem("focusMode");
        setIsFocusMode(false);
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - startTime) / 1000);

        const formatted = formatTime(timeSpent);

        const postCounts = {};
        gridData.forEach(grid => {
          postCounts[grid.title] = grid.list.length;
        });

        console.log("Focus Mode Time:", formatted);
        toast.success(`Focus Mode Ended. Time Spent: ${formatted}`);
     };


  const handleTaskSave = async (task) => {
    try {
      const axios = (await import('axios')).default;
      if (editTask) {
        const res = await axios.put(`https://time-management-coach-backend.onrender.com/api/tasks/${task.id}`, task, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setTask(prev => prev.map(t => t.id === task.id ? res.data : t));
        console.log("Task updated:", res.data);
        toast.success("Task updated");
      } else {
        const res = await axios.post('https://time-management-coach-backend.onrender.com/api/tasks', task,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}});
        setTask(prev => [...prev, res.data]);
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
        if (setQtasks) {
          setQtasks(prev => [...prev, task]);
        }
      } catch (error) {
        console.error("Error saving quick task:", error);
      }
    }

  const handleSwitchChange = (event) => {
    setSwitchChecked(event.target.checked);
    console.log("Default Switch:", event.target.checked);
    setHideTable(event.target.checked)
  };

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

      {/* Global Filter Section */}
      {Object.values(globalAvailableFilters).some(arr => arr.length > 0) && (
        <div style={{ margin: '20px 15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          {/* Global Filter Toggle Button */}
          <div 
            onClick={() => setShowGlobalFilters(!showGlobalFilters)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              padding: '12px 16px',
              borderBottom: showGlobalFilters ? '1px solid #e0e0e0' : 'none'
            }}
          >
            {showGlobalFilters ? <FaChevronDown style={{ marginRight: '8px', color: '#2196F3' }} /> : <FaChevronRight style={{ marginRight: '8px', color: '#2196F3' }} />}
            <MdFilterList style={{ marginRight: '8px', color: '#2196F3' }} />
            <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
              Filter All Quadrants {hasActiveGlobalFilters && `(${Object.values(globalFilters).flat().length} active)`}
            </span>
            {hasActiveGlobalFilters && (
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllGlobalFilters();
                }}
                style={{ marginLeft: 'auto', fontSize: '0.8rem', minWidth: 'auto', padding: '4px 12px' }}
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Collapsible Global Filter Content */}
          {showGlobalFilters && (
            <div style={{ padding: '16px' }}>
              {Object.entries(globalAvailableFilters).map(([group, tags]) => 
                tags.length > 0 && (
                  <div key={group} style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#555', marginRight: '12px', display: 'inline-block', minWidth: '80px' }}>
                      {group.charAt(0).toUpperCase() + group.slice(1)}:
                    </span>
                    <div style={{ display: 'inline-block' }}>
                      {tags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onClick={() => toggleGlobalFilter(group, tag)}
                          style={{
                            margin: '2px 4px',
                            fontSize: '0.75rem',
                            backgroundColor: globalFilters[group].includes(tag) ? '#2196F3' : '#e0e0e0',
                            color: globalFilters[group].includes(tag) ? 'white' : '#333',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

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
            globalFilters={globalFilters} // Pass global filters to each grid
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
