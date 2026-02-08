
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Bell, 
  User as UserIcon,
  Settings,
  CircleDot,
  MapPin,
  ShieldCheck,
  Star,
  Languages,
  LogOut,
  BellRing,
  Award,
  Info,
  ArrowRight,
  Loader2
} from 'lucide-react';

// Components - Extensionless imports
import { StatsDashboard } from './components/StatsDashboard';
import { ReportForm } from './components/ReportForm';
import { AIChat } from './components/AIChat';

// Utilities & Services - Extensionless imports
import { MOCK_REPORTS, STATUS_STYLES, LANGUAGES, MOCK_ALERTS } from './constants';
import { Report, CityStats, IssueCategory, SupportedLanguage, UserAlert } from './types';
import { translations } from './translations';
import { generateReportImage } from './services/geminiService';

type Tab = 'dashboard' | 'report' | 'history' | 'alerts' | 'profile' | 'settings';

interface UserData {
  name: string;
  email: string;
}

const mapCategoryKey = (val: string) => val.toLowerCase().replace(/\s/g, '');

const SmartImage: React.FC<{ imageUrl?: string, category: string, description: string }> = ({ imageUrl, category, description }) => {
  const [genUrl, setGenUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl && !genUrl && !loading) {
      setLoading(true);
      generateReportImage(category, description).then(url => {
        setGenUrl(url);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [imageUrl, category, description]);

  if (imageUrl) {
    return <img src={imageUrl} alt={category} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  if (loading) {
    return (
      <div className="h-40 bg-slate-800 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        <span className="text-[10px] text-indigo-400 font-bold uppercase animate-pulse">AI Visualizing...</span>
      </div>
    );
  }

  if (genUrl) {
    return <img src={genUrl} alt={category} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  return (
    <div className="h-40 bg-slate-800 flex items-center justify-center">
      <FileText className="w-12 h-12 text-slate-700" />
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('English');
  const [alerts, setAlerts] = useState<UserAlert[]>(MOCK_ALERTS);
  const [user, setUser] = useState<UserData | null>(null);
  const [loginForm, setLoginForm] = useState<UserData>({ name: '', email: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('civicflow_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const t = translations[currentLanguage];

  const stats = useMemo<CityStats>(() => {
    const resolved = reports.filter(r => r.status === 'Resolved' || r.status === 'Closed');
    const categories: Record<IssueCategory, number> = {
      'Pothole': 0, 'Streetlight': 0, 'Illegal Dumping': 0, 'Water Leak': 0, 'Other': 0
    };
    
    reports.forEach(r => categories[r.category]++);

    return {
      totalReports: reports.length,
      resolvedCount: resolved.length,
      medianResolutionTime: 5.2,
      categoryDistribution: Object.entries(categories).map(([name, value]) => ({ name, value }))
    };
  }, [reports]);

  const handleNewReport = (data: any) => {
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'Reported',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
    
    const newAlert: UserAlert = {
      id: Math.random().toString(36).substr(2, 5),
      title: 'Report Received',
      message: `Your ${data.category} report has been successfully logged.`,
      time: 'Just now',
      read: false,
      type: 'status'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setActiveTab('history');
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name && loginForm.email) {
      setUser(loginForm);
      localStorage.setItem('civicflow_user', JSON.stringify(loginForm));
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('civicflow_user');
    setActiveTab('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-indigo-600 rounded-3xl mb-4 shadow-xl shadow-indigo-600/30">
              <CircleDot className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white lovable">{t.welcome}</h1>
            <p className="text-slate-400 text-center mt-2">{t.loginDesc}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t.fullName}</label>
              <input
                type="text"
                required
                value={loginForm.name}
                onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                placeholder={t.placeholderName}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t.email}</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                placeholder={t.placeholderEmail}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-xl font-bold text-white shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              {t.startReporting}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20 md:pb-0 md:pl-20">
      <nav className="fixed bottom-0 left-0 w-full h-20 md:w-20 md:h-full glass-panel border-t md:border-t-0 md:border-r border-slate-800 z-50 flex md:flex-col justify-around md:justify-center items-center py-4 space-y-0 md:space-y-6">
        <div className="hidden md:flex p-3 bg-indigo-600 rounded-2xl mb-8 shadow-lg shadow-indigo-600/30">
          <CircleDot className="w-8 h-8 text-white" />
        </div>
        
        <NavBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label={t.dashboard} />
        <NavBtn active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<FileText />} label={t.report} />
        <NavBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History />} label={t.logs} />
        <NavBtn active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Bell />} label={t.alerts} notification={alerts.filter(a => !a.read).length} />
        <NavBtn active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon />} label={t.profile} />
        <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label={t.settings} />
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 neon-text tracking-tight">
              Civic<span className="text-indigo-500">Flow</span>
            </h1>
            <p className="text-slate-400 font-medium">Smart City Municipal Feedback</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border-indigo-500/20">
              <Languages className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{currentLanguage}</span>
            </div>
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[10px] font-bold text-slate-200">{t.connected}</span>
            </div>
          </div>
        </header>

        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6 lovable">{t.dataDashboard}</h2>
              <StatsDashboard stats={stats} translations={t} />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
              <ReportForm onSubmit={handleNewReport} translations={t} />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-8 lovable">{t.workOrders}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} translations={t} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold mb-8 lovable">{t.notifications}</h2>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    onClick={() => markAlertRead(alert.id)}
                    className={`glass-panel p-5 rounded-2xl border flex gap-4 cursor-pointer transition-all ${alert.read ? 'border-slate-800 opacity-70' : 'border-indigo-500/40 bg-indigo-500/5'}`}
                  >
                    <div className={`p-3 rounded-xl h-fit ${alert.type === 'status' ? 'bg-blue-500/10 text-blue-400' : alert.type === 'award' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {alert.type === 'status' ? <BellRing className="w-5 h-5" /> : alert.type === 'award' ? <Award className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white">{alert.title}</h4>
                        <span className="text-[10px] text-slate-500 uppercase">{alert.time}</span>
                      </div>
                      <p className="text-sm text-slate-400">{alert.message}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && <p className="text-center text-slate-500 mt-10">No alerts found.</p>}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-32 h-32 text-indigo-400" />
                </div>
                
                <div className="flex items-center gap-6 mb-10 relative">
                   <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-xl shadow-indigo-500/20 text-white">
                     {user.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <h2 className="text-3xl font-bold text-white lovable">{user.name}</h2>
                     <p className="text-indigo-400 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" />
                       Verified Citizen Reporter
                     </p>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">
                   <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.activeReports}</p>
                     <p className="text-2xl font-bold text-white">{reports.length}</p>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.impactScore}</p>
                     <p className="text-2xl font-bold text-emerald-400">850</p>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-2xl text-center">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t.rank}</p>
                     <p className="text-2xl font-bold text-purple-400">Gold</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {t.recentAchievements}
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                     {['Early Adopter', 'Pothole Specialist', 'Light Bringer', 'Clean City Champion'].map((badge, i) => (
                       <div key={i} className="flex-shrink-0 px-4 py-2 bg-slate-800/80 rounded-full text-xs font-bold text-slate-300 border border-slate-700">
                         {badge}
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
               <h2 className="text-2xl font-bold mb-8 lovable">{t.settings}</h2>
               <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8">
                  <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
                    <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 flex items-center justify-center rounded-xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <section>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-indigo-400" />
                      {t.language}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {LANGUAGES.map(lang => (
                        <button 
                          key={lang.name}
                          onClick={() => setCurrentLanguage(lang.name)}
                          className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col ${currentLanguage === lang.name ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                          <span className="text-sm font-bold text-white">{lang.label}</span>
                          <span className="text-xs text-slate-500">{lang.native}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="pt-8 border-t border-slate-800">
                     <h3 className="text-lg font-bold text-white mb-4">{t.preferences}</h3>
                     <div className="space-y-4">
                        <Toggle label="Push Notifications" defaultChecked />
                        <Toggle label="Share Open Data Anonymously" defaultChecked />
                     </div>
                  </section>

                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all font-bold"
                  >
                     <span>{t.signOut}</span>
                     <LogOut className="w-5 h-5" />
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>

      <AIChat language={currentLanguage} userName={user.name} />
    </div>
  );
};

const Toggle = ({ label, defaultChecked }: { label: string, defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <button 
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full relative transition-all ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label, notification }: { active: boolean, onClick?: () => void, icon: React.ReactNode, label: string, notification?: number }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 group relative flex-1 md:flex-none ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`p-3 rounded-xl transition-all relative ${active ? 'bg-indigo-500/10 scale-110' : 'group-hover:bg-slate-800'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      {notification ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[8px] font-black text-white flex items-center justify-center rounded-full border border-[#0f172a]">
          {notification}
        </span>
      ) : null}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:block">{label}</span>
    {active && (
      <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></div>
    )}
  </button>
);

const ReportCard: React.FC<{ report: Report, translations: any }> = ({ report, translations: t }) => (
  <div className="glass-panel overflow-hidden rounded-2xl border border-slate-700/50 hover:border-indigo-500/30 transition-all flex flex-col group h-full">
    <SmartImage imageUrl={report.imageUrl} category={report.category} description={report.description} />
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          {t[mapCategoryKey(report.category)] || report.category}
        </span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_STYLES[report.status as keyof typeof STATUS_STYLES]}`}>
          {report.status}
        </span>
      </div>
      <p className="text-slate-200 text-sm font-medium line-clamp-2 mb-4">
        {report.description}
      </p>
      <div className="mt-auto space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{report.location.address}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <History className="w-3 h-3 text-slate-500 shrink-0" />
          <span>{t.reported}: {new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
);

export default App;
