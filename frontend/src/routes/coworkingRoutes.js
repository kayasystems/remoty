// Coworking module routes
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Coworking Components
import CoworkingLogin from '../components/coworking/CoworkingLogin';
import CoworkingRegister from '../components/coworking/CoworkingRegister';
import CoworkingDashboard from '../components/coworking/CoworkingDashboard';
import AllSpaces from '../components/coworking/spaces/AllSpaces';
import AddNewSpace from '../components/coworking/spaces/AddNewSpace';
import CreateCoworkingSpace from '../components/coworking/spaces/CreateCoworkingSpace';
import EditCoworkingSpace from '../components/coworking/spaces/EditCoworkingSpace';
import ViewCoworkingSpaceDetails from '../components/coworking/ViewCoworkingSpaceDetails';

import RequireAuth from '../components/RequireAuth';

const CoworkingRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/coworking/login" element={<CoworkingLogin />} />
      <Route path="/coworking/register" element={<CoworkingRegister />} />
      
      {/* Protected Routes */}
      <Route path="/coworking/dashboard" element={
        <RequireAuth>
          <CoworkingDashboard />
        </RequireAuth>
      } />
      <Route path="/coworking/spaces" element={
        <RequireAuth>
          <AllSpaces />
        </RequireAuth>
      } />
      <Route path="/coworking/spaces/new" element={
        <RequireAuth>
          <AddNewSpace />
        </RequireAuth>
      } />
      <Route path="/coworking/spaces/create" element={
        <RequireAuth>
          <CreateCoworkingSpace />
        </RequireAuth>
      } />
      <Route path="/coworking/spaces/:id/edit" element={
        <RequireAuth>
          <EditCoworkingSpace />
        </RequireAuth>
      } />
      <Route path="/coworking/spaces/:id" element={
        <RequireAuth>
          <ViewCoworkingSpaceDetails />
        </RequireAuth>
      } />
    </Routes>
  );
};

export default CoworkingRoutes;
