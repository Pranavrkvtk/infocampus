import React, { useState } from "react";
import { colors } from "./AdminStyles";
import Swal from "sweetalert2";
import { createInstructor } from "../../api/adminApi";

export default function InstructorsTab({
  instructors = [],
  isMobile,
  handleDeleteInstructor,
  handleToggleInstructorStatus,
  fetchAllInstructors
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // Filter instructors based on search term
  const searchedInstructors = instructors.filter(instructor =>
    instructor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Filter based on showInactive toggle
  const filteredInstructors = showInactive 
    ? searchedInstructors 
    : searchedInstructors.filter(instructor => 
        (instructor.status || "ACTIVE").toUpperCase() === "ACTIVE"
      );

  // Count active and inactive
  const activeCount = instructors.filter(i => 
    (i.status || "ACTIVE").toUpperCase() === "ACTIVE"
  ).length;
  const inactiveCount = instructors.filter(i => 
    (i.status || "ACTIVE").toUpperCase() === "INACTIVE"
  ).length;

  const handleAddInstructor = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Instructor",
      confirmButtonText: "Add Instructor",
      confirmButtonColor: "#6366f1",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      focusConfirm: false,
      html: `
        <input 
          id="swal-name" 
          class="swal2-input" 
          placeholder="Full Name *" 
          autocomplete="off"
        />
        <input 
          id="swal-email" 
          type="email"
          class="swal2-input" 
          placeholder="Email *" 
          autocomplete="off"
        />
        <input 
          id="swal-password" 
          type="password" 
          class="swal2-input" 
          placeholder="Password *" 
          autocomplete="new-password"
        />
        <input 
          id="swal-expertise" 
          class="swal2-input" 
          placeholder="Expertise (e.g., CCNA, CCNP)" 
          autocomplete="off"
        />
        <input 
          id="swal-phone" 
          class="swal2-input" 
          placeholder="Phone Number" 
          autocomplete="off"
        />
      `,
      didOpen: () => {
        // Force clear autofilled values
        document.getElementById("swal-name").value = "";
        document.getElementById("swal-email").value = "";
        document.getElementById("swal-password").value = "";
        document.getElementById("swal-expertise").value = "";
        document.getElementById("swal-phone").value = "";
      },
      preConfirm: () => {
        const name      = document.getElementById("swal-name").value.trim();
        const email     = document.getElementById("swal-email").value.trim();
        const password  = document.getElementById("swal-password").value.trim();
        const expertise = document.getElementById("swal-expertise").value.trim();
        const phone     = document.getElementById("swal-phone").value.trim();

        if (!name || !email || !password) {
          Swal.showValidationMessage("Please fill in all required fields (*)");
          return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage("Please enter a valid email address");
          return false;
        }

        if (password.length < 6) {
          Swal.showValidationMessage("Password must be at least 6 characters");
          return false;
        }

        return { name, email, password, expertise, phone };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: "Adding Instructor...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        await createInstructor(formValues);

        // Safely refresh list
        if (typeof fetchAllInstructors === "function") {
          await fetchAllInstructors();
        }

        Swal.fire({
          title: "Success!",
          text: `${formValues.name} has been added as an instructor.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Add instructor error:", error);
        Swal.fire({
          title: "Failed!",
          text:
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to add instructor. Please try again.",
          icon: "error"
        });
      }
    }
  };

  const getInstructorStatus = (instructor) =>
    (instructor.status || "ACTIVE").toUpperCase();

  return (
    <div>
      {/* Header with Search, Filter, and Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            flex: 1
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: isMobile ? "100%" : "200px",
              maxWidth: isMobile ? "100%" : "300px"
            }}
          >
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
                transition: "all 0.2s",
                boxSizing: "border-box",
                background: "var(--surface)",
                color: "var(--text-primary)"
              }}
            />
          </div>

          {/* ✅ Show Inactive Toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
                accentColor: colors.primary
              }}
            />
            Show Inactive ({inactiveCount})
          </label>
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
            fontSize: "14px",
            transition: "opacity 0.2s",
            whiteSpace: "nowrap"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span>➕</span> Add Instructor
        </button>
      </div>

      {/* ✅ Stats Bar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "12px 16px",
          background: "var(--surface)",
          borderRadius: "10px",
          marginBottom: "20px",
          border: `1px solid ${colors.borderLight}`,
          flexWrap: "wrap"
        }}
      >
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Total
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginLeft: "8px",
              color: "var(--text-primary)"
            }}
          >
            {instructors.length}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Active
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginLeft: "8px",
              color: colors.teal
            }}
          >
            {activeCount}
          </span>
        </div>
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Inactive
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginLeft: "8px",
              color: colors.coral
            }}
          >
            {inactiveCount}
          </span>
        </div>
        {searchTerm && (
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Showing
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                marginLeft: "8px",
                color: "var(--text-primary)"
              }}
            >
              {filteredInstructors.length}
            </span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredInstructors.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--surface)",
            borderRadius: "20px",
            border: `1px solid ${colors.borderLight}`
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍🏫</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            {searchTerm
              ? `No instructors match "${searchTerm}"`
              : showInactive
              ? "No inactive instructors found"
              : "All instructors are active"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "var(--primary-soft)",
                color: "var(--primary)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        /* Instructors Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px"
          }}
        >
          {filteredInstructors.map((instructor) => {
            const status = getInstructorStatus(instructor);
            const isActive = status === "ACTIVE";

            return (
              <div
                key={instructor.id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1px solid ${isActive ? colors.borderLight : "#fecaca"}`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  opacity: isActive ? 1 : 0.75,
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px -5px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* ✅ Inactive Banner */}
                {!isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "-30px",
                      background: "#dc2626",
                      color: "#fff",
                      padding: "4px 30px",
                      fontSize: "10px",
                      fontWeight: 700,
                      transform: "rotate(45deg)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    Inactive
                  </div>
                )}

                {/* Card Header */}
                <div
                  style={{
                    padding: "20px",
                    background: `linear-gradient(135deg, ${colors.primary}10, ${colors.purple}10)`,
                    borderBottom: `1px solid ${colors.borderLight}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: isActive ? colors.gradPrimary : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        color: "#fff",
                        flexShrink: 0
                      }}
                    >
                      {isActive ? "👨‍🏫" : "🚫"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--text-primary)"
                        }}
                      >
                        {instructor.name || "Unnamed"}
                      </h3>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {instructor.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: isActive ? colors.tealSoft : colors.coralSoft,
                      color: isActive ? colors.teal : colors.coral,
                      flexShrink: 0
                    }}
                  >
                    {isActive ? "● Active" : "○ Inactive"}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: "16px 20px" }}>
                  {/* Expertise Tags */}
                  <div style={{ marginBottom: "12px" }}>
                    <span
                      style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                    >
                      Expertise
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginTop: "6px"
                      }}
                    >
                      {(instructor.expertise || "General")
                        .split(",")
                        .map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              background: "var(--primary-soft)",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "var(--primary)"
                            }}
                          >
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: `1px solid ${colors.borderLight}`
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                      >
                        Courses
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {instructor.coursesCount ?? 0}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                      >
                        Students
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {instructor.studentsCount ?? 0}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                      >
                        Rating
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#fbbf24"
                        }}
                      >
                        ★ {instructor.rating ?? "4.5"}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "16px" }}
                  >
                    <button
                      onClick={() =>
                        handleToggleInstructorStatus &&
                        handleToggleInstructorStatus(instructor.id, status)
                      }
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: isActive ? colors.coralSoft : colors.tealSoft,
                        color: isActive ? colors.coral : colors.teal,
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      {isActive ? "🔒 Deactivate" : "✅ Activate"}
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteInstructor &&
                        handleDeleteInstructor(instructor.id, instructor.name)
                      }
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: 600,
                        cursor: "pointer",
                        background: colors.coralSoft,
                        color: colors.coral,
                        fontSize: "12px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}