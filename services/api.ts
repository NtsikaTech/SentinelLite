
import { SecurityStats, LogEntry, SecurityAlert, AlertStatus, User, LogSource, LogStatus, Severity } from '../types';

/**
 * SentinelLite API Service
 * 
 * This service handles all communication with the Python backend.
 * Falls back to mock data when the backend is unavailable.
 */

const API_BASE_URL = '/api';

// Track if backend is available
let backendAvailable: boolean | null = null;

// ============================================
// Mock Data (Fallback when backend is offline)
// ============================================

const mockUsers: Record<string, { user: User; password: string }> = {
  'admin@sentinel.lite': {
    user: {
      id: 'u-1',
      name: 'Jane Doe',
      email: 'admin@sentinel.lite',
      role: 'admin',
      avatar: 'JD'
    },
    password: 'sentinel2025'
  },
  'analyst@sentinel.lite': {
    user: {
      id: 'u-2',
      name: 'John Smith',
      email: 'analyst@sentinel.lite',
      role: 'analyst',
      avatar: 'JS'
    },
    password: 'analyst2025'
  }
};

// Generate mock logs
const generateMockLogs = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  for (let i = 0; i < 500; i++) {
    logs.push({
      id: `log-${i.toString().padStart(4, '0')}`,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 15).toISOString(),
      source: [LogSource.SSH, LogSource.WEB, LogSource.AUTH, LogSource.SYSTEM][i % 4],
      ipAddress: `${100 + (i % 50)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      eventType: i % 5 === 0 ? 'Failed Login Attempt' : i % 8 === 0 ? 'User Privilege Escalation' : 'Standard Web Request',
      status: i % 7 === 0 ? LogStatus.SUSPICIOUS : LogStatus.NORMAL,
      isReviewed: false,
      raw: i % 5 === 0 
        ? `Mar 15 14:32:01 server sshd[123]: Failed password for invalid user admin from 192.168.1.${i} port 54321 ssh2`
        : `185.12.3.${i} - - [15/Mar/2024:09:12:03 +0000] "GET /api/v1/health HTTP/1.1" 200 512`
    });
  }
  return logs;
};

let mockLogStore = generateMockLogs();

const mockAlerts: SecurityAlert[] = [
  {
    id: 'alt-1',
    reason: 'Multiple failed SSH login attempts detected',
    timestamp: new Date().toISOString(),
    ipAddress: '45.122.34.11',
    severity: Severity.CRITICAL,
    riskScore: 92,
    ruleTriggered: 'AUTH_BRUTE_FORCE',
    rawLog: 'Mar 15 10:22:15 host sshd[1522]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=45.122.34.11',
    status: AlertStatus.OPEN
  },
  {
    id: 'alt-2',
    reason: 'Repeated web requests (404 burst) from single IP',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: '185.12.3.99',
    severity: Severity.MEDIUM,
    riskScore: 65,
    ruleTriggered: 'WEB_RECONNAISSANCE',
    rawLog: '185.12.3.99 - - [15/Mar/2024:09:12:03 +0000] "GET /wp-admin/config.php HTTP/1.1" 404 124',
    status: AlertStatus.OPEN
  },
  {
    id: 'alt-3',
    reason: 'Unexpected admin access during off-hours',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ipAddress: '10.0.0.5',
    severity: Severity.LOW,
    riskScore: 35,
    ruleTriggered: 'ANOMALY_TIME_ACCESS',
    rawLog: 'Mar 15 03:00:11 srv-01 auth: User root logged in from 10.0.0.5',
    status: AlertStatus.OPEN
  },
  {
    id: 'alt-4',
    reason: 'SQL injection attempt detected in web request',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    ipAddress: '203.45.67.89',
    severity: Severity.HIGH,
    riskScore: 85,
    ruleTriggered: 'WEB_SQL_INJECTION',
    rawLog: '203.45.67.89 - - [15/Mar/2024:11:45:22 +0000] "GET /search?q=1\' OR \'1\'=\'1 HTTP/1.1" 403 0',
    status: AlertStatus.OPEN
  }
];

// ============================================
// API Helper Functions
// ============================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function checkBackendAvailable(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  if (!backendAvailable) {
    console.warn('⚠️ Backend unavailable - using mock data mode');
  }
  
  return backendAvailable;
}

async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('sentinel_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================================
// API Service
// ============================================

export const apiService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<User> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      const response = await apiCall<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('sentinel_token', response.token);
      localStorage.setItem('sentinel_user', JSON.stringify(response.user));
      
      return response.user;
    }
    
    // Mock login fallback
    await delay(800);
    const mockUser = mockUsers[email.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Invalid security credentials provided.');
    }
    
    localStorage.setItem('sentinel_token', 'mock-token-' + Date.now());
    localStorage.setItem('sentinel_user', JSON.stringify(mockUser.user));
    
    return mockUser.user;
  },

  /**
   * Logout and clear session
   */
  logout: async (): Promise<void> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      try {
        await apiCall('/auth/logout', { method: 'POST' });
      } catch {
        // Ignore logout errors
      }
    }
    
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
  },

  /**
   * Get current authenticated user from localStorage
   */
  getCurrentUser: (): User | null => {
    const saved = localStorage.getItem('sentinel_user');
    return saved ? JSON.parse(saved) : null;
  },

  /**
   * Fetch dashboard statistics
   */
  getStats: async (): Promise<SecurityStats> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      return apiCall<SecurityStats>('/stats');
    }
    
    // Mock stats fallback
    await delay(400);
    const suspiciousCount = mockLogStore.filter(log => log.status === LogStatus.SUSPICIOUS).length;
    const failedLogins = mockLogStore.filter(log => log.eventType.includes('Failed Login')).length;
    const uniqueIps = new Set(mockLogStore.map(log => log.ipAddress)).size;
    
    return {
      totalLogs: mockLogStore.length,
      suspiciousEvents: suspiciousCount,
      failedLogins: failedLogins,
      uniqueIps: uniqueIps,
      trendData: [
        { time: '00:00', count: 400 },
        { time: '04:00', count: 300 },
        { time: '08:00', count: 900 },
        { time: '12:00', count: 1200 },
        { time: '16:00', count: 1500 },
        { time: '20:00', count: 800 },
        { time: '23:59', count: 500 },
      ]
    };
  },

  /**
   * Fetch paginated logs with optional filters
   */
  getLogs: async (
    page = 1, 
    limit = 20,
    filters?: { source?: string; status?: string; search?: string }
  ): Promise<{ data: LogEntry[], total: number }> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.source && { source: filters.source }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && { search: filters.search }),
      });
      
      return apiCall<{ data: LogEntry[], total: number }>(`/logs?${params}`);
    }
    
    // Mock logs fallback
    await delay(300);
    let filtered = [...mockLogStore];
    
    if (filters?.source && filters.source !== 'ALL') {
      filtered = filtered.filter(log => log.source === filters.source);
    }
    if (filters?.status && filters.status !== 'ALL') {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.ipAddress.toLowerCase().includes(search) ||
        log.eventType.toLowerCase().includes(search) ||
        (log.raw || '').toLowerCase().includes(search)
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length
    };
  },

  /**
   * Update a log entry (mark as reviewed, etc.)
   */
  updateLogStatus: async (logId: string, updates: Partial<LogEntry>): Promise<boolean> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      await apiCall(`/logs/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return true;
    }
    
    // Mock update fallback
    await delay(200);
    mockLogStore = mockLogStore.map(log => 
      log.id === logId ? { ...log, ...updates } : log
    );
    return true;
  },

  /**
   * Fetch all security alerts
   */
  getAlerts: async (filters?: { severity?: string; status?: string }): Promise<SecurityAlert[]> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      const params = new URLSearchParams();
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);
      
      const queryString = params.toString();
      return apiCall<SecurityAlert[]>(`/alerts${queryString ? `?${queryString}` : ''}`);
    }
    
    // Mock alerts fallback
    await delay(400);
    let filtered = [...mockAlerts];
    
    if (filters?.severity && filters.severity !== 'all') {
      filtered = filtered.filter(a => a.severity.toLowerCase() === filters.severity!.toLowerCase());
    }
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(a => a.status.toLowerCase() === filters.status!.toLowerCase());
    }
    
    return filtered;
  },

  /**
   * Update alert status
   */
  updateAlertStatus: async (alertId: string, status: AlertStatus): Promise<boolean> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      await apiCall(`/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return true;
    }
    
    // Mock update fallback
    await delay(200);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
    }
    return true;
  },

  /**
   * Create a new alert
   */
  createAlert: async (alert: Partial<SecurityAlert>): Promise<SecurityAlert> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      return apiCall<SecurityAlert>('/alerts', {
        method: 'POST',
        body: JSON.stringify(alert),
      });
    }
    
    // Mock create fallback
    await delay(300);
    const newAlert: SecurityAlert = {
      id: `alt-${Date.now()}`,
      reason: alert.reason || 'Unspecified threat',
      timestamp: new Date().toISOString(),
      ipAddress: alert.ipAddress || '0.0.0.0',
      severity: alert.severity || Severity.MEDIUM,
      riskScore: alert.riskScore || 50,
      ruleTriggered: alert.ruleTriggered || 'MANUAL_ENTRY',
      rawLog: alert.rawLog || '',
      status: AlertStatus.OPEN
    };
    
    mockAlerts.unshift(newAlert);
    return newAlert;
  },

  /**
   * Health check endpoint
   */
  healthCheck: async (): Promise<{
    status: string;
    timestamp: string;
    version: string;
    services: Record<string, string>;
  }> => {
    const isBackendUp = await checkBackendAvailable();
    
    if (isBackendUp) {
      return apiCall('/health');
    }
    
    // Mock health check
    return {
      status: 'mock-mode',
      timestamp: new Date().toISOString(),
      version: '1.0.0-mock',
      services: {
        database: 'simulated',
        log_forwarder: 'simulated',
        ids_ruleset: 'v2.4.1',
        network_sentry: 'simulated'
      }
    };
  },
  
  /**
   * Check if running in mock mode
   */
  isMockMode: (): boolean => {
    return backendAvailable === false;
  }
};
