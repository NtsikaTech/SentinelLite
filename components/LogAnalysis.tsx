
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Terminal,
  Info,
  CheckCircle2,
  FileJson,
  X,
  ShieldCheck
} from 'lucide-react';
import { LogEntry, LogStatus, LogSource } from '../types';
import { apiService } from '../services/api';

const LogAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [limit] = useState(20);
  
  // Filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [filterSource, setFilterSource] = useState<LogSource | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<LogStatus | 'ALL'>('ALL');
  
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const loadLogs = async (page: number) => {
    setLoading(true);
    try {
      const response = await apiService.getLogs(page, limit);
      setLogs(response.data);
      setTotalLogs(response.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(currentPage);
  }, [currentPage]);

  // Client-side filtering for UI responsiveness within the fetched page
  // In a real SIEM, search/filter would happen server-side via API params
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
        log.eventType.toLowerCase().includes(search.toLowerCase()) ||
        (log.raw && log.raw.toLowerCase().includes(search.toLowerCase()));
      
      const matchesSource = filterSource === 'ALL' || log.source === filterSource;
      const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
      
      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [logs, search, filterSource, filterStatus]);

  const handleMarkAsReviewed = async (log: LogEntry) => {
    if (isUpdating) return;
    setIsUpdating(log.id);
    try {
      const success = await apiService.updateLogStatus(log.id, { isReviewed: !log.isReviewed });
      if (success) {
        setLogs(prev => prev.map(l => l.id === log.id ? { ...l, isReviewed: !l.isReviewed } : l));
        if (selectedLog?.id === log.id) {
          setSelectedLog(prev => prev ? { ...prev, isReviewed: !prev.isReviewed } : null);
        }
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `sentinel_logs_export_${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const totalPages = Math.ceil(totalLogs / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Header Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg shadow-black/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search IPs, events, or raw log data..."
              className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium border ${
                showFilters 
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Filter size={16} /> Filters
            </button>
            <button 
              onClick={handleExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Extended Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Log Source</label>
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="ALL">All Sources</option>
                {Object.values(LogSource).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Risk Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                <option value="ALL">All Statuses</option>
                {Object.values(LogStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end lg:col-span-2">
              <button 
                onClick={() => { setFilterSource('ALL'); setFilterStatus('ALL'); setSearch(''); }}
                className="text-xs text-slate-400 hover:text-white transition-colors mb-2 ml-auto flex items-center gap-1"
              >
                <X size={14} /> Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Event Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-14 bg-slate-900/50" />
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <Search size={40} className="mx-auto text-slate-700" />
                      <p className="text-slate-400 font-medium">No results found for current filters</p>
                      <button 
                        onClick={() => { setFilterSource('ALL'); setFilterStatus('ALL'); setSearch(''); }}
                        className="text-sm text-cyan-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-slate-800/40 transition-all cursor-pointer group relative ${log.isReviewed ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border uppercase ${
                        log.source === LogSource.SSH ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        log.source === LogSource.WEB ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        log.source === LogSource.AUTH ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {log.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 max-w-md truncate text-sm text-slate-300">
                      {log.eventType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        log.status === LogStatus.SUSPICIOUS ? 'text-rose-500' : 'text-emerald-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          log.status === LogStatus.SUSPICIOUS ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                        }`} />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMarkAsReviewed(log); }}
                          title={log.isReviewed ? "Mark Unreviewed" : "Mark Reviewed"}
                          className={`p-1.5 rounded-md transition-colors ${
                            log.isReviewed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center bg-slate-900/50 gap-4">
          <p className="text-[11px] text-slate-500 font-medium">
            Showing <span className="text-slate-300">{(currentPage - 1) * limit + 1}</span> to <span className="text-slate-300">{Math.min(currentPage * limit, totalLogs)}</span> of <span className="text-slate-300">{totalLogs}</span> entries
          </p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-all flex items-center gap-1 text-xs font-bold uppercase"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                      currentPage === pageNum 
                      ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/30' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-600 px-1 text-xs">...</span>}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-all flex items-center gap-1 text-xs font-bold uppercase"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Sidebar Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedLog(null)} />
          <div className="relative w-full max-w-xl bg-slate-900 h-full border-l border-slate-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Log Evidence Details</h3>
                  <p className="text-xs text-slate-500 font-mono">UUID: {selectedLog.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                selectedLog.isReviewed 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
              }`}>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className={selectedLog.isReviewed ? 'text-emerald-500' : 'text-slate-600'} />
                  <div>
                    <p className="text-sm font-bold">{selectedLog.isReviewed ? 'Case Reviewed' : 'Awaiting Review'}</p>
                    <p className="text-[10px] opacity-70 uppercase tracking-wider font-bold">Standard SOC Triage Step</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleMarkAsReviewed(selectedLog)}
                  className={`text-xs font-bold uppercase px-4 py-2 rounded-lg transition-all ${
                    selectedLog.isReviewed 
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                  }`}
                >
                  {selectedLog.isReviewed ? 'Re-open Case' : 'Resolve Log'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Source Module</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {selectedLog.source}
                  </p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Originating IP</p>
                  <p className="text-white font-mono font-bold">{selectedLog.ipAddress}</p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 col-span-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Parsed Event Signature</p>
                  <p className="text-white font-bold text-sm">{selectedLog.eventType}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Security Narrative</span>
                </div>
                <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    Analyst Assessment: The event originating from <span className="text-white font-mono">{selectedLog.ipAddress}</span> was flagged as <span className={selectedLog.status === LogStatus.SUSPICIOUS ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>{selectedLog.status.toLowerCase()}</span>. 
                    {selectedLog.status === LogStatus.SUSPICIOUS 
                      ? ' Significant deviation from peer group behavior. Pattern matches known reconnaissance script signatures. Mitigation recommended if IP is not a verified business partner.' 
                      : ' Regular system heartbeat or verified automated process. No immediate action required.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Terminal size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Hex/Raw Log Dump</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 group relative">
                  <code className="text-xs font-mono text-cyan-500/90 block leading-relaxed break-all">
                    {selectedLog.raw || 'N/A: RAW DATA NOT CAPTURED FOR THIS STREAM'}
                  </code>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-400" title="Copy to clipboard">
                       <CheckCircle2 size={12} />
                     </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
              <button 
                onClick={handleExport}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <FileJson size={18} className="text-cyan-400" /> Export JSON
              </button>
              <button 
                onClick={() => handleMarkAsReviewed(selectedLog)}
                disabled={isUpdating === selectedLog.id}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50"
              >
                {selectedLog.isReviewed ? 'Revoke Resolution' : 'Verify & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogAnalysis;
