import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { Home } from './home/home';
import { Login } from './login/login';
import { Feed } from './feed/feed';
import { ToDo } from './ToDo/toDo';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/todo" element={<ProtectedRoute><ToDo /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="body bg-dark text-light d-flex flex-column min-vh-100">
          <main className="flex-fill">
            <AppRoutes />
          </main>

        <footer className="site-footer text-center mt-auto">
          <p><strong>Sociallearning</strong></p>
          <p>CS 260 – Web Programming</p>
          <p>Jake Hopkins</p>
          <p>
            <a
              href="https://github.com/jake-hoppy/Startup-BBY-/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
