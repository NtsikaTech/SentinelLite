
import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await apiService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 z-10">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/40">
            <ShieldAlert className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Sentinel<span className="text-cyan-400">Lite</span>
          </h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/60">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white">Access Portal</h2>
            <p className="text-sm text-slate-400 mt-1">Authorized personnel only. Activities are monitored.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  placeholder="analyst@sentinel.lite"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Password</label>
                <button type="button" className="text-[10px] text-cyan-500 hover:text-cyan-400 font-bold uppercase">Reset</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-3 items-center animate-in slide-in-from-top-1">
                <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
                <p className="text-xs text-rose-200 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                'Secure Sign In'
              )}
            </button>
          </form>

          {/* Recruiter Hint Box */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Demo Credentials</h4>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-cyan-400">admin@sentinel.lite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass:</span>
                  <span className="text-cyan-400">sentinel2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Powered by SentinelCore v4.2.0 • Encryption: AES-256
        </p>
      </div>
    </div>
  );
};

export default Login;
