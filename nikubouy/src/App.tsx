import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/Layout/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import NewRecordPage from './pages/NewRecordPage';
import { RecordDetailPage } from './pages/RecordDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/new"
        element={
          <PrivateRoute>
            <NewRecordPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/record/:id"
        element={
          <PrivateRoute>
            <RecordDetailPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
