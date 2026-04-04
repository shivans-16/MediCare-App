



import { useAuthStore } from "../stores/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
}

class HttpService {
    private getAuthHeaders(): Record<string, string> {
    // ✅ Pehle zustand store try karo
    let token = useAuthStore.getState().token;
    
    // ✅ Agar store mein null hai toh localStorage se lo directly
    if (!token) {
        try {
            const persisted = localStorage.getItem('auth-storage');
            if (persisted) {
                const parsed = JSON.parse(persisted);
                token = parsed?.state?.token ?? null;
            }
        } catch (e) {
            console.warn('Could not read token from localStorage');
        }
    }

    if (!token) {
        console.warn('⚠️ No auth token found.');
    }

    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

  private getHeaders(auth: boolean = true): Record<string, string> {
    return auth ? this.getAuthHeaders() : { "Content-Type": "application/json" };
  }




  private async makeRequest<T = any>(
    endPoint: string,
    method: string,
    body?: any,
    auth: boolean = true,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      if (!BASE_URL) {
        throw new Error("API base URL is not defined. Check your .env file.");
      }

      const url = `${BASE_URL}/${endPoint.replace(/^\/+/, "")}`;
      console.log("Request URL:", url);

      const headers = {
        ...this.getHeaders(auth),
        ...options?.headers,
      };

      const config: RequestInit = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(url, config);

      const text = await response.text();
      let data: ApiResponse<T>;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          // ✅ Sirf tab logout karo jab login/signup page pe NA ho
          const isAuthPage =
            window.location.pathname.includes("/login") ||
            window.location.pathname.includes("/signup");

          if (!isAuthPage) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
          }
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${method} ${endPoint}]:`, error);
      throw error;
    }
  }

  async getWithAuth<T = any>(endPoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "GET", null, true, options);
  }

  async postWithAuth<T = any>(endPoint: string, body: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "POST", body, true, options);
  }

  async putWithAuth<T = any>(endPoint: string, body: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "PUT", body, true, options);
  }

  async deleteWithAuth<T = any>(endPoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "DELETE", body, true, options);
  }

  async getWithoutAuth<T = any>(endPoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "GET", null, false, options);
  }

  async postWithoutAuth<T = any>(endPoint: string, body: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endPoint, "POST", body, false, options);
  }
}

export const httpService = new HttpService();
export const getWithAuth = httpService.getWithAuth.bind(httpService);
export const postWithAuth = httpService.postWithAuth.bind(httpService);
export const putWithAuth = httpService.putWithAuth.bind(httpService);
export const deleteWithAuth = httpService.deleteWithAuth.bind(httpService);
export const getWithoutAuth = httpService.getWithoutAuth.bind(httpService);
export const postWithoutAuth = httpService.postWithoutAuth.bind(httpService);