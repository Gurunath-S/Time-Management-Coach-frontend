import { useState, useEffect, useRef } from "react";
import FourQuadrants from "../FourQuadrants/FourQuadrants";
import TaskReport from "../TaskReport/TaskReport";
import TaskCount from "../TaskCount/TaskCount";
import QtaskReport from "../TaskReport/QtaskReport";
import axios from 'axios';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home(isLoggedIn) {
  const [task, setTask] = useState([]);
  const [qtask, setQtask] = useState([]);
  const [hideTable, setHideTable] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const taskTableRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Home component mounted :", isLoggedIn);
    if (!isLoggedIn) {
      localStorage.removeItem('token');
      console.log("User not logged in, redirecting to login page");
      navigate('/login');
    } else {
      console.log("User is logged in, fetching tasks");
    }

    const taskdata = async () => {
      try {
        const [taskRes, qtaskRes] = await Promise.all([
          axios.get('https://time-management-coach-backend.onrender.com/api/tasks', { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('https://time-management-coach-backend.onrender.com/api/qtasks', { 
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        setTask(taskRes.data);
        setQtask(qtaskRes.data);
      } catch (err) {
        console.error("Failed to fetch tasks or qtasks", err);
      }
    };
    taskdata();
  }, []);

  const scrollToTasks = () => {
    if (taskTableRef.current) {
      taskTableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="main">
      <div className="top-left">
        <FourQuadrants 
          tasks={task} 
          setTask={setTask} 
          hideTable={hideTable} 
          setHideTable={setHideTable}
          setQtasks={setQtask} 
        />
      </div>
      <div className="top-right">
        <TaskCount 
          tasks={task} 
          setFilterStatus={setFilterStatus} 
          scrollToTasks={scrollToTasks} 
        />
      </div>
      <div className="task-tables-container">
        <div className="home-task-wrapper">
          <div className="main-tasks-table" ref={taskTableRef}>
            {hideTable && (
              <div className="bottom-row">
                <TaskReport 
                  tasks={task} 
                  setTask={setTask} 
                  filterStatus={filterStatus} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="home-task-wrapper">
          <div className="quick-tasks-table">
            {hideTable && (
              <div className="bottom-row">
                <QtaskReport 
                  qtasks={qtask} 
                  setQtasks={setQtask} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
