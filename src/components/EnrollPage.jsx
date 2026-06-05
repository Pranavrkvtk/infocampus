import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { enrollInCourse } from "../api/courseApi";
// ==================== ENROLL PAGE ====================
export default function EnrollPage({ isMobile, onBack }) {
  // ✅ Course comes from navigate("/enroll", { state: { course } })
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    monthly:  { name: "Monthly",  price: 49,  period: "month",    savings: null,         note: "✓ Full access · Cancel anytime · No commitment" },
    yearly:   { name: "Yearly",   price: 39,  period: "month",    savings: "Save 20%",   note: "✓ Save $120/year · Best for long-term learners" },
    lifetime: { name: "Lifetime", price: 299, period: "one-time", savings: "Best Value", note: "✓ Unlimited access forever · All future updates" },
  };

  // Guard: if someone lands here without a course in state, redirect
  if (!course) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f6" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "24px" }}>No course selected.</p>
          <button
            onClick={() => navigate("/courses")}
            style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "12px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

const handleEnroll = async () => {
  try {
    setIsLoading(true);

    const response = await enrollInCourse(course.id);

    alert(response.data);

    setIsEnrolled(true);

  } catch (error) {
    alert(
      error.response?.data ||
      "Enrollment failed"
    );
  } finally {
    setIsLoading(false);
  }
};

  // ── Success screen ──────────────────────────────────────────────
  if (isEnrolled) {
    return (
      <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "48px 40px", background: "#fff", borderRadius: "24px", maxWidth: "520px", margin: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ color: "#2e7d32", marginBottom: "16px", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "26px" }}>Successfully Enrolled!</h2>
          <p style={{ color: "#666", marginBottom: "8px", fontSize: "15px" }}>
            You now have full access to <strong>{course.title}</strong>.
          </p>
          <p style={{ color: "#888", marginBottom: "32px", fontSize: "14px" }}>Check your email for login details.</p>
          <button
            onClick={() => navigate("/courses")}
            style={{ background: "#3abf94", color: "#fff", border: "none", borderRadius: "40px", padding: "14px 36px", fontSize: "16px", fontWeight: 700, cursor: "pointer", width: "100%" }}
          >
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  const p = plans[selectedPlan];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: "100vh", background: "#f8f8f6" }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: isMobile ? "16px" : "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        borderBottom: "3px solid #3abf94",
      }}>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#fff",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        >
          ← Back to Courses
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>💳</span>
          <h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px", fontFamily: "'Trebuchet MS', sans-serif" }}>Enroll Now</h1>
        </div>
        <div style={{ background: "rgba(58,191,148,0.2)", padding: "8px 16px", borderRadius: "20px" }}>
          <span style={{ color: "#3abf94", fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 600, fontSize: "14px" }}>30-Day Money-Back Guarantee</span>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "40px" }}>

          {/* ── Left: Course Info ── */}
          <div>
            <div style={{ background: course.color + "12", borderRadius: "20px", padding: "24px", marginBottom: "24px", border: `1px solid ${course.color}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "52px" }}>{course.icon}</div>
                <div>
                  <h2 style={{ margin: 0, color: "#1a1a2e", fontSize: "20px", fontFamily: "'Trebuchet MS', sans-serif" }}>{course.title}</h2>
                  <p style={{ color: "#666", marginTop: "6px", fontSize: "13px" }}>
                    {course.level} · {course.duration} · {course.lessons} lessons
                  </p>
                </div>
              </div>
              <p style={{ color: "#555", lineHeight: "1.65", marginBottom: "20px", fontSize: "14px" }}>{course.description}</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>✅ Certificate</span>
                <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>📱 Mobile Access</span>
                <span style={{ background: "#fff3e0", color: "#e65100", padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>💬 24/7 Support</span>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
              <h3 style={{ marginBottom: "20px", color: "#1a1a2e", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "16px" }}>What's Included:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {[
                  "Full HD video library",
                  "Downloadable resources & cheat sheets",
                  "Practice exams with explanations",
                  "Hands-on lab exercises",
                  "Study notes & mind maps",
                  "Instructor Q&A access",
                ].map((item, i, arr) => (
                  <li key={i} style={{ padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "#444" }}>
                    <span style={{ color: "#3abf94", fontWeight: 700, fontSize: "16px" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Right: Pricing ── */}
          <div>
            <div style={{ background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: isMobile ? "static" : "sticky", top: "80px" }}>

              {/* Pricing header */}
              <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", padding: "24px", color: "#fff", textAlign: "center" }}>
                <h3 style={{ marginBottom: "6px", fontFamily: "'Trebuchet MS', sans-serif", fontSize: "20px" }}>Choose Your Plan</h3>
                <p style={{ opacity: 0.75, fontSize: "13px" }}>Start learning today · Cancel anytime</p>
              </div>

              <div style={{ padding: "24px" }}>

                {/* Plan toggle */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "28px", background: "#f0f2f5", padding: "5px", borderRadius: "50px" }}>
                  {Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      style={{
                        flex: 1,
                        padding: "11px 6px",
                        borderRadius: "40px",
                        border: "none",
                        background: selectedPlan === key ? "#3abf94" : "transparent",
                        color: selectedPlan === key ? "#fff" : "#555",
                        fontFamily: "'Trebuchet MS', sans-serif",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        lineHeight: "1.4",
                      }}
                    >
                      {plan.name}
                      {plan.savings && (
                        <span style={{ display: "block", fontSize: "10px", opacity: 0.85 }}>{plan.savings}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Price display */}
                <div style={{ textAlign: "center", marginBottom: "16px", padding: "20px", background: "#f8f9fa", borderRadius: "16px" }}>
                  <span style={{ fontSize: "52px", fontWeight: 800, color: "#1a1a2e", fontFamily: "'Trebuchet MS', sans-serif" }}>
                    ${p.price}
                  </span>
                  {p.period !== "one-time" && (
                    <span style={{ color: "#666", fontSize: "15px" }}>/{p.period}</span>
                  )}
                  {selectedPlan === "yearly" && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        🎉 Billed annually ($468/year)
                      </span>
                    </div>
                  )}
                  {selectedPlan === "lifetime" && (
                    <div style={{ marginTop: "8px" }}>
                      <span style={{ background: "#fff3e0", color: "#ef6c00", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                        ⭐ One-time payment · Lifetime access
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan feature note */}
                <p style={{ color: "#666", fontSize: "13px", textAlign: "center", marginBottom: "24px", lineHeight: "1.6" }}>
                  {p.note}
                </p>

                {/* Enroll button */}
                <button
                  onClick={handleEnroll}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: isLoading ? "#a0d9c4" : "#3abf94",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    padding: "16px",
                    fontSize: "17px",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    fontWeight: 700,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    marginBottom: "14px",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = "0.9"; }}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        display: "inline-block",
                        width: "18px",
                        height: "18px",
                        border: "3px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Processing…
                    </>
                  ) : (
                    `Enroll Now — $${p.price}${p.period !== "one-time" ? `/${p.period}` : ""}`
                  )}
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>
                  🔒 Secure checkout · 30-day money-back guarantee
                </p>

                {/* Payment icons */}
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
                  {["💳", "🟦", "🥧", "📱"].map((icon, i) => (
                    <div key={i} style={{ width: "40px", height: "28px", background: "#f5f5f5", borderRadius: "6px", border: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                      {icon}
                    </div>
                  ))}
                </div>

                {/* Trust badges */}
                <div style={{ display: "flex", justifyContent: "center", gap: "24px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                  {[["⭐ 4.9", "5,000+ ratings"], ["🎓 50K+", "enrolled"], ["🔄 30-day", "refund"]].map(([val, label]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a2e" }}>{val}</div>
                      <div style={{ fontSize: "11px", color: "#999", marginTop: "3px" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}