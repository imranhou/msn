import React, { useState, useEffect } from 'react';
import api from '../services/api.service';

interface PayPlansProps {
  onClose: () => void;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Role {
  id: number;
  name: string;
}

interface PayPlanTemplate {
  id: number;
  name: string;
  type: string;
}

interface PayPlan {
  id: number;
  userId: number | null;
  roleId: number | null;
  templateId: number;
  name: string;
  description: string | null;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  overrides: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PayPlans: React.FC<PayPlansProps> = ({ onClose }) => {
  const [payPlans, setPayPlans] = useState<PayPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [templates, setTemplates] = useState<PayPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPayPlan, setCurrentPayPlan] = useState<PayPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
    templateId: '',
    name: '',
    description: '',
    effectiveStartDate: new Date().toISOString().split('T')[0],
    effectiveEndDate: '',
    overrides: '{}',
    isActive: true
  });

  useEffect(() => {
    fetchPayPlans();
    fetchUsers();
    fetchRoles();
    fetchTemplates();
  }, []);

  const fetchPayPlans = async () => {
    setLoading(true);
    try {
      const response = await api.payPlans.getAll();
      if (response.error) {
        throw new Error(response.error);
      }
      setPayPlans(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pay plans:', err);
      setError('Failed to fetch pay plans');
      // Mock data for development
      setPayPlans([
        {
          id: 1,
          userId: 1,
          roleId: null,
          templateId: 1,
          name: 'John Doe Pay Plan 2025',
          description: 'Pay plan for John Doe based on NV 1ST CHAIR template',
          effectiveStartDate: '2025-01-01T00:00:00Z',
          effectiveEndDate: '2025-12-31T23:59:59Z',
          overrides: { baseCommission: 6 },
          isActive: true,
          createdAt: '2025-05-01T00:00:00Z',
          updatedAt: '2025-05-01T00:00:00Z'
        },
        {
          id: 2,
          userId: 2,
          roleId: null,
          templateId: 3,
          name: 'Jane Smith Pay Plan 2025',
          description: 'Pay plan for Jane Smith based on TCP SALES ADVISOR template',
          effectiveStartDate: '2025-01-01T00:00:00Z',
          effectiveEndDate: null,
          overrides: {},
          isActive: true,
          createdAt: '2025-05-01T00:00:00Z',
          updatedAt: '2025-05-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.users.getAgents();
      if (response.error) {
        throw new Error(response.error);
      }
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Mock data for development
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'sales' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'sales' }
      ]);
    }
  };

  const fetchRoles = async () => {
    try {
      // Mock data for development
      setRoles([
        { id: 1, name: 'Sales Advisor' },
        { id: 2, name: '1st Chair Sales Manager' },
        { id: 3, name: 'Finance Manager' }
      ]);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.payPlans.getActiveTemplates();
      if (response.error) {
        throw new Error(response.error);
      }
      setTemplates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      // Mock data for development
      setTemplates([
        { id: 1, name: 'NV 1ST CHAIR SALES MANAGER 2025', type: 'SALES_MANAGER' },
        { id: 2, name: 'UV ALL SALES MANAGER 2025', type: 'SALES_MANAGER' },
        { id: 3, name: 'TCP SALES ADVISOR 2025', type: 'SALES_ADVISOR' }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      roleId: '',
      templateId: '',
      name: '',
      description: '',
      effectiveStartDate: new Date().toISOString().split('T')[0],
      effectiveEndDate: '',
      overrides: '{}',
      isActive: true
    });
  };

  const handleCreatePayPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate overrides is valid JSON
      let overridesObj;
      try {
        overridesObj = JSON.parse(formData.overrides);
      } catch (err) {
        alert('Overrides must be valid JSON');
        return;
      }

      const payPlanData = {
        userId: formData.userId ? parseInt(formData.userId) : null,
        roleId: formData.roleId ? parseInt(formData.roleId) : null,
        templateId: parseInt(formData.templateId),
        name: formData.name,
        description: formData.description || null,
        effectiveStartDate: formData.effectiveStartDate,
        effectiveEndDate: formData.effectiveEndDate || null,
        overrides: overridesObj,
        isActive: formData.isActive
      };

      const response = await api.payPlans.create(payPlanData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh pay plans list
      fetchPayPlans();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Error creating pay plan:', err);
      alert('Failed to create pay plan');
    }
  };

  const handleEditClick = (payPlan: PayPlan) => {
    setCurrentPayPlan(payPlan);
    setFormData({
      userId: payPlan.userId?.toString() || '',
      roleId: payPlan.roleId?.toString() || '',
      templateId: payPlan.templateId.toString(),
      name: payPlan.name,
      description: payPlan.description || '',
      effectiveStartDate: new Date(payPlan.effectiveStartDate).toISOString().split('T')[0],
      effectiveEndDate: payPlan.effectiveEndDate 
        ? new Date(payPlan.effectiveEndDate).toISOString().split('T')[0] 
        : '',
      overrides: JSON.stringify(payPlan.overrides, null, 2),
      isActive: payPlan.isActive
    });
    setShowEditForm(true);
  };

  const handleUpdatePayPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPayPlan) return;

    try {
      // Validate overrides is valid JSON
      let overridesObj;
      try {
        overridesObj = JSON.parse(formData.overrides);
      } catch (err) {
        alert('Overrides must be valid JSON');
        return;
      }

      const payPlanData = {
        userId: formData.userId ? parseInt(formData.userId) : null,
        roleId: formData.roleId ? parseInt(formData.roleId) : null,
        templateId: parseInt(formData.templateId),
        name: formData.name,
        description: formData.description || null,
        effectiveStartDate: formData.effectiveStartDate,
        effectiveEndDate: formData.effectiveEndDate || null,
        overrides: overridesObj,
        isActive: formData.isActive
      };

      const response = await api.payPlans.update(currentPayPlan.id, payPlanData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh pay plans list
      fetchPayPlans();
      setShowEditForm(false);
      setCurrentPayPlan(null);
      resetForm();
    } catch (err) {
      console.error('Error updating pay plan:', err);
      alert('Failed to update pay plan');
    }
  };

  const handleDeactivatePayPlan = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this pay plan?')) {
      try {
        const response = await api.payPlans.deactivate(id);
        if (response.error) {
          throw new Error(response.error);
        }

        // Refresh pay plans list
        fetchPayPlans();
      } catch (err) {
        console.error('Error deactivating pay plan:', err);
        alert('Failed to deactivate pay plan');
      }
    }
  };

  // Render functions for better organization
  const renderPayPlansList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid From</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {payPlans.map((payPlan) => (
            <tr key={payPlan.id}>
              <td className="px-6 py-4 whitespace-nowrap">{payPlan.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {templates.find(t => t.id === payPlan.templateId)?.name || `Template #${payPlan.templateId}`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {payPlan.userId 
                  ? users.find(u => u.id === payPlan.userId)?.name || `User #${payPlan.userId}`
                  : payPlan.roleId 
                    ? roles.find(r => r.id === payPlan.roleId)?.name || `Role #${payPlan.roleId}`
                    : 'Not assigned'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(payPlan.effectiveStartDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {payPlan.effectiveEndDate 
                  ? new Date(payPlan.effectiveEndDate).toLocaleDateString() 
                  : 'No End Date'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payPlan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {payPlan.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleEditClick(payPlan)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                {payPlan.isActive && (
                  <button
                    onClick={() => handleDeactivatePayPlan(payPlan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCreateForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create New Pay Plan</h3>
          <button 
            onClick={() => { setShowCreateForm(false); resetForm(); }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleCreatePayPlan}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            {/* Template */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="templateId">
                Template
              </label>
              <select
                id="templateId"
                name="templateId"
                value={formData.templateId}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Other fields */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
                Assign to User
              </label>
              <select
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select User (Optional)</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="roleId">
                Assign to Role
              </label>
              <select
                id="roleId"
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select Role (Optional)</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="effectiveStartDate">
                Effective Start Date
              </label>
              <input
                type="date"
                id="effectiveStartDate"
                name="effectiveStartDate"
                value={formData.effectiveStartDate}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="effectiveEndDate">
                Effective End Date (Optional)
              </label>
              <input
                type="date"
                id="effectiveEndDate"
                name="effectiveEndDate"
                value={formData.effectiveEndDate}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="isActive">
                Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Active</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="overrides">
              Overrides (JSON)
            </label>
            <textarea
              id="overrides"
              name="overrides"
              value={formData.overrides}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
              rows={5}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); resetForm(); }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Pay Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEditForm = () => (
    currentPayPlan && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Edit Pay Plan</h3>
            <button 
              onClick={() => { setShowEditForm(false); setCurrentPayPlan(null); resetForm(); }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleUpdatePayPlan}>
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic fields */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-templateId">Template</label>
                <select
                  id="edit-templateId"
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select Template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => { setShowEditForm(false); setCurrentPayPlan(null); resetForm(); }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Update Pay Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Pay Plans</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Create New Pay Plan
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading pay plans...</p>
        </div>
      ) : renderPayPlansList()}

      {showCreateForm && renderCreateForm()}
      {showEditForm && renderEditForm()}
    </div>
  );
};

export default PayPlans;
