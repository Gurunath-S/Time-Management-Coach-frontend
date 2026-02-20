import './HelpPage.css';
import helpIllustration from '../../assets/help-illustration.svg';
import { FaClock, FaExclamationTriangle, FaCalendarCheck, FaRegCalendarAlt, FaRobot } from 'react-icons/fa';
import { MdOutlineTipsAndUpdates, MdArrowForward } from 'react-icons/md';

function HelpPage() {
  return (
    <div className="help-container">
      <div className="help-header">
        <h1>
          Time Management Coach <span className="highlight">Logic</span>
        </h1>
        <p className="subtitle">Understand how we prioritize your tasks for maximum productivity.</p>
      </div>

      <div className="help-main-content">
        {/* Intro & Visual Section */}
        <div className="help-intro-section">
          <div className="help-illustration-wrapper">
            <img src={helpIllustration} alt="Productivity Illustration" className="help-illustration" />
          </div>
          <div className="help-text">
            <h3> The Eisenhower Matrix & More</h3>
            <p>
              We use a smart prioritization logic based on the Eisenhower Matrix, combined with your deadlines
              and task importance, to automatically sort your tasks into actionable quadrants.
            </p>
          </div>
        </div>

        {/* Quadrants Grid */}
        <div className="quadrants-grid">

          {/* Important & Not Urgent */}
          <div className="quadrant-card q-blue">
            <div className="q-card-header">
              <div className="q-icon"><FaCalendarCheck /></div>
              <h5>Important & Not Urgent</h5>
            </div>
            <div className="q-content">
              <p>
                Tasks that are important and <b>due this week</b> (next 7 days).
                Focus on these to prevent them from becoming urgent crises later.
              </p>
            </div>
          </div>

          {/* Important & Urgent */}
          <div className="quadrant-card q-red">
            <div className="q-card-header">
              <div className="q-icon"><FaExclamationTriangle /></div>
              <h5>Important & Urgent</h5>
            </div>
            <div className="q-content">
              <p>
                High priority tasks <b>due today</b>. These are your "Do First" tasks.
                Overdue important tasks also stay here until completed.
              </p>
            </div>
          </div>

          {/* Not Important & Not Urgent */}
          <div className="quadrant-card q-green">
            <div className="q-card-header">
              <div className="q-icon"><FaRegCalendarAlt /></div>
              <h5>Not Important & Not Urgent</h5>
            </div>
            <div className="q-content">
              <p>
                Tasks with flexible deadlines or no due dates.
                These are "Do Later" tasks that don't require immediate attention.
              </p>
              <p className="note">
                <b>Note:</b> Tasks without a due date go here by default.
              </p>
            </div>
          </div>

          {/* Not Important & Urgent */}
          <div className="quadrant-card q-orange">
            <div className="q-card-header">
              <div className="q-icon"><FaClock /></div>
              <h5>Not Important & Urgent</h5>
            </div>
            <div className="q-content">
              <p>
                Tasks created and due today, or <b>Overdue/Due this Week</b> but with Normal/Low priority.
                These are urgent deadlines but not strategically high priority.
              </p>
            </div>
          </div>

          {/* Auto-Important Tags */}
          <div className="quadrant-card q-purple full-width">
            <div className="q-card-header">
              <div className="q-icon"><FaRobot /></div>
              <h5>Auto-Important Logic</h5>
            </div>
            <div className="q-content">
              <p>
                To save you time, tasks tagged with these keywords are <b>automatically marked as Important</b>:
              </p>
              <div className="tags-row">
                <span className="tag">Strategic Work</span>
                <span className="tag">Deadline</span>
                <span className="tag">Project Delivery Work</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Other Apps Section */}
      <div className="other-apps-section">
        <div className="section-header">
          <MdOutlineTipsAndUpdates className="header-icon" />
          <h4>Recommended Tools</h4>
        </div>

        <div className="apps-grid">
          <div className="app-card">
            <div className="app-info">
              <h5>Decision Coach</h5>
              <p>A helpful app to guide you through making better decisions using proven techniques and frameworks.</p>
            </div>
            <a href="https://decisioncoach.onrender.com/" target="_blank" rel="noopener noreferrer" className="app-link">
              Visit App <MdArrowForward />
            </a>
          </div>

          <div className="app-card">
            <div className="app-info">
              <h5>Gratitude Coach</h5>
              <p>An app designed to help you cultivate gratitude and mindfulness in your daily life with easy-to-follow exercises.</p>
            </div>
            <a href="https://www.mygratitudecoach.org/" target="_blank" rel="noopener noreferrer" className="app-link">
              Visit App <MdArrowForward />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;
