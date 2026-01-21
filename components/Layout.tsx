
import React from 'react';
import { 
  LayoutDashboard, 
  ListTree, 
  AlertCircle, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { ViewType, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Log Analysis', icon: ListTree },
    { id: 'alerts', label: 'Threat Center', icon: AlertCircle },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-900/20">
            <ShieldAlert className="text-white" size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-white truncate">
              Sentinel<span className="text-cyan-400">Lite</span>
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors group ${
                activeView === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activeView === item.id ? 'text-cyan-400' : 'group-hover:text-white'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-lg transition-colors group ${
                activeView === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} className={activeView === item.id ? 'text-cyan-400' : 'group-hover:text-white'} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-3 py-2 text-slate-500 hover:text-rose-400 transition-colors group"
          >
            <LogOut size={18} className="group-hover:text-rose-400" />
            {isSidebarOpen && <span className="text-sm">Log Out</span>}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 px-3 py-2 text-slate-500 hover:text-white transition-colors border-t border-slate-800/50 mt-2 pt-3"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            {isSidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white capitalize">
              {activeView.replace('-', ' ')}
            </h2>
            <div className="hidden sm:flex items-center gap-2 ml-4 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <ShieldAlert size={10} className="text-cyan-500" /> Secure Node 01
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3">
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live Monitoring</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{user.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold border border-white/10 shadow-lg shadow-indigo-900/20">
                {user.avatar || <UserIcon size={18} />}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
