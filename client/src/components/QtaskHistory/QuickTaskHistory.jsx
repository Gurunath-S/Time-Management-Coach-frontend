import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

import './QuickTaskHistory.css';

function QuickTaskHistory() {
  const [qtasks, setQtasks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('quickTasks');
    if (stored) {
      const parsedTasks = JSON.parse(stored);
      // Sort in descending chronological order (newest first)
      parsedTasks.sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });
      setQtasks(parsedTasks);
    }
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Set";
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="qth-container">
      <div className="qth-header-row">
        <button className="qth-back-button" onClick={goBack}>Back</button>
        <h2>All Time Log History</h2>
        {/* Invisible spacer to balance the back button and ensure exact centering of the h2 */}
        <div style={{ width: '80px', visibility: 'hidden' }}>Spacer</div>
      </div>
      <div className="qth-table-wrapper">
        <table className="qth-table">
          <thead>
            <tr>
              <th className="qth-th">Date</th>
              <th className="qth-th">Work Tasks</th>
              <th className="qth-th">Non-Work Tasks</th>
              <th className="qth-th">Notes</th>
              <th className="qth-th">Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {qtasks.length === 0 ? (
              <tr>
                <td className="qth-td" colSpan="6" style={{ textAlign: "center" }}>
                  No tasks found
                </td>
              </tr>
            ) : (
              qtasks.map((taskItem, index) => (
                <tr key={index}>
                  <td className="qth-td">{formatDate(taskItem.date) || "-"}</td>
                  <td className="qth-td qth-td-break">{taskItem.workTasks || "-"}</td>
                  <td className="qth-td qth-td-break">{taskItem.personalTasks || "-"}</td>
                  <td className="qth-td qth-td-break">{taskItem.notes || "-"}</td>
                  <td className="qth-td">{taskItem.timeSpent || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuickTaskHistory;
