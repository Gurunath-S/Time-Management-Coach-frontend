import React, { useState, useMemo } from "react";
import { FaFire, FaRegClock, FaPauseCircle, FaExclamationTriangle, FaChevronDown, FaChevronRight } from "react-icons/fa";
import Button from '@mui/material/Button';
import { MdLabel, MdFilterList } from 'react-icons/md';
import Chip from '@mui/material/Chip';

function Grid({ title, taskList, color, colorIndex, isFocusMode, onEditTask, onEditPriorityTags }) {
  const [activeFilters, setActiveFilters] = useState({
    complexity: [],
    type: [],
    category: [],
    impact: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate available filters (only show if >5 tasks have that tag)
  const availableFilters = useMemo(() => {
    const tagCounts = { complexity: {}, type: {}, category: {}, impact: {} };
    
    taskList.forEach(task => {
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

    // Only return tags with >5 tasks
    const filters = {};
    Object.keys(tagCounts).forEach(group => {
      filters[group] = Object.keys(tagCounts[group]).filter(tag => tagCounts[group][tag] > 0);
    });

    return filters;
  }, [taskList]);

  // Filter tasks based on active filters
  const filteredTasks = useMemo(() => {
    if (Object.values(activeFilters).every(arr => arr.length === 0)) {
      return taskList;
    }

    return taskList.filter(task => {
      if (!task.priority_tags) return false;
      
      return Object.keys(activeFilters).every(group => {
        if (activeFilters[group].length === 0) return true;
        return activeFilters[group].some(filter => 
          task.priority_tags[group]?.includes(filter)
        );
      });
    });
  }, [taskList, activeFilters]);

  const toggleFilter = (group, tag) => {
    setActiveFilters(prev => ({
      ...prev,
      [group]: prev[group].includes(tag) 
        ? prev[group].filter(f => f !== tag)
        : [...prev[group], tag]
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ complexity: [], type: [], category: [], impact: [] });
  };

  const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', margin: '8px' }}>
      <div>
        <h4 style={{
          marginBottom: "10px",
          fontSize: "1.2rem",
          color: color[colorIndex],
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: "5px"
        }}>
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

      {/* Quick Filters Section */}
      {Object.values(availableFilters).some(arr => arr.length > 0) && (
        <div style={{ marginBottom: '16px' }}>
          {/* Filter Toggle Button */}
          <div 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              marginBottom: showFilters ? '12px' : '0'
            }}
          >
            {showFilters ? <FaChevronDown style={{ marginRight: '6px', color: color[colorIndex] }} /> : <FaChevronRight style={{ marginRight: '6px', color: color[colorIndex] }} />}
            <MdFilterList style={{ marginRight: '6px', color: color[colorIndex] }} />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              Quick Filters {hasActiveFilters && `(${Object.values(activeFilters).flat().length} active)`}
            </span>
            {hasActiveFilters && (
              <Button 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllFilters();
                }}
                style={{ marginLeft: 'auto', fontSize: '0.7rem', minWidth: 'auto', padding: '2px 8px' }}
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Collapsible Filter Content */}
          {showFilters && (
            <div style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
              {Object.entries(availableFilters).map(([group, tags]) => 
                tags.length > 0 && (
                  <div key={group} style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#555', marginRight: '8px' }}>
                      {group.charAt(0).toUpperCase() + group.slice(1)}:
                    </span>
                    {tags.map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => toggleFilter(group, tag)}
                        style={{
                          margin: '2px 4px',
                          fontSize: '0.7rem',
                          backgroundColor: activeFilters[group].includes(tag) ? color[colorIndex] : '#e0e0e0',
                          color: activeFilters[group].includes(tag) ? 'white' : '#333',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid-container">
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredTasks.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
              {taskList.length === 0 ? "No tasks in this category." : "No tasks match the selected filters."}
            </p>
          ) : (
            filteredTasks.map((task, index) => (
              <li
                key={task.id || index}
                style={{ 
                  cursor: isFocusMode ? "pointer" : "default",
                  padding: '12px',
                  margin: '8px 0',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onClick={() => isFocusMode && onEditTask(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: "16px", flex: 1, minWidth: '200px' }}>
                    <strong>{index + 1}. {task.title}</strong>
                    <br />
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      Due: {new Date(task.due_date).toLocaleDateString('en-GB')}
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
                        padding: '6px 12px',
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
                
                {/* Show active priority tags */}
                {task.priority_tags && Object.values(task.priority_tags).some(arr => arr.length > 0) && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(task.priority_tags).map(([group, tags]) =>
                      tags.map(tag => (
                        <Chip
                          key={`${group}-${tag}`}
                          label={tag}
                          size="small"
                          style={{
                            fontSize: '0.6rem',
                            height: '20px',
                            backgroundColor: '#f0f0f0',
                            color: '#666'
                          }}
                        />
                      ))
                    )}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Grid;