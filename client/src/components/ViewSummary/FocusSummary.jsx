import React, { useEffect, useState } from 'react';
import useGlobalStore from '../../store/useGlobalStore';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { Card, CardContent, Typography, Divider, Button, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../Config';
import { format } from 'date-fns';
import './FocusSummary.css';


const FocusSummary = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = useGlobalStore(state => state.token);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/focus`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch focus sessions');
        const data = await res.json();

        // Sort sessions in descending chronological order (newest first)
        const sortedSessions = (data || []).sort((a, b) => {
          const dateA = new Date(a.startTime || 0);
          const dateB = new Date(b.startTime || 0);
          return dateB - dateA;
        });

        // Prepend active session if Focus Mode is ON
        const { isFocusMode, focusStartTime, focusCompletedTasks, focusTaskChanges } = useGlobalStore.getState();
        if (isFocusMode && focusStartTime) {
          const activeSession = {
            id: 'active-session', // Dummy ID
            isActive: true,
            startTime: new Date(focusStartTime).toISOString(),
            endTime: new Date().toISOString(), // Mock end time as now
            timeSpent: Math.floor((Date.now() - focusStartTime) / 1000),
            completedTasks: focusCompletedTasks,
            taskChanges: focusTaskChanges,
          };
          setSessions([activeSession, ...sortedSessions]);
        } else {
          setSessions(sortedSessions);
        }
      } catch (err) {
        console.error('Failed to fetch focus sessions', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [token]);

  const formatDuration = (secs) => {
    const seconds = Math.floor(secs); // It is already in seconds
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h ? `${h}h ` : ''}${m ? `${m}m ` : ''}${s}s`;
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTimeOnly = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatChangeValue = (field, value) => {
    if (!value) return '';
    if (field.toLowerCase().includes('date')) {
      return formatDateOnly(value);
    }
    return String(value);
  };

  return (
    <div className="focus-summary-container">
      <div className="focus-summary-header">
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
          className="back-button"
        >
          &larr; Back
        </Button>
        <Typography variant="h4" className="page-title">
          Focus Session Overview
        </Typography>
      </div>

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
        </div>
      ) : sessions.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: '40px' }}>
          No focus sessions found.
        </Typography>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session, index) => (
            <div key={index} className="session-card" style={session.isActive ? { border: '2px solid #3b82f6', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' } : {}}>
              <div className="card-header">
                <div>
                  <span className="session-date">{formatDateOnly(session.startTime)}</span>
                  {session.isActive && <span style={{ marginLeft: '10px', backgroundColor: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active Now</span>}
                </div>
                <span className="session-duration">
                  {session.isActive ? 'Ongoing...' : (session.timeSpent ? formatDuration(session.timeSpent) : '0s')}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span>Started: {formatTimeOnly(session.startTime)}</span>
                  <span>{session.isActive ? 'Currently Active' : `Ended: ${formatTimeOnly(session.endTime)}`}</span>
                </div>

                <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

                <Typography variant="subtitle2" className="section-title">
                  <IoMdCheckmarkCircleOutline /> Tasks Completed
                </Typography>

                {session.completedTasks && session.completedTasks.length > 0 ? (
                  <ul className="task-list">
                    {session.completedTasks.map((task, i) => (
                      <li key={i} className="task-item">
                        {task.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">No tasks completed.</div>
                )}

                {session.taskChanges && session.taskChanges.length > 0 && (
                  <>
                    <Typography variant="subtitle2" className="section-title" style={{ marginTop: '24px' }}>
                      <FaRegEdit />Tasks Edited
                    </Typography>
                    <ul className="task-list">
                      {session.taskChanges.map((change, i) => (
                        <li key={i} className="task-item" style={{ flexDirection: 'column', gap: '4px' }}>
                          <strong>{change.taskTitle || change.taskId}</strong>
                          <div className="change-log">
                            {Object.entries(change.changes || {}).map(([field, val]) => (
                              <div key={field}>
                                <span style={{ color: '#94a3b8', fontSize: '0.8em', textTransform: 'capitalize', fontWeight: 'bolder' }}>{field}: </span>
                                <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>
                                  {formatChangeValue(field, val.before)}
                                </span>
                                <span style={{ margin: '0 4px', color: '#cbd5e1' }}>&rarr;</span>
                                <span style={{ color: '#22c55e' }}>
                                  {formatChangeValue(field, val.after)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FocusSummary;
