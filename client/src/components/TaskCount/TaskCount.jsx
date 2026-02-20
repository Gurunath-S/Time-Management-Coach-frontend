import { useState, useEffect } from 'react';
import './TaskCount.css'
function TaskCount({ tasks, setFilterStatus, scrollToTasks }) {
  const [taskCount, setTaskCount] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inprogress: 0,
    cancelled: 0,
    deferred: 0
  });


  useEffect(() => {
    const total = tasks.filter(task => task.status !== "completed").length;
    const completed = tasks.filter(task => task.status === "completed").length;
    const inprogress = tasks.filter(task => task.status === "in progress").length;
    const pending = tasks.filter(task => task.status === "pending").length;
    const cancelled = tasks.filter(task => task.status === "cancelled").length;
    const deferred = tasks.filter(task => task.status === "deferred").length;
    setTaskCount({ total, completed, pending, inprogress, cancelled, deferred });

  }, [tasks]);

  const handleClick = (status) => {
    setFilterStatus(status);
    if (scrollToTasks) {
      scrollToTasks();
    }
  };


  return (
    <div className="task-count-container">
      <div className="task-box total" onClick={() => handleClick("all")}>Total Tasks: {taskCount.total}</div>
      <div className="task-box completed" onClick={() => handleClick("completed")}>Completed: {taskCount.completed}</div>
      <div className="task-box inprogress" onClick={() => handleClick("in progress")}>In Progress: {taskCount.inprogress}</div>
      <div className="task-box pending" onClick={() => handleClick("pending")}>Pending: {taskCount.pending}</div>
      <div className="task-box deferred" onClick={() => handleClick("deferred")}>Deferred: {taskCount.deferred}</div>
      <div className="task-box cancelled" onClick={() => handleClick("cancelled")}>Cancelled: {taskCount.cancelled}</div>
    </div>
  );
}


export default TaskCount
