
import React from 'react';
import { Save, Shield, Database, Bell, Lock, Key } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" /> General Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <div>
                  <p className="text-sm font-medium text-white">Multi-Factor Authentication (MFA)</p>
                  <p className="text-xs text-slate-500">Require a second factor for all admin logins</p>
                </div>
                <div className="w-10 h-5 bg-cyan-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <div>
                  <p className="text-sm font-medium text-white">IP Whitelisting</p>
                  <p className="text-xs text-slate-500">Restrict dashboard access to known corporate CIDR blocks</p>
                </div>
                <div className="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Session Timeout</p>
                  <p className="text-xs text-slate-500">Automatically logout after period of inactivity</p>
                </div>
                <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Database size={20} className="text-cyan-400" /> Data Retention
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Hot Storage Duration</label>
                <input type="number" defaultValue={30} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-slate-600">Days logs remain indexed for rapid search</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Archive Retention</label>
                <input type="number" defaultValue={365} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
                <p className="text-[10px] text-slate-600">Days logs are kept in cold storage</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">Discard</button>
            <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Key size={16} className="text-amber-500" /> API Access
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Use these keys to integrate SentinelLite with your external log forwarders (e.g., Filebeat, Syslog-ng).
            </p>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[10px] text-emerald-400 break-all mb-4">
              sk_live_51M0S92...x92Jk
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700 flex items-center justify-center gap-2">
              <Lock size={14} /> Rotate Master Key
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Bell size={16} className="text-cyan-500" /> Notifications
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500" />
                <span className="text-xs text-slate-300">Slack Alerts (High/Critical)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500" />
                <span className="text-xs text-slate-300">Email Digest (Daily)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500" />
                <span className="text-xs text-slate-300">Webhook Pushes (All)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
