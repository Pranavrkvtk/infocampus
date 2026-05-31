import React from 'react';

function PracticeExam() {
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
            style={{
              background: '#f59e0b',
              color: '#000',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Upgrade to Premium
          </button>

          <button
            style={{
              background: 'transparent',
              color: '#fff',
              border: '1px solid #475569',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
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