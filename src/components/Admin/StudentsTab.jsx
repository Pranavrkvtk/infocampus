import React from "react";
import {
  colors,
  Badge,
} from "./AdminStyles";

export default function StudentsTab({
  students,
  searchTerm,
  handleSearchChange,
  handleUpdateRole,
  handleToggleStatus,
  isMobile,
}) {
  const protectedEmails = [
    "pranav@gmail.com",
    "admin@gmail.com",
  ];

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: 16,
        padding: isMobile ? 16 : 20,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: isMobile ? 18 : 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            👨‍🎓 All Students
          </h2>

          <p
            style={{
              fontSize: 12,
              color: colors.textMuted,
              marginTop: 4,
            }}
          >
            Total {students.length} students
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            padding: "8px 14px",
            border: `1px solid ${colors.borderLight}`,
            borderRadius: 40,
            fontSize: 13,
            width: isMobile ? "100%" : 260,
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `2px solid ${colors.borderLight}`,
                background: colors.bgBase,
              }}
            >
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: "center" }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.length > 0 ? (
              students.map((student, index) => {
                const isProtectedAdmin =
                  student.role === "ADMIN" &&
                  protectedEmails.includes(student.email);

                return (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom: `1px solid ${colors.borderLight}`,
                      background:
                        index % 2 === 0
                          ? colors.surface
                          : colors.bgBase,
                      opacity:
                        student.status === "INACTIVE"
                          ? 0.7
                          : 1,
                    }}
                  >
                    <td style={tdStyle}>
                      #{student.id}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background:
                              student.status === "ACTIVE"
                                ? colors.primarySoft
                                : colors.coralSoft,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color:
                              student.status === "ACTIVE"
                                ? colors.primary
                                : colors.coral,
                          }}
                        >
                          {student.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {student.name}
                            </span>

                            {isProtectedAdmin && (
                              <span
                                style={{
                                  fontSize: 9,
                                  padding: "2px 6px",
                                  borderRadius: 20,
                                  background:
                                    colors.coralSoft,
                                  color: colors.coral,
                                }}
                              >
                                🔒 Protected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {student.email}
                    </td>

                    <td style={tdStyle}>
                      <Badge
                        status={
                          student.role || "STUDENT"
                        }
                      />
                    </td>

                    <td style={tdStyle}>
                      <Badge
                        status={
                          student.status || "ACTIVE"
                        }
                      />
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() =>
                            handleUpdateRole(
                              student.id,
                              student.role
                            )
                          }
                          disabled={isProtectedAdmin}
                          style={{
                            ...editBtn,
                            opacity:
                              isProtectedAdmin ? 0.6 : 1,
                            cursor:
                              isProtectedAdmin
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          👑 Edit Role
                        </button>

                        <button
                          onClick={() =>
                            handleToggleStatus(
                              student.id,
                              student.status
                            )
                          }
                          disabled={isProtectedAdmin}
                          style={{
                            ...statusBtn,
                            background:
                              student.status ===
                              "ACTIVE"
                                ? colors.coralSoft
                                : colors.tealSoft,
                            color:
                              student.status ===
                              "ACTIVE"
                                ? colors.coral
                                : colors.teal,
                            opacity:
                              isProtectedAdmin ? 0.6 : 1,
                          }}
                        >
                          {student.status ===
                          "ACTIVE"
                            ? "🔴 Deactivate"
                            : "🟢 Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 60,
                    color: colors.textMuted,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      marginBottom: 12,
                    }}
                  >
                    👥
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {searchTerm
                      ? `No students found matching "${searchTerm}"`
                      : "No students found"}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      {students.length > 0 && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: `1px solid ${colors.borderLight}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Active:{" "}
            {
              students.filter(
                (s) => s.status === "ACTIVE"
              ).length
            }
          </span>

          <span
            style={{
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Inactive:{" "}
            {
              students.filter(
                (s) => s.status === "INACTIVE"
              ).length
            }
          </span>

          <span
            style={{
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            Admins:{" "}
            {
              students.filter(
                (s) => s.role === "ADMIN"
              ).length
            }
          </span>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 10px",
  fontSize: 12,
  fontWeight: 600,
};

const tdStyle = {
  padding: "12px 10px",
  fontSize: 13,
};

const editBtn = {
  padding: "5px 12px",
  borderRadius: 6,
  border: `1px solid ${colors.borderLight}`,
  background: colors.surface,
  color: colors.primary,
  fontSize: 11,
  fontWeight: 600,
};

const statusBtn = {
  padding: "5px 12px",
  borderRadius: 6,
  border: "none",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};