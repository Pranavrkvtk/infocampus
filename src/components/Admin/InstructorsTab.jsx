import React, { useState } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { createInstructor } from "../../api/adminApi"; // Make sure this import is correct

export default function InstructorsTab({ 
  instructors, 
  isMobile, 
  handleDeleteInstructor, 
  handleToggleInstructorStatus,
  fetchAllInstructors 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddInstructor = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Add New Instructor',
      html: `
        <input id="name" class="swal2-input" placeholder="Full Name" required>
        <input id="email" class="swal2-input" placeholder="Email" required>
        <input id="password" type="password" class="swal2-input" placeholder="Password" required>
        <input id="expertise" class="swal2-input" placeholder="Expertise (e.g., CCNA, CCNP)">
        <input id="phone" class="swal2-input" placeholder="Phone Number">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const expertise = document.getElementById('expertise').value;
        const phone = document.getElementById('phone').value;
        
        if (!name || !email || !password) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        return { name, email, password, expertise, phone };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Adding...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        await createInstructor(formValues);
        await fetchAllInstructors();
        Swal.fire({ title: 'Success!', text: 'New instructor has been added.', icon: 'success', timer: 2000, showConfirmButton: false });
      } catch (error) {
        console.error("Add instructor error:", error);
        Swal.fire({ title: 'Failed!', text: error.response?.data?.message || 'Failed to add instructor', icon: 'error' });
      }
    }
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{ position: "relative", flex: 1, maxWidth: isMobile ? "100%" : "300px" }}>
          <input
            type="text"
            placeholder="🔍 Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "10px",
              border: `1px solid ${colors.borderLight}`,
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s"
            }}
          />
        </div>
        <button
          onClick={handleAddInstructor}
          style={{
            background: colors.gradPrimary,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px"
          }}
        >
          <span>➕</span> Add Instructor
        </button>
      </div>

      {/* Instructors Grid */}
      {filteredInstructors.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px",
          background: colors.surface,
          borderRadius: "20px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍🏫</div>
          <p style={{ color: colors.textSecondary }}>No instructors found</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px"
        }}>
          {filteredInstructors.map(instructor => (
            <div
              key={instructor.id}
              style={{
                background: colors.surface,
                borderRadius: "16px",
                overflow: "hidden",
                border: `1px solid ${colors.borderLight}`,
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Header with Status */}
              <div style={{
                padding: "20px",
                background: `linear-gradient(135deg, ${colors.primary}10, ${colors.purple}10)`,
                borderBottom: `1px solid ${colors.borderLight}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background: colors.gradPrimary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "#fff"
                  }}>
                    👨‍🏫
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>{instructor.name}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: colors.textSecondary }}>{instructor.email}</p>
                  </div>
                </div>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: instructor.status === "ACTIVE" ? colors.tealSoft : colors.coralSoft,
                  color: instructor.status === "ACTIVE" ? colors.teal : colors.coral
                }}>
                  {instructor.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", color: colors.textSecondary }}>Expertise</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {(instructor.expertise || "CCNA, CCNP").split(",").map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: colors.primarySoft,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: colors.primary
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: `1px solid ${colors.borderLight}`
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: colors.textSecondary }}>Courses</div>
                    <div style={{ fontSize: "20px", fontWeight: 700 }}>{instructor.coursesCount || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: colors.textSecondary }}>Students</div>
                    <div style={{ fontSize: "20px", fontWeight: 700 }}>{instructor.studentsCount || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: colors.textSecondary }}>Rating</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#fbbf24" }}>★ {instructor.rating || 4.5}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "16px"
                }}>
                  <button
                    onClick={() => handleToggleInstructorStatus(instructor.id, instructor.status)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: instructor.status === "ACTIVE" ? colors.coralSoft : colors.tealSoft,
                      color: instructor.status === "ACTIVE" ? colors.coral : colors.teal,
                      fontSize: "12px"
                    }}
                  >
                    {instructor.status === "ACTIVE" ? "🔒 Deactivate" : "✅ Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteInstructor(instructor.id, instructor.name)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: colors.coralSoft,
                      color: colors.coral,
                      fontSize: "12px"
                    }}
                  >
                    🗑️ Delete
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