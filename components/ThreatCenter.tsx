
import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Fingerprint, 
  ExternalLink,
  ShieldX,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronRight,
  Terminal,
  Info,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { SecurityAlert, Severity, AlertStatus } from '../types';
import { apiService } from '../services/api';

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    [Severity.LOW]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [Severity.MEDIUM]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [Severity.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    [Severity.CRITICAL]: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const StatusBadge = ({ status }: { status: AlertStatus }) => {
  const styles = {
    [AlertStatus.OPEN]: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    [AlertStatus.ISOLATED]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    [AlertStatus.RESOLVED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    [AlertStatus.FALSE_POSITIVE]: 'bg-slate-700/50 text-slate-500 border-slate-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const ThreatCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    const filtered = alerts.filter(alert => {
      const matchesSearch = alert.reason.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           alert.ipAddress.includes(searchQuery) ||
                           alert.ruleTriggered.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter.toLowerCase();
      return matchesSearch && matchesSeverity;
    });
    setFilteredAlerts(filtered);
  }, [searchQuery, severityFilter, alerts]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: AlertStatus) => {
    setIsUpdating(id);
    try {
      const success = await apiService.updateAlertStatus(id, status);
      if (success) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        if (selectedAlert?.id === id) {
          setSelectedAlert(prev => prev ? { ...prev, status } : null);
        }
      }
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-44 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Threat Management Center</h2>
          <p className="text-slate-400">Analyze, mitigate, and resolve identified security threats</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-rose-500">{alerts.filter(a => a.status === AlertStatus.OPEN).length} Unresolved Threats</p>
            <p className="text-xs text-slate-500">Real-time monitoring active</p>
          </div>
          <button 
            onClick={loadAlerts}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors border border-slate-700"
          >
            <Clock size={18} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by IP, rule, or reason..."
            className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="grid gap-4">
        {filteredAlerts.map((alert) => (
          <div 
            key={alert.id}
            onClick={() => setSelectedAlert(alert)}
            className={`bg-slate-900 border ${selectedAlert?.id === alert.id ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-slate-800'} rounded-xl p-6 hover:border-slate-600 transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group cursor-pointer`}
          >
            {/* Severity Accent */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${
              alert.severity === Severity.CRITICAL ? 'bg-rose-500' :
              alert.severity === Severity.HIGH ? 'bg-orange-500' :
              alert.severity === Severity.MEDIUM ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={alert.severity} />
                    <StatusBadge status={alert.status} />
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{alert.reason}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Fingerprint size={14} className="text-cyan-500" /> {alert.ipAddress}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center min-w-[90px]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk</p>
                  <p className={`text-xl font-bold ${
                    alert.riskScore > 80 ? 'text-rose-500' :
                    alert.riskScore > 50 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {alert.riskScore}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                <code className="text-xs font-mono text-slate-400 block truncate">
                  {alert.rawLog}
                </code>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 justify-end min-w-[140px]" onClick={e => e.stopPropagation()}>
              <button 
                disabled={isUpdating === alert.id || alert.status === AlertStatus.RESOLVED}
                onClick={() => handleUpdateStatus(alert.id, AlertStatus.RESOLVED)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 text-xs font-semibold rounded-lg transition-all border border-slate-700 disabled:opacity-50"
              >
                <CheckCircle size={14} /> Resolve
              </button>
              <button 
                disabled={isUpdating === alert.id || alert.status === AlertStatus.ISOLATED}
                onClick={() => handleUpdateStatus(alert.id, AlertStatus.ISOLATED)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white text-xs font-semibold rounded-lg transition-all border border-rose-500/20 disabled:opacity-50"
              >
                <Ban size={14} /> Isolate IP
              </button>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-16 text-center">
            <ShieldCheck size={56} className="mx-auto text-emerald-500/20 mb-4" />
            <h3 className="text-xl font-medium text-slate-400">No matching threats found</h3>
            <p className="text-slate-600 text-sm mt-1 max-w-sm mx-auto">
              Your security filters are keeping the view clean. Try adjusting your search query or severity filters.
            </p>
          </div>
        )}
      </div>

      {/* Detail Sidebar Overlay */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedAlert(null)} />
          <div className="relative w-full max-w-xl bg-slate-900 h-full border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedAlert.severity === Severity.CRITICAL ? 'bg-rose-500/10 text-rose-500' :
                  selectedAlert.severity === Severity.HIGH ? 'bg-orange-500/10 text-orange-500' : 'bg-cyan-500/10 text-cyan-500'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Alert Investigation</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedAlert.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                    <StatusBadge status={selectedAlert.status} />
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Risk Score</p>
                    <span className="text-xl font-bold text-white">{selectedAlert.riskScore}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Severity</p>
                    <span className={`text-xs font-bold ${
                      selectedAlert.severity === Severity.CRITICAL ? 'text-rose-500' : 'text-amber-500'
                    }`}>{selectedAlert.severity}</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Detection Logic</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Trigger Rule:</span>
                      <span className="text-cyan-400 font-mono">{selectedAlert.ruleTriggered}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Classification:</span>
                      <span className="text-white">External Intrusion Attempt</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4 mt-2">
                    The system detected a sequence of <span className="text-white">failed authentication events</span> that exceeds the threshold of 5 attempts within a 60-second window. This signature is typical of automated brute-force tools.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Raw Forensic Evidence</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative group">
                  <code className="text-xs font-mono text-cyan-300 block leading-relaxed break-all">
                    {selectedAlert.rawLog}
                  </code>
                  <button className="absolute top-2 right-2 p-1.5 bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700">
                    <ExternalLink size={12} className="text-slate-300" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Recommended Mitigation</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex gap-3">
                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Blacklist IP</p>
                      <p className="text-xs text-slate-400">Update firewall (iptables/ufw) to reject all traffic from {selectedAlert.ipAddress}.</p>
                    </div>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                    <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Credential Review</p>
                      <p className="text-xs text-slate-400">Notify users of the targeted accounts to rotate passwords and verify recent activity.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-4">
              <button 
                disabled={isUpdating === selectedAlert.id}
                onClick={() => handleUpdateStatus(selectedAlert.id, AlertStatus.FALSE_POSITIVE)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> False Positive
              </button>
              <button 
                disabled={isUpdating === selectedAlert.id}
                onClick={() => handleUpdateStatus(selectedAlert.id, AlertStatus.RESOLVED)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer SOC Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex gap-4">
          <div className="p-3 bg-rose-500/10 rounded-full h-fit">
            <ShieldAlert size={20} className="text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Triage Protocol</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Prioritize alerts with <span className="text-rose-500 font-semibold">Risk Score {'>'} 80</span>. These represent confirmed malicious patterns or high-value asset targeting. Use the "Isolate IP" action for immediate containment while investigating root causes.
            </p>
          </div>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-full h-fit">
            <ExternalLink size={20} className="text-cyan-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">External Intel</h4>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Cross-reference IPs with AbuseIPDB and VirusTotal
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Check if source IP belongs to known cloud provider exit nodes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Validate if the 'User Agent' matches known scraping tools
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatCenter;
