import React from 'react';
import { useNavigate } from 'react-router-dom';

function UpgradePage() {
  const navigate = useNavigate();

  const handlePayment = () => {
    // Handle payment logic here
    alert('Processing payment...');
    // After successful payment, navigate to exam dashboard
    // navigate('/dashboard');
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

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
          maxWidth: '600px',
          width: '100%',
          background: '#ffffff10',
          backdropFilter: 'blur(12px)',
          border: '1px solid #ffffff20',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
          }}
        >
          Upgrade to Premium
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            marginBottom: '2rem',
          }}
        >
          Choose your plan and unlock all features
        </p>

        {/* Pricing Plans */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {/* Monthly Plan */}
          <div
            style={{
              background: '#ffffff08',
              border: '1px solid #ffffff20',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handlePayment()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                  Monthly Plan
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Billed monthly, cancel anytime
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  $19.99
                  <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>
                    /mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly Plan (Popular) */}
          <div
            style={{
              background: '#f59e0b20',
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handlePayment()}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: '#f59e0b',
                color: '#000',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              MOST POPULAR
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                  Yearly Plan
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Save 40% compared to monthly
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  $119.99
                  <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>
                    /yr
                  </span>
                </div>
                <div style={{ color: '#10b981', fontSize: '0.85rem' }}>
                  Save $80
                </div>
              </div>
            </div>
          </div>

          {/* Lifetime Plan */}
          <div
            style={{
              background: '#ffffff08',
              border: '1px solid #ffffff20',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handlePayment()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                  Lifetime Access
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  One-time payment, forever access
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  $299.99
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features included */}
        <div
          style={{
            borderTop: '1px solid #ffffff20',
            paddingTop: '1.5rem',
            marginTop: '0.5rem',
          }}
        >
          <p
            style={{
              fontWeight: '600',
              marginBottom: '1rem',
            }}
          >
            All plans include:
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.9rem',
              color: '#cbd5e1',
            }}
          >
            <div>✅ Unlimited mock exams</div>
            <div>✅ Detailed video solutions</div>
            <div>✅ Performance tracking</div>
            <div>✅ 24/7 support</div>
            <div>✅ Downloadable resources</div>
            <div>✅ Priority support</div>
          </div>
        </div>

        {/* Payment methods */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.85rem',
          }}
        >
          Secure payment powered by Stripe
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
              fontSize: '1.5rem',
            }}
          >
            💳 🏦 🍎
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradePage;