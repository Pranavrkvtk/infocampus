// src/components/EnrollPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

console.log('🔥🔥🔥 EnrollPage FILE LOADED!');

export default function EnrollPage({ isMobile, onBack }) {
  console.log('🔥🔥🔥 EnrollPage COMPONENT RENDERING!');
  
  const { state } = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  console.log('🔥 State:', state);
  console.log('🔥 courseId:', courseId);
  console.log('🔥 isMobile:', isMobile);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token && !!userId);
    console.log('🔐 Login status:', !!token && !!userId);
  }, []);

  // Load course data
  useEffect(() => {
    console.log('📥 Loading course data...');
    
    const loadCourse = () => {
      setLoading(true);
      setError(null);
      
      try {
        let courseData = null;
        
        // Try to get course from state
        if (state?.course) {
          console.log('✅ Course from state:', state.course);
          courseData = state.course;
        } 
        // If no course in state, check localStorage
        else {
          const savedCourse = localStorage.getItem('lastViewedCourse');
          if (savedCourse) {
            try {
              courseData = JSON.parse(savedCourse);
              console.log('✅ Course from localStorage:', courseData);
            } catch (e) {
              console.error('Failed to parse saved course:', e);
            }
          }
        }
        
        if (courseData) {
          // Format course data with defaults
          const formattedCourse = {
            id: courseData.id || 0,
            title: courseData.title || 'Course',
            description: courseData.description || 'No description available',
            level: courseData.level || 'All Levels',
            duration: courseData.duration || 'Self-paced',
            price: courseData.price || 49,
            imageUrl: courseData.imageUrl || '',
            instructor: courseData.instructor || 'Expert Instructor',
            members: courseData.members || 0,
            language: courseData.language || 'English',
            category: courseData.category || 'General',
            color: courseData.color || '#3abf94',
            icon: courseData.icon || '📚',
            lastUpdate: courseData.lastUpdate || new Date().toLocaleDateString(),
          };
          
          console.log('✅ Formatted course:', formattedCourse);
          setCourse(formattedCourse);
        } else {
          setError('No course data found. Please go back and select a course.');
          console.error('❌ No course data available');
        }
      } catch (err) {
        console.error('❌ Error loading course:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [state, courseId]);

  // Handle enroll
  const handleEnroll = () => {
    if (!isLoggedIn) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to enroll in this course.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    
    Swal.fire({
      title: 'Enroll Now',
      text: `You are about to enroll in "${course?.title}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enroll',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enrolled! 🎉',
          text: 'You are now enrolled in this course!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title || 'Course',
        text: `Check out this course: ${course?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        title: 'Link Copied!',
        text: 'Course link copied to clipboard.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTopColor: '#3abf94',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }}></div>
        <div>Loading course details...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        background: "#f8f8f6" 
      }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>{error || "Course not found"}</h2>
          <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px" }}>
            Please go back and select a course from the catalog.
          </p>
          <button
            onClick={() => navigate("/my-courses")}
            style={{ 
              background: "#3abf94", 
              color: "#fff", 
              border: "none", 
              borderRadius: "40px", 
              padding: "12px 28px", 
              fontSize: "15px", 
              fontWeight: 700, 
              cursor: "pointer" 
            }}
          >
            Go to My Courses
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = course.color || "#3abf94";
  const secondaryColor = "#1a1a2e";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#f8f8f6" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${secondaryColor} 0%, #16213e 100%)`,
        padding: isMobile ? "16px" : "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        borderBottom: `3px solid ${primaryColor}`,
      }}>
        <button
          onClick={onBack || (() => navigate('/my-courses'))}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ← Back to Courses
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>{course.icon || "💳"}</span>
          <h1 style={{ color: "#fff", margin: 0, fontSize: isMobile ? "20px" : "28px" }}>
            Enroll Now
          </h1>
        </div>
        
        <button
          onClick={handleShare}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "10px 20px",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Share
        </button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "32px 20px" : "48px 40px" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-courses')}>My Courses</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#333', fontWeight: 600 }}>{course.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "40px" }}>
          
          {/* Left: Course Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '40px' }}>{course.icon || "📚"}</span>
              <h1 style={{ fontSize: '28px', margin: 0, color: secondaryColor }}>
                {course.title}
              </h1>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{
                background: primaryColor + '20',
                color: primaryColor,
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                {course.level || 'All Levels'}
              </span>
              <span style={{
                marginLeft: '8px',
                background: '#f0f0f0',
                color: '#666',
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                {course.category || 'General'}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleEnroll}
                disabled={!isLoggedIn}
                style={{
                  background: !isLoggedIn ? "#ccc" : primaryColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "40px",
                  padding: "12px 28px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: !isLoggedIn ? "not-allowed" : "pointer",
                }}
              >
                {!isLoggedIn ? "Login to Enroll" : "Join This Course"}
              </button>
              
              <button
                onClick={handleShare}
                style={{
                  background: "#f5f5f5",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "40px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Share
              </button>
            </div>

            {/* Course Information */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ marginBottom: '16px', color: secondaryColor }}>Course Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Last Update</span>
                  <div style={{ fontWeight: 500 }}>{course.lastUpdate || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Completion</span>
                  <div style={{ fontWeight: 500 }}>{course.duration || 'Self-paced'}</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Members</span>
                  <div style={{ fontWeight: 500 }}>{course.members || 0}</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Level</span>
                  <div style={{ fontWeight: 500 }}>{course.level || 'All Levels'}</div>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Language</span>
                  <div style={{ fontWeight: 500 }}>{course.language || 'English'}</div>
                </div>
                {course.category && (
                  <div>
                    <span style={{ color: '#888', fontSize: '13px' }}>Category</span>
                    <div style={{ fontWeight: 500 }}>{course.category}</div>
                  </div>
                )}
                <div>
                  <span style={{ color: '#888', fontSize: '13px' }}>Instructor</span>
                  <div style={{ fontWeight: 500 }}>{course.instructor || 'Expert Instructor'}</div>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ marginBottom: '12px', color: secondaryColor }}>About This Course</h3>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                {course.description || 'No description available'}
              </p>
            </div>
          </div>

          {/* Right: Pricing */}
          <div>
            <div style={{ 
              background: "#fff", 
              borderRadius: "24px", 
              overflow: "hidden", 
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)", 
              position: isMobile ? "static" : "sticky", 
              top: "80px" 
            }}>
              <div style={{ 
                background: `linear-gradient(135deg, ${secondaryColor}, #16213e)`, 
                padding: "24px", 
                color: "#fff", 
                textAlign: "center" 
              }}>
                <h3 style={{ marginBottom: "6px", fontSize: "20px" }}>Course Pricing</h3>
                <p style={{ opacity: 0.75, fontSize: "13px" }}>Start learning today</p>
              </div>

              <div style={{ padding: "24px" }}>
                <div style={{ 
                  textAlign: "center", 
                  marginBottom: "16px", 
                  padding: "20px", 
                  background: "#f8f9fa", 
                  borderRadius: "16px" 
                }}>
                  <span style={{ fontSize: "52px", fontWeight: 800, color: secondaryColor }}>
                    ${course.price || 49}
                  </span>
                  <span style={{ color: "#666", fontSize: "15px" }}>/one-time</span>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={!isLoggedIn}
                  style={{
                    width: "100%",
                    background: !isLoggedIn ? "#ccc" : primaryColor,
                    color: "#fff",
                    border: "none",
                    borderRadius: "50px",
                    padding: "16px",
                    fontSize: "17px",
                    fontWeight: 700,
                    cursor: !isLoggedIn ? "not-allowed" : "pointer",
                    marginBottom: "14px",
                  }}
                >
                  {!isLoggedIn ? "Login to Enroll" : "Join This Course"}
                </button>

                <p style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>
                  🔒 Secure checkout · 30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}