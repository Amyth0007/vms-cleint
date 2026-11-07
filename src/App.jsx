import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GuardDashboard from './pages/GuardDashboard';
import RegisterVisitor from './pages/RegisterVisitor';
import QrScanner from './pages/QrScanner';
import VisitorSearch from './pages/VisitorSearch';
import VisitorDetails from './pages/VisitorDetails';
import PublicRegister from './pages/PublicRegister';
import PassManagement from './pages/PassManagement';
import PassDetails from './pages/PassDetails';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute, { HomeRedirect } from './components/ProtectedRoute';
import ApiWakeup from './components/ApiWakeup';

function App() {
  return (
    <Router>
      <ApiWakeup />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PublicRegister />} />
        
        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guard" 
            element={
              <ProtectedRoute allowedRoles={['guard']}>
                <GuardDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/register-visitor" 
            element={
              <ProtectedRoute allowedRoles={['guard', 'admin']}>
                <RegisterVisitor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/qr-scanner" 
            element={
              <ProtectedRoute allowedRoles={['guard', 'admin']}>
                <QrScanner />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search-visitor" 
            element={
              <ProtectedRoute allowedRoles={['guard', 'admin']}>
                <VisitorSearch />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/visitor/:id" 
            element={
              <ProtectedRoute allowedRoles={['guard', 'admin']}>
                <VisitorDetails />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/passes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PassManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passes/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PassDetails />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* Fallback */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
