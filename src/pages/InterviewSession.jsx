import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { submitAnswer } from "../api/interview";
import { Spinner } from "../components/Loader";
import ScorePill from "../components/ScorePill";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

export default function InterviewSession() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(location.state?.question || "");
  const [questionIndex, setQuestionIndex] = useState(location.state?.questionIndex ?? 0);
  const [totalQuestions] = useState(location.state?.totalQuestions ?? 0);
  const [answer, setAnswer] = useState("");
  const [lastFeedback, setLastFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    supported, listening, transcript, interim, error: micError, start, stop, reset,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setAnswer(transcript);
  }, [transcript]);

  const toggleMic = async () => {
    setError("");
    if (listening) {
      stop();
    } else {
      reset();
      await start();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (listening) stop();
    setError("");
    setLoading(true);
    try {
      const data = await submitAnswer(sessionId, answer);
      setLastFeedback({ score: data.score, feedback: data.feedback });
      setAnswer("");
      reset();
      if (data.status === "COMPLETED" || !data.nextQuestion) {
        navigate(`/interview/${sessionId}/summary`);
      } else {
        setQuestion(data.nextQuestion);
        setQuestionIndex(data.nextQuestionIndex);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const progressPct = totalQuestions ? ((questionIndex) / totalQuestions) * 100 : 0;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h2>Question {questionIndex + 1}{totalQuestions ? ` / ${totalQuestions}` : ""}</h2>
          <p className="page-sub">Speak your answer or type it below</p>
        </div>
        {lastFeedback && <ScorePill score={lastFeedback.score} />}
      </div>

      {totalQuestions > 0 && (
        <div className="progress-track" style={{ marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {lastFeedback && (
        <div className="feedback-box">
          <strong>Previous answer feedback</strong>
          <p style={{ margin: "6px 0 0", color: "var(--text)" }}>{lastFeedback.feedback}</p>
        </div>
      )}

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
        <p className="question-text">{question}</p>
      </div>

      {error && <p className="error" style={{ marginTop: 16 }}>{error}</p>}
      {micError && <p className="error" style={{ marginTop: 16 }}>{micError}</p>}

      {supported && (
        <div className="mic-wrap" style={{ marginTop: 24 }}>
          <button type="button" className={`mic-btn${listening ? " recording" : ""}`} onClick={toggleMic}>
            {listening ? "■" : "Voice"}
          </button>
          {listening ? (
            <div className="mic-status live" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mic-bars"><span/><span/><span/><span/><span/></span>
              Listening...
            </div>
          ) : (
            <div className="mic-status">Tap to answer by voice</div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-form" style={{ marginTop: 16 }}>
        <textarea rows="6" placeholder="Type or speak your answer..." value={answer + (interim ? " " + interim : "")}
          onChange={(e) => setAnswer(e.target.value)} />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading || !answer.trim()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading && <Spinner />} {loading ? "Submitting" : "Submit Answer"}
          </button>
          <button type="button" className="secondary" onClick={() => { setAnswer(""); reset(); }}>Clear</button>
        </div>
      </form>
    </div>
  );
}
