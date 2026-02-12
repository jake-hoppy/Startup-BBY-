import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import { Home } from './home/home';
import { Login } from './login/login';
import { Feed } from './feed/feed';
import { ToDo } from './toDo/toDo';

export default function App() {
  return (
    <Router>
      <div className="body bg-dark text-light d-flex flex-column min-vh-100">
        <main className="flex-fill">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/todo" element={<ToDo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
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
