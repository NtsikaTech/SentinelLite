
export enum LogSource {
  SSH = 'SSH',
  WEB = 'Web',
  AUTH = 'Auth',
  SYSTEM = 'System'
}

export enum LogStatus {
  NORMAL = 'Normal',
  SUSPICIOUS = 'Suspicious'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum AlertStatus {
  OPEN = 'Open',
  ISOLATED = 'Isolated',
  RESOLVED = 'Resolved',
  FALSE_POSITIVE = 'False Positive'
}

export interface SecurityStats {
  totalLogs: number;
  suspiciousEvents: number;
  failedLogins: number;
  uniqueIps: number;
  trendData: { time: string; count: number }[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: LogSource;
  ipAddress: string;
  eventType: string;
  status: LogStatus;
  isReviewed?: boolean;
  raw?: string;
}

export interface SecurityAlert {
  id: string;
  reason: string;
  timestamp: string;
  ipAddress: string;
  severity: Severity;
  riskScore: number;
  ruleTriggered: string;
  rawLog: string;
  status: AlertStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst';
  avatar?: string;
}

export type ViewType = 'dashboard' | 'logs' | 'alerts' | 'settings' | 'support';
