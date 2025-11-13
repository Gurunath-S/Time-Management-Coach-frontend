import './HelpPage.css';

function HelpPage() {
  return (
    <>
      <div className='helphead'>
        <h4>
          Time Management Coach <span style={{ color: "blue" }}>Logic</span>
        </h4>
      </div>

      <div className="helpmain">
        <div className='helpImg'>
          <img alt="helpImg" src="./help.avif" />
        </div>

        <div className='quardant'>
          <div className='impnoturg'>
            <h5>Important & Not Urgent</h5>
            <p>
              This quadrant shows all important tasks that are <b>due this week</b>, meaning from today up to the next 7 days, based on their priority level.
            </p>
          </div>

          <div className='impurg'>
            <h5>Important & Urgent</h5>
            <p>
              This quadrant includes tasks that are high priority and <b>due today</b>. For example, if you created a task last week and it is due today, it appears here. If you don't complete the task by today, it will appear as overdue the next day but still remain in this quadrant.
            </p>
          </div>

          <div className='notimpnoturg'>
            <h5>Not Important & Not Urgent</h5>
            <p>
              This quadrant shows all other tasks that are not urgent or important. <b>These tasks have more flexible deadlines and can be completed later</b>.
            </p>
            <p style={{ marginTop: '8px', color: '#444' }}>
              <b>Default Quadrant:</b> If a task does <b>not have a due date</b>, it is automatically placed in this quadrant by default.
            </p>
          </div>

          <div className='notimpurg'>
            <h5>Not Important & Urgent</h5>
            <p>
              This quadrant displays tasks that are <b>created today and also due today</b>, but have a normal or low priority.
            </p>
          </div>

          {/* New section for Auto-Important Tags */}
          <div className='autoimp' style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
            <h5>Auto-Important Tags</h5>
            <p>
              Tasks tagged with any of the following will be <b>automatically marked as Important (High Priority)</b>:
            </p>
            <ul>
              <li><b>Strategic Work</b></li>
              <li><b>Deadline</b></li>
              <li><b>Project Delivery Work</b></li>
            </ul>
            <p>
              This helps you quickly identify and prioritize critical tasks without manual intervention.
            </p>
          </div>
        </div>
      </div>

      <div className="other-apps-section" style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid #ccc' }}>
        <h4 className='h4'>Other Apps You Can Use</h4>
        <div className="apps-list">
          <div className="app-item">
            <h5>Decision Coach</h5>
            <p>A helpful app to guide you through making better decisions using proven techniques and frameworks.</p>
            <a href="https://decisioncoach.onrender.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
              Visit Decision Coach
            </a>
          </div>

          <div className="app-item">
            <h5>Gratitude Coach</h5>
            <p>An app designed to help you cultivate gratitude and mindfulness in your daily life with easy-to-follow exercises.</p>
            <a href="https://www.mygratitudecoach.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
              Visit Gratitude Coach
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default HelpPage;
