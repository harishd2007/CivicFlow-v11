
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingDown, CheckCircle, Clock, Users } from 'lucide-react';
import { CityStats } from '../types';

interface Props {
  stats: CityStats;
  translations: any;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#06b6d4'];

const mapCategoryName = (name: string, t: any) => {
  const key = name.toLowerCase().replace(/\s/g, '');
  return t[key] || name;
};

export const StatsDashboard: React.FC<Props> = ({ stats, translations: t }) => {
  const translatedData = useMemo(() => stats.categoryDistribution.map(item => ({
    ...item,
    displayName: mapCategoryName(item.name, t)
  })), [stats, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<TrendingDown className="w-6 h-6 text-emerald-400" />} 
          label={t.medianResolution} 
          value={`${stats.medianResolutionTime} Days`} 
          subtext="Target: < 7 Days"
          trend={t.targetHit}
        />
        <StatCard 
          icon={<CheckCircle className="w-6 h-6 text-blue-400" />} 
          label={t.resolved} 
          value={stats.resolvedCount} 
          subtext={`${Math.round((stats.resolvedCount / stats.totalReports) * 100)}% ${t.successRate}`}
        />
        <StatCard 
          icon={<Clock className="w-6 h-6 text-purple-400" />} 
          label={t.active} 
          value={stats.totalReports - stats.resolvedCount} 
          subtext="Currently in queue"
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-orange-400" />} 
          label={t.citizensActive} 
          value="1.2k" 
          subtext="Last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 lovable">
            <TrendingDown className="w-5 h-5 text-indigo-400" />
            {t.issueDistribution}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={translatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="displayName" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {translatedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 lovable">
            <Clock className="w-5 h-5 text-purple-400" />
            {t.reportProportions}
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={translatedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="displayName"
                >
                  {translatedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {translatedData.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span>{item.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, trend }: any) => (
  <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 hover:border-indigo-500/40 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      {trend && (
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <h4 className="text-2xl font-bold text-white mb-1 lovable">{value}</h4>
    <p className="text-slate-500 text-xs">{subtext}</p>
  </div>
);
