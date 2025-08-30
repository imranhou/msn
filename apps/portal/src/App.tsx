import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import CommissionTable from './components/CommissionTable';
import CommissionRules from './components/CommissionRules';
import PayPlans from './components/PayPlans';
import PayPlanTemplates from './components/PayPlanTemplates';
import ActiveDeals from './components/ActiveDeals';
import Login from './components/Login';
import api from './services/api.service';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'sales' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (api.auth.isAuthenticated()) {
        try {
          const result = await api.auth.getProfile();
          if (!result.error && result.data) {
            setUser(result.data);
            setIsLoggedIn(true);
            // Determine role based on user data
            setUserRole(result.data.role === 'admin' ? 'admin' : 'sales');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If there's an error, clear the token
          api.auth.logout();
        }
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    try {
      const result = await api.auth.getProfile();
      if (!result.error && result.data) {
        setUser(result.data);
        setIsLoggedIn(true);
        // Determine role based on user data
        setUserRole(result.data.role === 'admin' ? 'admin' : 'sales');
      }
    } catch (error) {
      console.error('Error fetching user profile after login:', error);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img src='./logo512.png' alt="Logo" className="h-8 w-8 sm:h-12 sm:w-12 mr-2 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold truncate">MyShareNow</span>
          </div>
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 sm:px-4 text-sm sm:text-base rounded-md transition-colors flex-shrink-0"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {!isLoggedIn ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : userRole === 'admin' ? (
          <AdminDashboard />
        ) : (
          <SalesAgentDashboard />
        )}
      </main>
    </div>
  );
}


function AdminDashboard() {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showRulesManager, setShowRulesManager] = useState(false);
  const [showPayPlans, setShowPayPlans] = useState(false);
  const [showPayPlanTemplates, setShowPayPlanTemplates] = useState(false);
  const [showActiveDeals, setShowActiveDeals] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setUploadResult(data);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadResult(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
      
      <FileUpload 
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {uploadResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">File uploaded successfully: {uploadResult.filename}</span>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{uploadError}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Commission Rules</h2>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Configure commission rules for sales agents.
          </p>
          <button 
            onClick={() => setShowRulesManager(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Manage Rules
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Pay Plans</h2>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Manage pay plans and templates for different roles and dealership types.
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => setShowPayPlans(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Manage Pay Plans
            </button>
            <button 
              onClick={() => setShowPayPlanTemplates(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Manage Templates
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 xl:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Active Deals</h2>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
            Browse and filter all active deals in the system.
          </p>
          <button 
            onClick={() => setShowActiveDeals(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            View Deals
          </button>
        </div>
      </div>

      {/* Modal for Commission Rules */}
      {showRulesManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <CommissionRules onClose={() => setShowRulesManager(false)} />
          </div>
        </div>
      )}
      
      {/* Modal for Pay Plans */}
      {showPayPlans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <PayPlans onClose={() => setShowPayPlans(false)} />
          </div>
        </div>
      )}
      
      {/* Modal for Pay Plan Templates */}
      {showPayPlanTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <PayPlanTemplates onClose={() => setShowPayPlanTemplates(false)} />
          </div>
        </div>
      )}
      
      {/* Modal for Active Deals */}
      {showActiveDeals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <ActiveDeals onClose={() => setShowActiveDeals(false)} />
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Sales Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deals Closed
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">John Doe</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">12</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">$360,000</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">$18,000</td>
              </tr>
              <tr>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">Jane Smith</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">8</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">$240,000</td>
                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base">$12,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SalesAgentDashboard() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  // Fetch commissions data
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        
        // In a real app, we would get the agent ID from authentication
        const agentId = 1; // Mock agent ID
        
        const result = await api.commissions.getByAgentId(agentId);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (Array.isArray(result.data)) {
          setCommissions(result.data);
        } else {
          console.error('Commissions data is not an array:', result.data);
          setCommissions([]);
        }
      } catch (err) {
        console.error('Error fetching commissions:', err);
        setError('Failed to load commissions data');
        
        // Set mock data for demo purposes
        setCommissions([
          {
            id: 1,
            dealId: 101,
            salesAgentId: 1,
            ruleId: 1,
            amount: '2100.00',
            calculatedAt: '2025-05-15T10:30:00Z',
          },
          {
            id: 2,
            dealId: 102,
            salesAgentId: 1,
            ruleId: 1,
            amount: '1600.00',
            calculatedAt: '2025-05-12T14:45:00Z',
          },
          {
            id: 3,
            dealId: 103,
            salesAgentId: 1,
            ruleId: 1,
            amount: '1500.00',
            calculatedAt: '2025-05-08T09:15:00Z',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Sales Agent Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">Total Commission</h2>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">$14,500</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">This month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">Deals Closed</h2>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">8</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">This month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <h2 className="text-base sm:text-lg font-semibold text-gray-700">Average Commission</h2>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">$1,812</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Per deal</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Recent Commissions</h2>
        <CommissionTable commissions={commissions} loading={loading} />
      </div>
    </div>
  );
}

export default App;
