const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Health check
  async checkHealth() {
    return this.request<{ status: string; database: string; timestamp: string }>('/health');
  }

  // Products
  async getProducts(params?: {
    category?: string;
    subcategory?: string;
    featured?: boolean;
    popular?: boolean;
    search?: string;
    sort?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<any>(`/products?${queryParams}`);
  }

  async getProduct(id: number) {
    return this.request<any>(`/products/${id}`);
  }

  async getCategories() {
    return this.request<any>('/products/categories/all');
  }

  // Orders
  async getOrders() {
    return this.request<any>('/orders');
  }

  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Users
  async register(userData: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.request<any>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<any>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

export const api = new ApiService();