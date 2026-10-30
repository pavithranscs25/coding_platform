import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Learn from './pages/Learn'
import TopicDetail from './pages/TopicDetail'
import Problems from './pages/Problems'
import ProblemDetail from './pages/ProblemDetail'
import Database from './pages/Database'
import DatabaseProblems from './pages/DatabaseProblems'
import DatabaseProblemDetail from './pages/DatabaseProblemDetail'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  const { pathname } = useLocation()
  const isProblemPage = /^\/(problems|database\/problems)\/[^/]+/.test(pathname)

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:topic" element={<TopicDetail />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/database" element={<Database />} />
        <Route path="/database/problems" element={<DatabaseProblems />} />
        <Route path="/database/problems/:id" element={<DatabaseProblemDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isProblemPage && <Footer />}
    </>
  )
}
