// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import './styles/globals.css';

import TopBar from './components/TopBar'; // ✅ Login/Logout top bar
import RequireAuth from './components/RequireAuth'; // ✅ Route guard

import EmployerLayout from './pages/employer/EmployerLayout';
import EmployerDashboard from './components/employer/EmployerDashboard';
// MiraDashboard removed - using EmployerDashboard as primary dashboard
import EmployeesPage from './components/employer/EmployeesPage';
import BookCoworkingPage from './components/employer/BookCoworkingPage';
import AttendanceReportsPage from './components/employer/AttendanceReportsPage';
import EmployerLogin from './components/employer/EmployerLogin';
import EmployerRegister from './components/employer/EmployerRegister';
import CheckoutPage from './pages/employer/CheckoutPage';
import FindCoworkingSpacesPage from './pages/employer/FindCoworkingSpacesPage';
import EmployerProfileView from './pages/employer/EmployerProfileView';
import EmployerProfileEdit from './pages/employer/EmployerProfileEdit';
import EmployeeDetails from './pages/employer/EmployeeDetails';
import ViewCoworkingBooking from "./pages/employer/ViewCoworkingBooking";
import AddEmployee from './components/employer/AddEmployee';
import BookingDetails from './pages/employer/BookingDetails';
import EditBooking from './pages/employer/EditBooking';
import TasksPage from './components/employer/TasksPage';
import CreateTaskPage from './components/employer/CreateTaskPage';
import EditTaskPage from './components/employer/EditTaskPage';
import TaskDetailPage from './components/employer/TaskDetailPage';
import CoworkingBookingWizard from './components/employer/CoworkingBookingWizard';
import BookingConfirmation from './pages/employer/BookingConfirmation';

import NotificationsPage from './components/employer/NotificationsPage';
import ProfilePage from './components/employer/ProfilePage';

// Coworking Components
import CoworkingLogin from './components/coworking/CoworkingLogin';
import CoworkingRegister from './components/coworking/CoworkingRegister';
import CoworkingDashboard from './components/coworking/CoworkingDashboard';
import CoworkingLayout from './pages/coworking/CoworkingLayout';

// Coworking Space Management
import AllSpaces from './components/coworking/spaces/AllSpaces';
import AddNewSpace from './components/coworking/spaces/AddNewSpace';
import EditCoworkingSpace from './components/coworking/spaces/EditCoworkingSpace';
import ViewCoworkingSpaceDetails from './components/coworking/ViewCoworkingSpaceDetails';


// Coworking Booking Management
import AllBookings from './components/coworking/bookings/AllBookings';
import CalendarView from './components/coworking/bookings/CalendarView';
import BookingHistory from './components/coworking/bookings/BookingHistory';

// Coworking Analytics
import RevenueAnalytics from './components/coworking/analytics/RevenueAnalytics';
import PerformanceStats from './components/coworking/analytics/PerformanceStats';
import OccupancyReports from './components/coworking/analytics/OccupancyReports';

// Coworking Other Pages
import Notifications from './components/coworking/Notifications';
import Profile from './components/coworking/Profile';
import Settings from './components/coworking/Settings';
import HelpSupport from './components/coworking/HelpSupport';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAllSpaces from './components/admin/spaces/AllSpaces';
import AdminPendingSpaces from './components/admin/spaces/PendingSpaces';
import AdminVerifiedSpaces from './components/admin/spaces/VerifiedSpaces';
import CoworkingSpaceDetail from './components/admin/spaces/CoworkingSpaceDetail';

// Employee Components
import EmployeeLogin from './pages/employee/EmployeeLogin';
import EmployeeRegister from './pages/employee/EmployeeRegister';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeProtectedRoute from './components/employee/EmployeeProtectedRoute';

// Conditional TopBar component
function ConditionalTopBar() {
  const location = useLocation();
  const isCoworkingRoute = location.pathname.startsWith('/coworking');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEmployeeRoute = location.pathname.startsWith('/employee');
  
  // Don't show employer TopBar on coworking, admin, or employee routes
  if (isCoworkingRoute || isAdminRoute || isEmployeeRoute) {
    return null;
  }
  
  return <TopBar />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ConditionalTopBar />
        <Routes>
          {/* Public employer routes */}
          <Route path="/employer/login" element={<EmployerLogin />} />
          <Route path="/employer/register" element={<EmployerRegister />} />
          
          {/* Public coworking routes */}
          <Route path="/coworking/login" element={<CoworkingLogin />} />
          <Route path="/coworking/register" element={<CoworkingRegister />} />
          
          {/* Public admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Coworking protected routes with layout */}
          <Route path="/coworking" element={<CoworkingLayout />}>
            <Route path="dashboard" element={<CoworkingDashboard />} />
            
            {/* Space Management Routes */}
            <Route path="spaces" element={<AllSpaces />} />
            <Route path="spaces/add" element={<AddNewSpace />} />
            <Route path="spaces/:spaceId/edit" element={<EditCoworkingSpace />} />
            <Route path="spaces/:spaceId/details" element={<ViewCoworkingSpaceDetails />} />
            
            {/* Booking Management Routes */}
            <Route path="bookings" element={<AllBookings />} />
            <Route path="bookings/calendar" element={<CalendarView />} />
            <Route path="bookings/history" element={<BookingHistory />} />
            
            {/* Analytics Routes */}
            <Route path="analytics/revenue" element={<RevenueAnalytics />} />
            <Route path="analytics/performance" element={<PerformanceStats />} />
            <Route path="analytics/occupancy" element={<OccupancyReports />} />
            
            {/* Other Coworking Routes */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpSupport />} />
          </Route>

          {/* 🧪 TEMPORARY: Direct route to test EditCoworkingSpace without layout */}
          <Route path="/test-edit-space/:spaceId" element={<EditCoworkingSpace />} />

          {/* ✅ Protected employer routes */}
          <Route
            path="/employer"
            element={
              <RequireAuth>
                <EmployerLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/add" element={<AddEmployee />} />
            <Route path="employee/:id" element={<EmployeeDetails />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/create" element={<CreateTaskPage />} />
            <Route path="tasks/:taskId/edit" element={<EditTaskPage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="coworking/find" element={<FindCoworkingSpacesPage />} />
            <Route path="coworking/book" element={<BookCoworkingPage />} />
            <Route path="coworking/checkout" element={<CoworkingBookingWizard />} />
            <Route path="coworking/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="coworking/bookings" element={<ViewCoworkingBooking />} />
            <Route path="coworking/booking/:id" element={<BookingDetails />} />
            <Route path="coworking/booking/:id/edit" element={<EditBooking />} />
            <Route path="attendance" element={<AttendanceReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Admin protected routes with layout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="spaces" element={<Navigate to="/admin/spaces/all" replace />} />
            <Route path="spaces/all" element={<AdminAllSpaces />} />
            <Route path="spaces/pending" element={<AdminPendingSpaces />} />
            <Route path="spaces/verified" element={<AdminVerifiedSpaces />} />
            <Route path="spaces/:spaceId" element={<CoworkingSpaceDetail />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/register" element={<EmployeeRegister />} />
          
          {/* Employee protected routes with layout */}
          <Route path="/employee" element={
            <EmployeeProtectedRoute>
              <EmployeeLayout />
            </EmployeeProtectedRoute>
          }>
            <Route path="dashboard" element={<EmployeeDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
