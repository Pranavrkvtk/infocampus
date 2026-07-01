// src/components/AdminStyles.jsx
export const colors = {
  bgBase: "#F6F8FC",
  surface: "#FFFFFF",
  borderLight: "#E9EDF2",
  
  primary: "#5E5BFF",
  primaryLight: "#8C8AFF",
  primarySoft: "#EEF0FF",
  primaryDark: "#4C47E6",
  
  teal: "#14B895",
  tealLight: "#4FCFB2",
  tealSoft: "#E0F9F2",
  
  coral: "#E8644A",
  coralLight: "#F08F7A",
  coralSoft: "#FEF2EF",
  
  amber: "#E68A2E",
  amberLight: "#F0B06B",
  amberSoft: "#FEF5E8",
  
  purple: "#7C3AED",
  purpleSoft: "#F3E8FF",
  
  textPrimary: "#1E293B",
  textSecondary: "#5A6A85",
  textMuted: "#8C9AB0",
  textFaint: "#B7C1D4",
  
  success: "#16A34A",
  error: "#DC2626",
  warning: "#F59E0B",
  
  gradPrimary: "linear-gradient(135deg, #5E5BFF 0%, #8C8AFF 100%)",
  gradTeal: "linear-gradient(135deg, #14B895 0%, #4FCFB2 100%)",
  gradCoral: "linear-gradient(135deg, #E8644A 0%, #F08F7A 100%)",
  gradAmber: "linear-gradient(135deg, #E68A2E 0%, #F0B06B 100%)",
};

export function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <div
        style={{
          width: 50,
          height: 50,
          border: `3px solid ${colors.borderLight}`,
          borderTop: `3px solid ${colors.primary}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function DateTimeWidget({ isMobile, currentTime }) {
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 10 : 14,
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 14,
        padding: isMobile ? "10px 12px" : "12px 18px",
        width: isMobile ? "100%" : "auto",
        maxWidth: isMobile ? "100%" : "320px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: isMobile ? 38 : 46,
          height: isMobile ? 38 : 46,
          borderRadius: 12,
          background: colors.primarySoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isMobile ? 18 : 22,
          flexShrink: 0,
        }}
      >
        📅
      </div>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: colors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentDate}
        </div>
        <div
          style={{
            fontSize: isMobile ? 11 : 13,
            color: colors.primary,
            fontWeight: 600,
            marginTop: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          🕐 {currentTime}
        </div>
      </div>
    </div>
  );
}

export function Badge({ status }) {
  const map = {
    PUBLISHED: { bg: colors.tealSoft, color: colors.teal },
    DRAFT: { bg: "#F0F2F8", color: colors.textMuted },
    ACTIVE: { bg: colors.tealSoft, color: colors.teal },
    INACTIVE: { bg: colors.coralSoft, color: colors.coral },
    PENDING: { bg: colors.amberSoft, color: colors.amber },
    APPROVED: { bg: colors.tealSoft, color: colors.teal },
    REJECTED: { bg: colors.coralSoft, color: colors.coral },
    Beginner: { bg: colors.primarySoft, color: colors.primary },
    Intermediate: { bg: colors.amberSoft, color: colors.amber },
    Advanced: { bg: colors.coralSoft, color: colors.coral },
  };

  const style = map[status] || { bg: "#F0F2F8", color: colors.textMuted };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "3px 10px",
        borderRadius: 50,
        fontSize: 10.5,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}