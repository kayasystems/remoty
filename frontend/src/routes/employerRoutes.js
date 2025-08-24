// Employer module routes
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Employer Layout
import EmployerLayout from '../pages/employer/EmployerLayout';

// Employer Components
import EmployerDashboard from '../components/employer/EmployerDashboard';
// MiraDashboard removed - using EmployerDashboard as primary dashboard
import EmployeesPage from '../components/employer/EmployeesPage';
import BookCoworkingPage from '../components/employer/BookCoworkingPage';
import AttendanceReportsPage from '../components/employer/AttendanceReportsPage';
import EmployerLogin from '../components/employer/EmployerLogin';
import EmployerRegister from '../components/employer/EmployerRegister';
import TasksPage from '../components/employer/TasksPage';
import CreateTaskPage from '../components/employer/CreateTaskPage';
import AddEmployee from '../components/employer/AddEmployee';

// Employer Pages
import CheckoutPage from '../pages/employer/CheckoutPage';
import FindCoworkingSpacesPage from '../pages/employer/FindCoworkingSpacesPage';
import EmployerProfileView from '../pages/employer/EmployerProfileView';
import EmployerProfileEdit from '../pages/employer/EmployerProfileEdit';
import EmployeeDetails from '../pages/employer/EmployeeDetails';
import ViewCoworkingBooking from '../pages/employer/ViewCoworkingBooking';
import BookingDetails from '../pages/employer/BookingDetails';
import EditBooking from '../pages/employer/EditBooking';

import RequireAuth from '../components/RequireAuth';

const EmployerRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/employer/login" element={<EmployerLogin />} />
      <Route path="/employer/register" element={<EmployerRegister />} />
      
      {/* Protected Routes */}
      <Route path="/employer/*" element={
        <RequireAuth>
          <EmployerLayout />
        </RequireAuth>
      }>
        <Route path="dashboard" element={<EmployerDashboard />} />
        {/* MiraDashboard route removed - using EmployerDashboard as primary */}
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="book-coworking" element={<BookCoworkingPage />} />
        <Route path="find-spaces" element={<FindCoworkingSpacesPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="attendance" element={<AttendanceReportsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/create" element={<CreateTaskPage />} />
        <Route path="profile" element={<EmployerProfileView />} />
        <Route path="profile/edit" element={<EmployerProfileEdit />} />
        <Route path="bookings" element={<ViewCoworkingBooking />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="bookings/:id/edit" element={<EditBooking />} />
      </Route>
    </Routes>
  );
};

export default EmployerRoutes;
