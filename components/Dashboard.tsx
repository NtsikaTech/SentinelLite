
import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SecurityStats, SecurityAlert, Severity, ViewType } from '../types';
import { apiService } from '../services/api';

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendValue, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all shadow-sm group ${onClick ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-800/50' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-end justify-between">
      <p className="text-2xl font-bold text-white tracking-tight">{value || '0'}</p>
      {onClick && <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />}
    </div>
  </div>
);

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsData, alertsData] = await Promise.all([
        apiService.getStats(),
        apiService.getAlerts()
      ]);
      setStats(statsData);
      setRecentAlerts(alertsData.slice(0, 3)); // Take top 3 for dashboard
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Optional: set up periodic refresh
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return 'bg-rose-500';
      case Severity.HIGH: return 'bg-orange-500';
      case Severity.MEDIUM: return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800" />
        ))}
        <div className="lg:col-span-2 h-80 bg-slate-900 rounded-xl border border-slate-800 mt-4" />
        <div className="h-80 bg-slate-900 rounded-xl border border-slate-800 mt-4" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Activity className="text-cyan-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Security Posture</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={12} /> Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Logs Processed" 
          value={stats?.totalLogs.toLocaleString()} 
          icon={Activity} 
          color="bg-cyan-500"
          trend="up"
          trendValue="12.5%"
          onClick={() => onViewChange('logs')}
        />
        <StatCard 
          title="Suspicious Events" 
          value={stats?.suspiciousEvents} 
          icon={AlertTriangle} 
          color="bg-rose-500"
          trend="up"
          trendValue="2.4%"
          onClick={() => onViewChange('alerts')}
        />
        <StatCard 
          title="Failed Login Bursts" 
          value={stats?.failedLogins.toLocaleString()} 
          icon={ShieldCheck} 
          color="bg-amber-500"
          trend="down"
          trendValue="8.1%"
          onClick={() => onViewChange('alerts')}
        />
        <StatCard 
          title="Unique IPs Flagged" 
          value={stats?.uniqueIps} 
          icon={Users} 
          color="bg-indigo-500"
          onClick={() => onViewChange('logs')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-black/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Log Traffic Analysis</h3>
              <p className="text-sm text-slate-400">Real-time ingestion volume (24h)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-slate-400">Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-400">Suspicious</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val > 1000 ? (val/1000).toFixed(1)+'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#22d3ee' }}
                  cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0891b2" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Threat Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-xl shadow-black/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button 
              onClick={() => onViewChange('alerts')}
              className="text-xs text-cyan-400 hover:underline font-bold uppercase tracking-wider"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-6 flex-1">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  onClick={() => onViewChange('alerts')}
                  className="flex gap-4 group cursor-pointer"
                >
                  <div className={`w-1 h-12 rounded-full flex-shrink-0 ${getSeverityColor(alert.severity)} shadow-[0_0_12px_rgba(244,63,94,0.3)]`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate pr-2">
                        {alert.reason}
                      </p>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 truncate">IP: <span className="font-mono">{alert.ipAddress}</span></p>
                    <div className="flex items-center gap-2">
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        alert.severity === Severity.CRITICAL ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        alert.severity === Severity.HIGH ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {alert.severity}
                      </div>
                      <span className="text-[10px] text-slate-600 italic">Score: {alert.riskScore}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <ShieldCheck size={48} className="mb-4 text-slate-700" />
                <p className="text-sm text-slate-500">No recent alerts detected</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">SOC Status</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm text-emerald-400 font-medium">Monitoring Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
