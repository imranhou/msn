import React, { useState, useEffect } from 'react';
import api from '../services/api.service';

interface Deal {
  id: number;
  customerName: string;
  vehicleModel: string;
  vehicleYear: number;
  salePrice: string;
  saleDate: string;
  dealNumber?: string;
  stock?: string;
  deskManager?: string;
  fiManager?: string;
  s1NameLb?: string;
  carline?: string;
  saleType?: string;
}

interface ActiveDealsProps {
  onClose: () => void;
}

const ActiveDeals: React.FC<ActiveDealsProps> = ({ onClose }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    salesAgent: '',
    deskManager: '',
    vehicleModel: '',
  });

  // Unique filter options
  const [filterOptions, setFilterOptions] = useState({
    salesAgents: new Set<string>(),
    deskManagers: new Set<string>(),
    vehicleModels: new Set<string>(),
  });

  // Fetch deals on component mount
  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.deals.getAll();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (Array.isArray(result.data)) {
        // Sort by newest deals first
        const sortedDeals = result.data.sort((a, b) => 
          new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
        );
        
        setDeals(sortedDeals);
        
        // Extract unique filter options
        const salesAgents = new Set<string>();
        const deskManagers = new Set<string>();
        const vehicleModels = new Set<string>();
        
        sortedDeals.forEach(deal => {
          if (deal.s1NameLb) salesAgents.add(deal.s1NameLb);
          if (deal.deskManager) deskManagers.add(deal.deskManager);
          if (deal.vehicleModel) vehicleModels.add(deal.vehicleModel);
        });
        
        setFilterOptions({
          salesAgents,
          deskManagers,
          vehicleModels,
        });
      } else {
        throw new Error('Received invalid data format');
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Failed to load deals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      salesAgent: '',
      deskManager: '',
      vehicleModel: '',
    });
  };

  const filteredDeals = deals.filter(deal => {
    // Apply date range filter
    if (filters.startDate && new Date(deal.saleDate) < new Date(filters.startDate)) {
      return false;
    }
    
    if (filters.endDate && new Date(deal.saleDate) > new Date(filters.endDate)) {
      return false;
    }
    
    // Apply sales agent filter
    if (filters.salesAgent && deal.s1NameLb !== filters.salesAgent) {
      return false;
    }
    
    // Apply desk manager filter
    if (filters.deskManager && deal.deskManager !== filters.deskManager) {
      return false;
    }
    
    // Apply vehicle model filter
    if (filters.vehicleModel && deal.vehicleModel !== filters.vehicleModel) {
      return false;
    }
    
    return true;
  });

  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Active Deals</h2>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Close
        </button>
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

      {/* Filter Section */}
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <h3 className="text-lg font-medium mb-4">Filter Deals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Agent
            </label>
            <select
              name="salesAgent"
              value={filters.salesAgent}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Agents</option>
              {Array.from(filterOptions.salesAgents).sort().map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desk Manager
            </label>
            <select
              name="deskManager"
              value={filters.deskManager}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Managers</option>
              {Array.from(filterOptions.deskManagers).sort().map(manager => (
                <option key={manager} value={manager}>{manager}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Model
            </label>
            <select
              name="vehicleModel"
              value={filters.vehicleModel}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Models</option>
              {Array.from(filterOptions.vehicleModels).sort().map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      <div className="overflow-x-auto">
        <div className="mb-4 text-gray-600">
          Showing {filteredDeals.length} deals
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deal #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sale Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desk Manager
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No deals found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredDeals.map(deal => (
                <tr key={deal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.dealNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(deal.saleDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.vehicleYear} {deal.vehicleModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(deal.salePrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.s1NameLb || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {deal.deskManager || '-'}
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

export default ActiveDeals;
