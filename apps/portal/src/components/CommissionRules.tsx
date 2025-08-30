import React, { useState, useEffect } from 'react';
import api from '../services/api.service';

interface CommissionRule {
  id: number;
  salesAgentId: number;
  name: string;
  baseRate: string;
  minSaleAmount: string | null;
  maxSaleAmount: string | null;
  bonusThreshold: string | null;
  bonusRate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: number;
  name: string;
}

interface CommissionRulesProps {
  onClose: () => void;
}

const CommissionRules: React.FC<CommissionRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    salesAgentId: 0,
    name: '',
    baseRate: '',
    minSaleAmount: '',
    maxSaleAmount: '',
    bonusThreshold: '',
    bonusRate: '',
    isActive: true,
  });

  // Fetch rules and agents on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Initialize rules as an empty array
        setRules([]);
        
        // Fetch commission rules
        const rulesResult = await api.commissionRules.getAll();
        
        if (rulesResult.error) {
          console.error('Error fetching rules:', rulesResult.error);
          setError('Failed to fetch rules. Please try again later.');
          setRules([]);
        } else if (Array.isArray(rulesResult.data)) {
          // Format all rules data consistently
          const formattedRules = rulesResult.data.map(rule => formatRuleData(rule));
          setRules(formattedRules);
        } else {
          console.error('Rules data is not an array:', rulesResult.data);
          setRules([]);
        }
        
        // In a real app, we would fetch agents from the API
        // const agentsResult = await api.users.getAgents();
        // if (!agentsResult.error && Array.isArray(agentsResult.data)) {
        //   setAgents(agentsResult.data);
        // }
        
        // Mock agents data for now
        setAgents([
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Bob Johnson' },
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'salesAgentId') {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      salesAgentId: 0,
      name: '',
      baseRate: '',
      minSaleAmount: '',
      maxSaleAmount: '',
      bonusThreshold: '',
      bonusRate: '',
      isActive: true,
    });
    setSelectedRule(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEditRule = (rule: CommissionRule) => {
    setSelectedRule(rule);
    setFormData({
      salesAgentId: rule.salesAgentId,
      name: rule.name,
      baseRate: rule.baseRate,
      minSaleAmount: rule.minSaleAmount || '',
      maxSaleAmount: rule.maxSaleAmount || '',
      bonusThreshold: rule.bonusThreshold || '',
      bonusRate: rule.bonusRate || '',
      isActive: rule.isActive,
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreateRule = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert string values to numbers for numeric fields
      const processedFormData = {
        ...formData,
        baseRate: formData.baseRate ? parseFloat(formData.baseRate) : undefined,
        minSaleAmount: formData.minSaleAmount ? parseFloat(formData.minSaleAmount) : undefined,
        maxSaleAmount: formData.maxSaleAmount ? parseFloat(formData.maxSaleAmount) : undefined,
        bonusThreshold: formData.bonusThreshold ? parseFloat(formData.bonusThreshold) : undefined,
        bonusRate: formData.bonusRate ? parseFloat(formData.bonusRate) : undefined,
      };
      
      if (isEditing && selectedRule) {
        // Update existing rule
        const result = await api.commissionRules.update(selectedRule.id, processedFormData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Format the returned data and update rules list
        const formattedRule = formatRuleData(result.data);
        setRules(rules.map(rule => 
          rule.id === selectedRule.id ? formattedRule : rule
        ));
        
      } else if (isCreating) {
        // Create new rule
        const result = await api.commissionRules.create(processedFormData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Format the returned data and add to rules list
        const formattedRule = formatRuleData(result.data);
        setRules([...rules, formattedRule]);
      }
      
      // Reset form and state
      resetForm();
      
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('An error occurred while saving the rule. Please try again.');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }
    
    try {
      const result = await api.commissionRules.delete(id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Remove rule from list
      setRules(rules.filter(rule => rule.id !== id));
      
      // Reset form if the deleted rule was being edited
      if (selectedRule && selectedRule.id === id) {
        resetForm();
      }
      
    } catch (err) {
      console.error('Error in handleDeleteRule:', err);
      setError('An error occurred while deleting the rule. Please try again.');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const result = await api.commissionRules.toggleStatus(id, !currentStatus);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Format the returned data and update rules list
      const formattedRule = formatRuleData(result.data);
      setRules(rules.map(rule => 
        rule.id === id ? formattedRule : rule
      ));
      
    } catch (err) {
      console.error('Error in handleToggleStatus:', err);
      setError('An error occurred while updating the rule status. Please try again.');
    }
  };

  // Helper function to format rule data consistently
  const formatRuleData = (rule: any): CommissionRule => {
    return {
      ...rule,
      baseRate: rule.baseRate?.toString() || '',
      minSaleAmount: rule.minSaleAmount?.toString() || null,
      maxSaleAmount: rule.maxSaleAmount?.toString() || null,
      bonusThreshold: rule.bonusThreshold?.toString() || null,
      bonusRate: rule.bonusRate?.toString() || null,
    };
  };

  const getAgentName = (agentId: number) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold">Manage Commission Rules</h2>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <button
            onClick={handleCreateRule}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
          >
            Create New Rule
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {(isEditing || isCreating) ? (
        <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
            {isEditing ? 'Edit Rule' : 'Create New Rule'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Sales Agent
                </label>
                <select
                  name="salesAgentId"
                  value={formData.salesAgentId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  required
                >
                  <option value="">Select an agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Base Rate (%)
                </label>
                <input
                  type="number"
                  name="baseRate"
                  value={formData.baseRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Min Sale Amount ($)
                </label>
                <input
                  type="number"
                  name="minSaleAmount"
                  value={formData.minSaleAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Max Sale Amount ($)
                </label>
                <input
                  type="number"
                  name="maxSaleAmount"
                  value={formData.maxSaleAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Bonus Threshold ($)
                </label>
                <input
                  type="number"
                  name="bonusThreshold"
                  value={formData.bonusThreshold}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Bonus Rate (%)
                </label>
                <input
                  type="number"
                  name="bonusRate"
                  value={formData.bonusRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-xs sm:text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                {isEditing ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Rule Name
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Rate
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Min-Max Amount
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Bonus
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No commission rules found. Create a new rule to get started.
                </td>
              </tr>
            ) : (
              rules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-2 sm:px-6 py-2 sm:py-4">
                    <div className="text-sm sm:text-base font-medium">{getAgentName(rule.salesAgentId)}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{rule.name}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell text-sm sm:text-base">
                    {rule.name}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm sm:text-base font-medium">
                    {parseFloat(rule.baseRate).toFixed(2)}%
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 hidden lg:table-cell text-sm">
                    <div>{rule.minSaleAmount ? `$${parseFloat(rule.minSaleAmount).toLocaleString()}` : '$0'}</div>
                    <div className="text-xs text-gray-500">to {rule.maxSaleAmount ? `$${parseFloat(rule.maxSaleAmount).toLocaleString()}` : 'No limit'}</div>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 hidden md:table-cell text-sm">
                    {rule.bonusThreshold && rule.bonusRate ? (
                      <>
                        <div>{parseFloat(rule.bonusRate).toFixed(2)}%</div>
                        <div className="text-xs text-gray-500">over ${parseFloat(rule.bonusThreshold).toLocaleString()}</div>
                      </>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium">
                    <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(rule.id, rule.isActive)}
                        className={`${
                          rule.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionRules;
