import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Public & User Pages
import CategoryPage from './pages/CategoryPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ForbiddenPage from './pages/ForbiddenPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PendingPage from './pages/PendingPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VideoDetailPage from './pages/VideoDetailPage.jsx';

// Admin Pages
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminRolesPage from './pages/admin/AdminRolesPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminVideoFormPage from './pages/admin/AdminVideoFormPage.jsx';
import AdminVideosPage from './pages/admin/AdminVideosPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Pending Approval Screen */}
          <Route
            path="/pending"
            element={
              <ProtectedRoute allowPending={true}>
                <PendingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected User Routes (Require ACTIVE status) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories/:slug"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos/:slug"
            element={
              <ProtectedRoute>
                <VideoDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (Require ADMIN role and ACTIVE status) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdminRole={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="videos/new" element={<AdminVideoFormPage />} />
            <Route path="videos/:id/edit" element={<AdminVideoFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
