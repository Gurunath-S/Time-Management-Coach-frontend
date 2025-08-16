import React, { useEffect, useState } from 'react';

import './QuickTaskHistory.css';

function QuickTaskHistory() {
  const [qtasks, setQtasks] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('quickTasks');
    if (stored) setQtasks(JSON.parse(stored));
  }, []);

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="qth-container">
      <h2>All Quick Task History</h2>
      <button className="qth-back-button" onClick={goBack}>Back</button>
      <div className="qth-table-wrapper">
        <table className="qth-table">
          <thead>
            <tr>
              <th className="qth-th">Date</th>
              <th className="qth-th">Work Tasks</th>
              <th className="qth-th">Non-Work Tasks</th>
              <th className="qth-th">Assigned By</th>
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
                  <td className="qth-td">{new Date(taskItem.date).toLocaleDateString('en-GB')}</td>
                  <td className="qth-td">{taskItem.workTasks}</td>
                  <td className="qth-td">{taskItem.personalTasks}</td>
                  <td className="qth-td">{taskItem.assigned_by}</td>
                  <td className="qth-td">{taskItem.notes}</td>
                  <td className="qth-td">{taskItem.timeSpent}</td>
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
