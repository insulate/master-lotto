import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import MasterDashboard from './pages/master/MasterDashboard';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
          },
          // Success toast
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          // Error toast
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
          // Loading toast
          loading: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Master Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <MasterDashboard />
              </Layout>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
