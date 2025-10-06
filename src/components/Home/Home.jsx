import { useState, useEffect, useRef } from "react";
import FourQuadrants from "../FourQuadrants/FourQuadrants";
import TaskReport from "../TaskReport/TaskReport";
import TaskCount from "../TaskCount/TaskCount";
import QtaskReport from "../TaskReport/QtaskReport";
import api from '../../utils/api'; // <-- use the wrapper
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Home({ isLoggedIn }) {
  const [task, setTask] = useState([]);
  const [qtask, setQtask] = useState([]);
  const [hideTable, setHideTable] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const taskTableRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Home component mounted :", isLoggedIn);
    // if (!isLoggedIn) {
    //   // If not logged in, remove token and redirect
    //   localStorage.removeItem('token');
    //   console.log("User not logged in, redirecting to login page");
    //   navigate('/login');
    //   return;
    // }

    const taskdata = async () => {
      try {
        const [taskRes, qtaskRes] = await Promise.all([
          api.get('/api/tasks'),
          api.get('/api/qtasks')
        ]);
        console.log("Fetched tasks:", taskRes);
        setTask(taskRes.data);
        setQtask(qtaskRes.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.");
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          console.error("Failed to fetch tasks or qtasks", err);
           toast.error("Failed to fetch your tasks. Please try again later.");
        }
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
