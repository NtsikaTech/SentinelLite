
import React from 'react';
import { Book, LifeBuoy, MessageSquare, CheckCircle, Globe, Terminal } from 'lucide-react';

const Support: React.FC = () => {
  const healthChecks = [
    { name: 'Database Engine', status: 'Optimal', latency: '2ms' },
    { name: 'Log Forwarder', status: 'Running', latency: '14ms' },
    { name: 'IDS Ruleset', status: 'Updated', latency: 'v2.4.1' },
    { name: 'Network Sentry', status: 'Listening', latency: 'eth0' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LifeBuoy size={32} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">How can we help?</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Search our documentation or contact our security analysts for specialized support with log correlation.
            </p>
            <div className="relative max-w-lg mx-auto">
              <input 
                type="text" 
                placeholder="Search troubleshooting guides..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-12 py-3 text-white focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Book size={20} />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all cursor-pointer group">
              <div className="p-3 bg-indigo-500/10 rounded-lg inline-block mb-4 group-hover:bg-indigo-500/20 transition-colors">
                <Terminal size={24} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">CLI Documentation</h3>
              <p className="text-sm text-slate-400">Detailed guides on using the SentinelLite CLI for log ingestion and automated analysis.</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all cursor-pointer group">
              <div className="p-3 bg-emerald-500/10 rounded-lg inline-block mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Globe size={24} className="text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community Ruleset</h3>
              <p className="text-sm text-slate-400">Access thousands of pre-configured detection rules contributed by our global SOC community.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <CheckCircle size={16} className="text-emerald-500" /> System Health
            </h3>
            <div className="space-y-4">
              {healthChecks.map((check) => (
                <div key={check.name} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{check.name}</span>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">{check.status}</p>
                    <p className="text-slate-600 font-mono text-[10px]">{check.latency}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500">All systems operational as of {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-6 text-white shadow-lg shadow-cyan-900/20">
            <MessageSquare size={28} className="mb-4 text-cyan-100" />
            <h3 className="text-lg font-bold mb-2">24/7 Security Hotline</h3>
            <p className="text-xs text-cyan-100 leading-relaxed mb-4">
              Premium tier customers get direct access to our Tier-3 incident response team during active breaches.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-all">
              Contact IR Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
