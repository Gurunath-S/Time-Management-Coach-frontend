// src/components/FourQuadrants/FocusSummary.jsx
import React, { useEffect, useState } from 'react';
import useGlobalStore from '../../../store/useGlobalStore';
import { Card, CardContent, Typography, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../../../../Config';
const FocusSummary = () => {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const token = useGlobalStore(state => state.token);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/focus`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch focus sessions');
        const data = await res.json();
        setSessions(data || []);
      } catch (err) {
        console.error('Failed to fetch focus sessions', err);
      }
    };
    fetchSessions();
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

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px' }}>
      <Button variant="contained" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>Back</Button>
      <Typography variant="h4" gutterBottom style={{ fontWeight: '300', color: '#111', marginBottom: '35px', textAlign: 'center' }}>
        Focus Session Overview
      </Typography>

      {sessions.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center">No focus sessions found.</Typography>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
          {sessions.map((session, index) => (
            <Card key={index} sx={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '24px', flex: '0 1 48%' }}>
              <CardContent>
                <Divider sx={{ marginBottom: '20px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#242222' }}><strong>From:</strong> {formatDateTime(session.startTime)}</Typography>
                  <Typography variant="body2" sx={{ color: '#242222' }}><strong>To:</strong> {formatDateTime(session.endTime)}</Typography>
                  <Typography variant="body2" sx={{ color: '#242222' }}>
                    <strong>Time Spent:</strong> {session.timeSpent ? formatDuration(session.timeSpent) : 'N/A'}
                  </Typography>
                </div>

                <Typography variant="subtitle2" sx={{ fontWeight: 300, color: '#161616', marginTop: '20px', marginBottom: '10px' }}>✅ Tasks Completed:</Typography>

                {session.completedTasks && session.completedTasks.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', color: '#444', marginBottom: 0 }}>
                    {session.completedTasks.map((task, i) => <li key={i} style={{ marginBottom: '6px' }}>{task.title}</li>)}
                  </ul>
                ) : (
                  <Typography variant="body2" color="text.secondary">No tasks completed in this session.</Typography>
                )}

                {session.taskChanges && session.taskChanges.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 300, color: '#161616', marginTop: '20px', marginBottom: '10px' }}>📝 Tasks Edited:</Typography>
                    <ul style={{ paddingLeft: '20px', color: '#444', marginBottom: 0 }}>
                      {session.taskChanges.map((change, i) => (
                        <li key={i} style={{ marginBottom: '8px' }}>
                          <strong>{change.taskTitle || change.taskId}</strong>
                          <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '0.85em', color: '#666' }}>
                            {Object.entries(change.changes || {}).map(([field, val]) => (
                              <li key={field}>
                                {field}: <span style={{ textDecoration: 'line-through', color: '#999' }}>{String(val.before ?? '')}</span> → <span style={{ color: '#2e7d32' }}>{String(val.after ?? '')}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FocusSummary;
