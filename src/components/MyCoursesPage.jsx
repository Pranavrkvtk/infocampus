import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserEnrollments } from "../api/courseApi";

export default function MyCoursesPage({ isMobile, onBack }) {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  

  const handleWatchCourse = (course) => {
    try {
      // Use the videoUrl from the course object
      if (course.videoUrl && course.videoUrl !== "null") {
        window.open(course.videoUrl, "_blank");
      } else {
        alert("Video URL not available for this course");
      }
    } catch (error) {
      console.error("Error watching course:", error);
      alert("Failed to load video");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: isMobile ? "20px" : "40px"
    }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "20px 30px",
        marginBottom: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <button
          onClick={onBack}
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          ← Back to Home
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🎓</span>
          <h1 style={{ margin: 0, fontSize: isMobile ? "24px" : "32px" }}>My Courses</h1>
        </div>
        
        <div style={{
          background: "#667eea",
          padding: "8px 20px",
          borderRadius: "20px",
          color: "#fff",
          fontWeight: 600
        }}>
          {enrolledCourses.length} Enrolled
        </div>
      </div>

      {/* Welcome Message */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        padding: "30px",
        marginBottom: "30px",
        color: "#fff"
      }}>
        <h2 style={{ margin: "0 0 10px 0" }}>
          Welcome back, {localStorage.getItem("userName") || "Student"}! 👋
        </h2>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Continue your learning journey. You have {enrolledCourses.length} active {enrolledCourses.length === 1 ? 'course' : 'courses'}.
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: "#fff",
          borderRadius: "20px"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📖</div>
          <h3>No Courses Enrolled Yet</h3>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Start your learning journey by enrolling in a course.
          </p>
          <button
            onClick={() => navigate("/courses")}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 30px",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "24px"
        }}>
          {enrolledCourses.map(course => (
            <div key={course.id} style={{
              background: "#fff",
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <img
                src={course.imageUrl || "https://picsum.photos/400/200"}
                alt={course.title}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
              
              <div style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>{course.title}</h3>
                <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
                  {course.description}
                </p>
                
                <div style={{ marginBottom: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>Progress</span>
                    <span style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>{course.progress || 0}%</span>
                  </div>
                  <div style={{ background: "#e0e0e0", borderRadius: "10px", height: "6px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${course.progress || 0}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, #667eea, #764ba2)" 
                    }} />
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "15px"
                }}>
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    👨‍🏫 {course.instructor || "TBA"}
                  </span>
                  <button
                    onClick={() => handleWatchCourse(course)}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 20px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px"
                    }}
                  >
                    Watch Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}