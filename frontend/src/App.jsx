import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import AgentLayout from './pages/agent/AgentLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './pages/auth/Login';
import MasterDashboard from './pages/master/MasterDashboard';
import AgentManagement from './pages/master/agents/AgentsPage';
import AgentCommissionPage from './pages/master/commission/AgentCommissionPage';
import LotteryTypesOverview from './pages/master/lottery-types/LotteryTypesPage';
import LotteryDrawManagement from './pages/master/lottery-draws/LotteryDrawsPage';
import AgentDashboard from './pages/agent/AgentDashboard';
import MemberManagement from './pages/agent/members/MembersPage';
import MemberCommissionPage from './pages/agent/commission/MemberCommissionPage';
import { useAuthStore } from './store/authStore';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <MasterDashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Master Routes */}
          <Route
            path="/master/agents"
            element={
              <PrivateRoute>
                <Layout>
                  <AgentManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/master/agents/:agentId/commission"
            element={
              <PrivateRoute>
                <Layout>
                  <AgentCommissionPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/master/lottery-types"
            element={
              <PrivateRoute>
                <Layout>
                  <LotteryTypesOverview />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/master/lottery-draws"
            element={
              <PrivateRoute>
                <Layout>
                  <LotteryDrawManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <PrivateRoute>
                <AgentLayout>
                  <AgentDashboard />
                </AgentLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/agent/members"
            element={
              <PrivateRoute>
                <AgentLayout>
                  <MemberManagement />
                </AgentLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/agent/members/:memberId/commission"
            element={
              <PrivateRoute>
                <AgentLayout>
                  <MemberCommissionPage />
                </AgentLayout>
              </PrivateRoute>
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
