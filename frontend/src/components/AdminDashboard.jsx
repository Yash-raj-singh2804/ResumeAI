import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, CheckCircle, Clock, AlertCircle, LayoutDashboard, RefreshCcw } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);



    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE}/analytics`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!stats) return <div className="p-20 text-center">Failed to load data.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pb-12 pt-32 md:px-12 md:pb-12 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="w-10 h-10 text-indigo-600" />
                            Admin Console
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                            Real-time parsing performance & usage metrics.
                        </p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 font-medium"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh Data
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Parsed"
                        value={stats.total}
                        icon={<Activity className="w-6 h-6 text-white" />}
                        color="bg-gradient-to-br from-indigo-500 to-blue-600"
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${stats.success_rate}%`}
                        icon={<CheckCircle className="w-6 h-6 text-white" />}
                        color="bg-gradient-to-br from-emerald-500 to-teal-600"
                    />
                    <StatCard
                        title="Avg Speed"
                        value={`${stats.avg_time}s`}
                        icon={<Clock className="w-6 h-6 text-white" />}
                        color="bg-gradient-to-br from-violet-500 to-purple-600"
                    />
                    <StatCard
                        title="Failures"
                        value={stats.failed}
                        icon={<AlertCircle className="w-6 h-6 text-white" />}
                        color="bg-gradient-to-br from-rose-500 to-red-600"
                    />
                </div>



                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Timeline Chart */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            Parsing Trends <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Last 7 Days</span>
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.timeline}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#F1F5F9', radius: 4 }}
                                    />
                                    <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 6, 6]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Skills Chart */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold mb-8 text-slate-800 dark:text-slate-200">Top Detected Skills</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={stats.top_skills} margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={110}
                                        tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="count" fill="#14B8A6" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#F8FAFC' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Component for consistency
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover:transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl shadow-lg ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default AdminDashboard;
