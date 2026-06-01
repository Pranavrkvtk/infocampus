import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PracticeExam() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleDemo = () => {
    setShowDemo(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    demoQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: demoQuestions.length,
      percentage: (correct / demoQuestions.length) * 100
    };
  };

  const handleRestartDemo = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  // Demo questions data
  const demoQuestions = [
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      explanation: "Paris is the capital and most populous city of France."
    },
    {
      id: 2,
      text: "Which programming language is known for building React applications?",
      options: ["Python", "Java", "JavaScript", "C++"],
      correctAnswer: "JavaScript",
      explanation: "React is a JavaScript library for building user interfaces."
    },
    {
      id: 3,
      text: "What does CSS stand for?",
      options: [
        "Computer Style Sheets",
        "Creative Style Sheets",
        "Cascading Style Sheets",
        "Colorful Style Sheets"
      ],
      correctAnswer: "Cascading Style Sheets",
      explanation: "CSS stands for Cascading Style Sheets, used for styling web pages."
    },
    {
      id: 4,
      text: "Which HTML tag is used to create a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: "<a>",
      explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML."
    }
  ];

  if (showDemo) {
    const score = showResults ? calculateScore() : null;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            width: '100%',
            background: '#ffffff10',
            backdropFilter: 'blur(12px)',
            border: '1px solid #ffffff20',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Demo Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #ffffff20',
            }}
          >
            <div>
              <span
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}
              >
                DEMO MODE
              </span>
              <h2 style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>
                Practice Exam Demo
              </h2>
            </div>
            <button
              onClick={handleCloseDemo}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Exit Demo
            </button>
          </div>

          {!showResults ? (
            <>
              {/* Question Progress */}
              <div
                style={{
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                  }}
                >
                  <span>Question {currentQuestion + 1} of {demoQuestions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / demoQuestions.length) * 100)}% Complete</span>
                </div>
                <div
                  style={{
                    background: '#ffffff20',
                    height: '8px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: '#f59e0b',
                      height: '100%',
                      width: `${((currentQuestion + 1) / demoQuestions.length) * 100}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div
                style={{
                  marginBottom: '2rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    marginBottom: '1.5rem',
                    lineHeight: '1.6',
                  }}
                >
                  {demoQuestions[currentQuestion].text}
                </h3>

                {/* Options */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {demoQuestions[currentQuestion].options.map((option, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        background: selectedAnswers[currentQuestion] === option
                          ? '#f59e0b20'
                          : '#ffffff08',
                        border: selectedAnswers[currentQuestion] === option
                          ? '2px solid #f59e0b'
                          : '1px solid #ffffff20',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={selectedAnswers[currentQuestion] === option}
                        onChange={() => handleAnswerSelect(currentQuestion, option)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{ fontSize: '1rem' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  style={{
                    background: currentQuestion === 0 ? '#475569' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  style={{
                    background: '#f59e0b',
                    color: '#000',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {currentQuestion === demoQuestions.length - 1 ? 'Submit' : 'Next →'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results Section */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                  }}
                >
                  {score.percentage >= 70 ? '🎉' : '📚'}
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                  Your Score: {score.correct}/{score.total}
                </h2>
                <div
                  style={{
                    background: '#ffffff08',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      color: score.percentage >= 70 ? '#10b981' : '#f59e0b',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {score.percentage.toFixed(0)}%
                  </div>
                  <p style={{ color: '#cbd5e1' }}>
                    {score.percentage >= 70
                      ? 'Great job! You\'re on the right track!'
                      : 'Keep practicing! Upgrade to premium for more practice exams!'}
                  </p>
                </div>

                {/* Question Review */}
                <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Question Review:</h3>
                  {demoQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff08',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <span>
                          {selectedAnswers[idx] === q.correctAnswer ? '✅' : '❌'}
                        </span>
                        <strong>Question {idx + 1}:</strong> {q.text}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                        Your answer: {selectedAnswers[idx] || 'Not answered'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#10b981' }}>
                        Correct answer: {q.correctAnswer}
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: '#94a3b8',
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid #ffffff20',
                        }}
                      >
                        💡 {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginTop: '2rem',
                  }}
                >
                  <button
                    onClick={handleRestartDemo}
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Restart Demo
                  </button>
                  <button
                    onClick={handleUpgrade}
                    style={{
                      background: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Upgrade to Full Access →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Original landing page
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          width: '100%',
          background: '#ffffff10',
          backdropFilter: 'blur(12px)',
          border: '1px solid #ffffff20',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        <span
          style={{
            background: '#f59e0b',
            color: '#000',
            padding: '6px 16px',
            borderRadius: '999px',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          PREMIUM ACCESS
        </span>

        <h1
          style={{
            marginTop: '1.5rem',
            fontSize: '2.5rem',
            fontWeight: '700',
          }}
        >
          Practice Exams
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            marginTop: '1rem',
            lineHeight: '1.8',
            fontSize: '1.05rem',
          }}
        >
          Unlock full-length mock exams, detailed explanations,
          performance analytics, and exam-ready question banks designed
          to help you achieve your target score.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '2rem',
          }}
        >
          <button
            onClick={handleUpgrade}
            style={{
              background: '#f59e0b',
              color: '#000',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Upgrade to Premium
          </button>

          <button
            onClick={handleDemo}
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid #475569',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            View Demo
          </button>
        </div>

        <div
          style={{
            marginTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>✅ Unlimited Mock Tests</div>
          <div>✅ Detailed Solutions</div>
          <div>✅ Performance Analytics</div>
          <div>✅ Exam Simulation Mode</div>
        </div>
      </div>
    </div>
  );
}

export default PracticeExam;