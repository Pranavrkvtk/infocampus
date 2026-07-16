// src/components/CourseEnrollmentPage.jsx
import React from 'react';
import EnrollPage from './EnrollPage';

// This component now just re-exports EnrollPage
function CourseEnrollmentPage(props) {
  return <EnrollPage {...props} />;
}

export default CourseEnrollmentPage;
