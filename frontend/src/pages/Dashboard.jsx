
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, CalendarCheck, ShieldCheck, AlertCircle, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

import api from "../services/api";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, leadsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/leads"),
      ]);

      setData(dashboardResponse.data);
      setLeads(Array.isArray(leadsResponse.data) ? leadsResponse.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading dashboard...</p>;
  }

  if (error) {
    return (
      <Card title="Dashboard unavailable">
        <p role="alert" className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadDashboard}><RefreshCw size={16} /> Retry</Button>
      </Card>
    );
  }

  const metrics = [
    { title: "Total Enquiries", value: data?.total_leads ?? 0, icon: Users },
    { title: "Visits Booked", value: data?.visits_booked ?? 0, icon: CalendarCheck },
    { title: "Conversion Rate", value: `${Number(data?.conversion_rate ?? 0).toFixed(1)}%`, icon: ShieldCheck },
    { title: "Active Handoffs", value: data?.handoffs ?? 0, icon: AlertCircle },
  ];

  const sources = Array.isArray(data?.leads_by_source)
    ? data.leads_by_source
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            EstateIQ AI / Workspace
          </p>
          <h1 className="text-2xl font-bold text-[#142B46] mt-1">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your sales activity at a glance.
          </p>
        </div>
        <Button variant="secondary" onClick={loadDashboard}>
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-[#142B46] mt-2">{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#F7F9FC] flex items-center justify-center text-[#1677C8]">
                <Icon size={21} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Leads by Source" className="xl:col-span-1">
          {sources.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">
              No source data available.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sources}>
                  <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1677C8" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Recent Enquiries" className="xl:col-span-2">
          {leads.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No leads available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-sm text-left">
                <thead className="text-slate-500 border-b border-[#E7EDF4]">
                  <tr>
                    <th className="py-3 pr-4">Buyer</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 6).map((lead) => (
                    <tr key={lead.id} className="border-b border-[#E7EDF4] last:border-0">
                      <td className="py-4 pr-4">
                        <b className="text-[#142B46]">{lead.name}</b>
                        <small className="block text-slate-400">{lead.phone}</small>
                      </td>
                      <td className="py-4 pr-4">{lead.source || "Unknown"}</td>
                      <td className="py-4 pr-4"><StatusBadge status={lead.status} /></td>
                      <td className="py-4">
                        <Link to={`/leads/${lead.id}`} className="text-[#1677C8] font-medium hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
