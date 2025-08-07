import { useState,useEffect } from 'react';
import './TaskCount.css'
function TaskCount({ tasks, setFilterStatus }) {
  const [taskCount, setTaskCount] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inprogress: 0
  });


  useEffect(() => {
    const total = tasks.filter(task => task.status !== "completed").length;
    const completed = tasks.filter(task => task.status === "completed").length;
    const inprogress = tasks.filter(task => task.status === "in progress").length;
    const pending = tasks.filter(task => task.status === "pending").length;
    setTaskCount({ total, completed, pending, inprogress });
    // console.log("data total:",total)
    // console.log("data com:",completed)
    // console.log("data inprogress:",inprogress)
    // console.log("data pending:",pending)

  }, [tasks]);

  return (
    <div className="task-count-container">
      <div className="task-box total" onClick={() => setFilterStatus("all")}>Total Tasks: {taskCount.total}</div>
      <div className="task-box completed" onClick={() => setFilterStatus("completed")}>Completed: {taskCount.completed}</div>
      <div className="task-box inprogress" onClick={() => setFilterStatus("in progress")}>In Progress: {taskCount.inprogress}</div>
      <div className="task-box pending" onClick={() => setFilterStatus("pending")}>Pending: {taskCount.pending}</div> 
    </div>
  );
}


export default TaskCount