// src/components/ProtectedInstructorRoute.js
import { Navigate } from 'react-router-dom';

export default function ProtectedInstructorRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // Check if user is authenticated and has instructor role
  if (!token || role !== 'INSTRUCTOR') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}