import { useState, useEffect } from "react";
import FourQuadrants from "../FourQuadrants/FourQuadrants";
import TaskReport from "../TaskReport/TaskReport";
import TaskCount from "../TaskCount/TaskCount";
import QtaskReport from "../TaskReport/QtaskReport";
import axios from 'axios';
import './Home.css';

function Home() {
  const [task, setTask] = useState([]);
  const [qtask, setQtask] = useState([]);
  const [hideTable, setHideTable] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    
    const taskdata =async ()=>{
      try {
        const [taskRes, qtaskRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tasks'),
          axios.get('http://localhost:5000/api/qtasks')
        ]);
        setTask(taskRes.data);
        setQtask(qtaskRes.data);
      } catch (err) {
        console.error("Failed to fetch tasks or qtasks", err);
      }
    };

    taskdata();
  }, []);
  

  return (
    <div className="main">
      
      <div className="top-left">
        <FourQuadrants tasks={task} setTask={setTask} hideTable={hideTable} setHideTable={setHideTable} />
      </div>

      <div className="top-right">
        <TaskCount tasks={task} setFilterStatus={setFilterStatus} />
      </div>

      <div className="task-tables-container">
        <div className="main-tasks-table">
          {hideTable && (
            <div className="bottom-row">
              <TaskReport tasks={task} setTask={setTask} filterStatus={filterStatus} />
            </div>
          )}</div>
          <div className="quick-tasks-table">
          {hideTable && (
            <div className="bottom-row">
              <QtaskReport qtasks={qtask} setQtasks={setQtask} />
            </div>
          )}
        </div>
    </div>
    </div>
  );
}


export default Home;
