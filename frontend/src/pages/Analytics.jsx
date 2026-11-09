
import { useEffect, useState } from "react";
import { Users, CalendarCheck, TrendingUp, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const sources = Array.isArray(data?.leads_by_source)
    ? data.leads_by_source
    : [];

  const metrics = [
    { label: "Total Leads", value: data?.total_leads ?? 0, icon: Users },
    { label: "Visits Booked", value: data?.visits_booked ?? 0, icon: CalendarCheck },
    {
      label: "Lead-to-Visit Conversion",
      value: `${Number(data?.conversion_rate ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading analytics...</p>;
  }

  if (error) {
    return (
      <Card title="Analytics unavailable">
        <p role="alert" className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadAnalytics}>
          <RefreshCw size={16} /> Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#142B46]">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sales performance and lead source overview.
          </p>
        </div>
        <Button variant="secondary" onClick={loadAnalytics}>
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1677C8] flex items-center justify-center">
                <Icon size={23} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-[#142B46] mt-1">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Lead Sources" description="Enquiries grouped by acquisition channel.">
        {sources.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No source data available.
          </p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Leads" fill="#1677C8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-400">
        Analytics reflect the data returned by the backend. Do not use
        illustrative response-time or advertising-cost figures as actual
        business performance.
      </p>
    </div>
  );
}
