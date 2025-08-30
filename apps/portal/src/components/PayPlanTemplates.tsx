import React, { useState, useEffect } from 'react';
import api from '../services/api.service';

interface PayPlanTemplatesProps {
  onClose: () => void;
}

interface PayPlanTemplate {
  id: number;
  name: string;
  description: string | null;
  type: string;
  position: string;
  dealership: string | null;
  year: string;
  structure: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PayPlanTemplates: React.FC<PayPlanTemplatesProps> = ({ onClose }) => {
  const [templates, setTemplates] = useState<PayPlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<PayPlanTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SALES_ADVISOR',
    position: '1ST_CHAIR',
    dealership: '',
    year: new Date().getFullYear().toString(),
    structure: '{}',
    isActive: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.payPlans.getTemplates();
      if (response.error) {
        throw new Error(response.error);
      }
      setTemplates(response.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError('Failed to fetch templates');
      // Set mock data for development
      setTemplates([
        {
          id: 1,
          name: 'NV 1ST CHAIR SALES MANAGER 2025',
          description: 'New Vehicle 1st Chair Sales Manager Pay Plan for 2025',
          type: 'SALES_MANAGER',
          position: '1ST_CHAIR',
          dealership: 'NEW_VEHICLE',
          year: '2025',
          structure: { /* complex structure */ },
          isActive: true,
          createdAt: '2025-05-01T00:00:00Z',
          updatedAt: '2025-05-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'UV ALL SALES MANAGER 2025',
          description: 'Used Vehicle All Sales Manager Pay Plan for 2025',
          type: 'SALES_MANAGER',
          position: 'ALL',
          dealership: 'USED_VEHICLE',
          year: '2025',
          structure: { /* complex structure */ },
          isActive: true,
          createdAt: '2025-05-01T00:00:00Z',
          updatedAt: '2025-05-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'TCP SALES ADVISOR 2025',
          description: 'TCP Sales Advisor Pay Plan for 2025',
          type: 'SALES_ADVISOR',
          position: 'ALL',
          dealership: 'TCP',
          year: '2025',
          structure: { /* complex structure */ },
          isActive: true,
          createdAt: '2025-05-01T00:00:00Z',
          updatedAt: '2025-05-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'structure') {
      try {
        // Try to parse to validate it's valid JSON
        JSON.parse(value);
        setFormData(prev => ({ ...prev, [name]: value }));
      } catch (err) {
        // If parsing fails, still update the form to show the error in JSON editor
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'SALES_ADVISOR',
      position: '1ST_CHAIR',
      dealership: '',
      year: new Date().getFullYear().toString(),
      structure: '{}',
      isActive: true
    });
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate structure is valid JSON
      let structureObj;
      try {
        structureObj = JSON.parse(formData.structure);
      } catch (err) {
        alert('Structure must be valid JSON');
        return;
      }

      const templateData = {
        ...formData,
        structure: structureObj
      };

      const response = await api.payPlans.createTemplate(templateData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh templates list
      fetchTemplates();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      console.error('Error creating template:', err);
      alert('Failed to create template');
    }
  };

  const handleEditClick = (template: PayPlanTemplate) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      type: template.type,
      position: template.position,
      dealership: template.dealership || '',
      year: template.year,
      structure: JSON.stringify(template.structure, null, 2),
      isActive: template.isActive
    });
    setShowEditForm(true);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTemplate) return;

    try {
      // Validate structure is valid JSON
      let structureObj;
      try {
        structureObj = JSON.parse(formData.structure);
      } catch (err) {
        alert('Structure must be valid JSON');
        return;
      }

      const templateData = {
        ...formData,
        structure: structureObj
      };

      const response = await api.payPlans.updateTemplate(currentTemplate.id, templateData);
      if (response.error) {
        throw new Error(response.error);
      }

      // Refresh templates list
      fetchTemplates();
      setShowEditForm(false);
      setCurrentTemplate(null);
      resetForm();
    } catch (err) {
      console.error('Error updating template:', err);
      alert('Failed to update template');
    }
  };

  const handleDeactivateTemplate = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this template?')) {
      try {
        const response = await api.payPlans.deactivateTemplate(id);
        if (response.error) {
          throw new Error(response.error);
        }

        // Refresh templates list
        fetchTemplates();
      } catch (err) {
        console.error('Error deactivating template:', err);
        alert('Failed to deactivate template');
      }
    }
  };

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Pay Plan Templates</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Create New Template
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
          <p className="text-gray-500">Loading templates...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template) => (
                <tr key={template.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{template.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{template.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{template.position.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {template.dealership ? template.dealership.replace('_', ' ') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{template.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(template)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    {template.isActive && (
                      <button
                        onClick={() => handleDeactivateTemplate(template.id)}
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
      )}

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Template</h3>
              <button 
                onClick={() => { setShowCreateForm(false); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTemplate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="SALES_ADVISOR">Sales Advisor</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
                    Position
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="1ST_CHAIR">1st Chair</option>
                    <option value="2ND_CHAIR">2nd Chair</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dealership">
                    Dealership
                  </label>
                  <select
                    id="dealership"
                    name="dealership"
                    value={formData.dealership}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Dealership</option>
                    <option value="NEW_VEHICLE">New Vehicle</option>
                    <option value="USED_VEHICLE">Used Vehicle</option>
                    <option value="TCP">TCP</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
                    Year
                  </label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="structure">
                  Structure (JSON)
                </label>
                <textarea
                  id="structure"
                  name="structure"
                  value={formData.structure}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
                  rows={10}
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
                  Create Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditForm && currentTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Template</h3>
              <button 
                onClick={() => { setShowEditForm(false); setCurrentTemplate(null); resetForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateTemplate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-name">
                    Name
                  </label>
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
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-type">
                    Type
                  </label>
                  <select
                    id="edit-type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="SALES_ADVISOR">Sales Advisor</option>
                    <option value="SALES_MANAGER">Sales Manager</option>
                    <option value="FINANCE_MANAGER">Finance Manager</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-position">
                    Position
                  </label>
                  <select
                    id="edit-position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="1ST_CHAIR">1st Chair</option>
                    <option value="2ND_CHAIR">2nd Chair</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-dealership">
                    Dealership
                  </label>
                  <select
                    id="edit-dealership"
                    name="dealership"
                    value={formData.dealership}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Dealership</option>
                    <option value="NEW_VEHICLE">New Vehicle</option>
                    <option value="USED_VEHICLE">Used Vehicle</option>
                    <option value="TCP">TCP</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-year">
                    Year
                  </label>
                  <input
                    type="text"
                    id="edit-year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-isActive">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit-isActive"
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-structure">
                  Structure (JSON)
                </label>
                <textarea
                  id="edit-structure"
                  name="structure"
                  value={formData.structure}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono"
                  rows={10}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowEditForm(false); setCurrentTemplate(null); resetForm(); }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Update Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayPlanTemplates;
