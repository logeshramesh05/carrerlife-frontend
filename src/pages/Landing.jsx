import { Link } from "react-router-dom";

const capabilities = [
  {
    title: "Career dashboard",
    text: "Track interview performance, resume quality, skill gaps, strengths and recent activity from one workspace.",
    metric: "Career progress",
  },
  {
    title: "Resume intelligence",
    text: "Upload PDF or DOCX resumes, compare them with a job description and receive ATS, match and skill-gap analysis.",
    metric: "ATS + match analysis",
  },
  {
    title: "AI interview coach",
    text: "Run role-specific mock interviews, answer by text or voice, receive scored feedback and review every turn.",
    metric: "Adaptive practice",
  },
];

const flow = [
  ["01", "Create your profile", "Register once and receive a session with access and refresh tokens."],
  ["02", "Build evidence", "Upload resumes and analyze them against the roles you are targeting."],
  ["03", "Practice deliberately", "Start AI interviews by role, domain, difficulty and question count."],
  ["04", "Measure progress", "Use score trends, missing skills and career suggestions to decide what to improve next."],
];

export default function Landing() {
  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <div className="eyebrow">CAREER DEVELOPMENT PLATFORM</div>
          <h1>Turn career preparation into measurable progress.</h1>
          <p className="landing-lede">
            CareerLife combines resume intelligence, AI interview practice and career analytics in one focused workspace built for continuous professional growth.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" to="/register">Start building progress</Link>
            <Link className="button button-secondary" to="/docs">Explore API documentation</Link>
          </div>
          <div className="landing-trust">
            <span>Resume analysis</span>
            <span>AI interviews</span>
            <span>Progress analytics</span>
          </div>
        </div>

        <div className="landing-visual">
          <div className="visual-window">
            <div className="visual-window-bar">
              <span>CareerLife / Overview</span>
              <span>Professional progress</span>
            </div>
            <div className="visual-main-score">
              <div>
                <span className="visual-label">CAREER READINESS</span>
                <strong>78<span>/100</span></strong>
              </div>
              <div className="score-ring"><span>78%</span></div>
            </div>
            <div className="visual-bars">
              <div><span>Interview performance</span><b>84%</b><i><em style={{ width: "84%" }} /></i></div>
              <div><span>Resume ATS readiness</span><b>91%</b><i><em style={{ width: "91%" }} /></i></div>
              <div><span>Skill coverage</span><b>68%</b><i><em style={{ width: "68%" }} /></i></div>
            </div>
            <div className="visual-bottom">
              <div><small>FOCUS AREA</small><strong>System Design</strong></div>
              <div><small>NEXT ACTION</small><strong>Practice a hard interview</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <div className="eyebrow">ONE WORKSPACE</div>
          <h2>Everything you need to improve the next application.</h2>
          <p>CareerLife connects the preparation loop: assess, practice, measure and improve.</p>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article className="capability-card" key={item.title}>
              <div className="card-index">0{capabilities.indexOf(item) + 1}</div>
              <span>{item.metric}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="card-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-process">
        <div className="section-heading">
          <div className="eyebrow">THE CAREERLIFE LOOP</div>
          <h2>A simple system for consistent professional progress.</h2>
        </div>
        <div className="process-grid">
          {flow.map(([number, title, text]) => (
            <div className="process-step" key={number}>
              <b>{number}</b>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <div className="eyebrow">READY WHEN YOU ARE</div>
          <h2>Build evidence. Practice better. Progress with data.</h2>
        </div>
        <Link className="button button-primary" to="/register">Create your workspace</Link>
      </section>

      <footer className="landing-footer">
        <span>CareerLife</span>
        <div><Link to="/docs">API Documentation</Link><Link to="/login">Sign in</Link></div>
      </footer>
    </main>
  );
}
