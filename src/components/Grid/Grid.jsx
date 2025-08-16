import React, { useMemo, useState } from "react";
import { FaFire, FaRegClock, FaPauseCircle, FaExclamationTriangle } from "react-icons/fa";
import Button from '@mui/material/Button';
import { MdLabel } from 'react-icons/md';
import Chip from '@mui/material/Chip';

function Grid({ title, taskList, color, colorIndex, isFocusMode, onEditTask, onEditPriorityTags, globalFilters }) {

  const filteredTasks = useMemo(() => {
    if (!globalFilters || Object.values(globalFilters).every(arr => arr.length === 0)) {
      return taskList;
    }
    return taskList.filter(task => {
      if (!task.priority_tags) return false;
      return Object.keys(globalFilters).every(group => {
        if (globalFilters[group].length === 0) return true;
        return globalFilters[group].some(filter =>
          task.priority_tags[group]?.includes(filter)
        );
      });
    });
  }, [taskList, globalFilters]);

  // Local state for expanded tag view
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTags = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', margin: '8px', height: '500px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <h4 style={{ marginBottom: "10px", fontSize: "1.2rem", color: color[colorIndex], borderBottom: "2px solid #f0f0f0", paddingBottom: "5px" }}>
          {title === "Important & Not Urgent" && <FaRegClock />}
          {title === "Important & Urgent" && <FaFire />}
          {title === "Not Important & Not Urgent" && <FaPauseCircle />}
          {title === "Not Important & Urgent" && <FaExclamationTriangle />}
          <span style={{ marginLeft: "5px" }}>{title}</span>
          <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
            ({filteredTasks.length}/{taskList.length})
          </span>
        </h4>
      </div>

      {/* Tasks */}
      <div className="grid-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredTasks.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              {taskList.length === 0 ? "No tasks in this category." : "No tasks match the selected filters."}
            </p>
          ) : (
            filteredTasks.map((task, index) => {
              const allTags = task.priority_tags ? Object.values(task.priority_tags).flat() : [];
              const showAll = expandedTasks[task.id] || false;
              const visibleTags = showAll ? allTags : allTags.slice(0, 3);
              const hiddenCount = allTags.length - visibleTags.length;

              return (
                <li key={task.id || index} style={{ cursor: isFocusMode ? "pointer" : "default", padding: '12px', margin: '8px 0', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  onClick={() => isFocusMode && onEditTask(task)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: "16px", flex: 1, minWidth: '200px' }}>
                      <strong>{index + 1}. {task.title}</strong>
                      <br />
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        Due: {new Date(task.due_date).toLocaleDateString('en-GB')|| " Not Set"}
                        {task?.suggestion && <strong style={{ color: "red", marginLeft: '8px' }}>{task.suggestion}</strong>}
                      </span>
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: "4px 8px",
                        background: task.priority === "high" ? "#e57373" : task.priority === "normal" ? "#fff176" : "#81C784",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: 'bold'
                      }}>
                        {task.priority}
                      </span>
                      
                      <Button 
                        size="small"
                        onClick={() => onEditPriorityTags(task)}
                        style={{
                          minWidth: 'auto',
                          padding: '2px 10px',
                          backgroundColor: '#ad5fecff',
                          color: 'white',
                          borderRadius: '8px'
                        }}
                      >
                        <MdLabel style={{ marginRight: '4px' }} />
                        Tags
                      </Button>
                    </div>
                  </div>

                  {/* Tags with expand/collapse */}
                  {allTags.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {visibleTags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          style={{
                            fontSize: '0.6rem',
                            height: '20px',
                            backgroundColor: '#f0f0f0',
                            color: '#666'
                          }}
                        />
                      ))}

                      {hiddenCount > 0 && !showAll && (
                        <Chip
                          label={`+${hiddenCount} more`}
                          size="small"
                          style={{
                            fontSize: '0.6rem',
                            height: '20px',
                            backgroundColor: '#e0e0e0',
                            color: '#333',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering task click
                            toggleTags(task.id);
                          }}
                        />
                      )}

                      {showAll && allTags.length > 3 && (
                        <Chip
                          label="Show less"
                          size="small"
                          style={{
                            fontSize: '0.6rem',
                            height: '20px',
                            backgroundColor: '#ddd',
                            color: '#333',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTags(task.id);
                          }}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export default Grid;
