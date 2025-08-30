/**
 * API Service
 * 
 * This service provides a centralized way to interact with the backend API.
 * It handles the base URL determination and provides methods for common API operations.
 */

// Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Get the base API URL based on the current hostname
const getApiBaseUrl = (): string => {
  return window.location.hostname.includes('localhost') 
    ? 'http://localhost:4001/api' 
    : 'https://api.mysharenow.com/api';
};

// Get auth token from local storage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Generic request function
const request = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any, 
  headers?: HeadersInit
): Promise<ApiResponse<T>> => {
  try {
    const url = `${getApiBaseUrl()}${endpoint}`;
    
    // Get the auth token
    const token = getAuthToken();
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...headers,
      },
      ...(body && { body: JSON.stringify(body) }),
    };
    
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    
    // Check if the response is empty
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    return { data };
  } catch (error) {
    console.error('API request error:', error);
    return { 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
};

// API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      request<{ access_token: string; user: any }>('/auth/login', 'POST', credentials),
    register: (userData: { email: string; password: string; name: string }) => 
      request<{ access_token: string; user: any }>('/auth/register', 'POST', userData),
    getProfile: () => request<any>('/auth/profile'),
    logout: () => {
      localStorage.removeItem('auth_token');
      return { data: { success: true } };
    },
    isAuthenticated: () => {
      return !!getAuthToken();
    },
    setToken: (token: string) => {
      localStorage.setItem('auth_token', token);
    },
  },
  
  // Commission Rules endpoints
  commissionRules: {
    getAll: () => request<any[]>('/commissions/rules'),
    getById: (id: number) => request<any>(`/commissions/rules/${id}`),
    getByAgentId: (agentId: number) => request<any[]>(`/commissions/rules/agent/${agentId}`),
    create: (rule: any) => request<any>('/commissions/rules', 'POST', rule),
    update: (id: number, rule: any) => request<any>(`/commissions/rules/${id}`, 'PUT', rule),
    delete: (id: number) => request<any>(`/commissions/rules/${id}`, 'DELETE'),
    toggleStatus: (id: number, isActive: boolean) => 
      request<any>(`/commissions/rules/${id}/status?isActive=${isActive}`, 'PUT'),
  },
  
  // File Upload endpoint
  fileUpload: {
    uploadDeals: async (file: File): Promise<ApiResponse<any>> => {
      try {
        const url = `${getApiBaseUrl()}/commissions/upload`;
        
        // Get the auth token
        const token = getAuthToken();
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return { data };
      } catch (error) {
        console.error('File upload error:', error);
        return { 
          error: error instanceof Error ? error.message : 'An unknown error occurred during upload' 
        };
      }
    },
  },
  
  // Commissions endpoints
  commissions: {
    getAll: () => request<any[]>('/commissions'),
    getByAgentId: (agentId: number) => request<any[]>(`/commissions/${agentId}`),
    calculate: (data: any) => request<any>('/commissions/calculate', 'POST', data),
  },
  
  // Users/Agents endpoints (for future implementation)
  users: {
    getAgents: () => request<any[]>('/users/agents'),
  },
  
  // Pay Plans endpoints
  payPlans: {
    // Pay Plan Templates
    getTemplates: () => request<any[]>('/pay-plans/templates'),
    getActiveTemplates: () => request<any[]>('/pay-plans/templates/active'),
    getTemplateById: (id: number) => request<any>(`/pay-plans/templates/${id}`),
    getTemplatesByType: (type: string) => request<any[]>(`/pay-plans/templates/type/${type}`),
    getTemplatesByPosition: (position: string) => request<any[]>(`/pay-plans/templates/position/${position}`),
    getTemplatesByYear: (year: string) => request<any[]>(`/pay-plans/templates/year/${year}`),
    createTemplate: (template: any) => request<any>('/pay-plans/templates', 'POST', template),
    updateTemplate: (id: number, template: any) => request<any>(`/pay-plans/templates/${id}`, 'PUT', template),
    deactivateTemplate: (id: number) => request<any>(`/pay-plans/templates/${id}`, 'DELETE'),
    
    // Individual Pay Plans
    getAll: () => request<any[]>('/pay-plans'),
    getAllActive: () => request<any[]>('/pay-plans/active'),
    getById: (id: number) => request<any>(`/pay-plans/${id}`),
    getByUser: (userId: number) => request<any[]>(`/pay-plans/user/${userId}`),
    getByRole: (roleId: number) => request<any[]>(`/pay-plans/role/${roleId}`),
    create: (payPlan: any) => request<any>('/pay-plans', 'POST', payPlan),
    update: (id: number, payPlan: any) => request<any>(`/pay-plans/${id}`, 'PUT', payPlan),
    deactivate: (id: number) => request<any>(`/pay-plans/${id}`, 'DELETE'),
  },
  
  // Deals endpoints
  deals: {
    getAll: () => request<any[]>('/deals'),
    getById: (id: number) => request<any>(`/deals/${id}`),
    create: (deal: any) => request<any>('/deals', 'POST', deal),
    update: (id: number, deal: any) => request<any>(`/deals/${id}`, 'PATCH', deal),
    delete: (id: number) => request<any>(`/deals/${id}`, 'DELETE'),
    uploadDeals: async (file: File): Promise<ApiResponse<any>> => {
      try {
        const url = `${getApiBaseUrl()}/deals/upload`;
        
        // Get the auth token
        const token = getAuthToken();
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Upload failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return { data };
      } catch (error) {
        console.error('Deal upload error:', error);
        return { 
          error: error instanceof Error ? error.message : 'An unknown error occurred during upload' 
        };
      }
    },
    getAuditHistory: (dealId: number) => request<any[]>(`/deals/audit/${dealId}`),
  },
};

export default api;
