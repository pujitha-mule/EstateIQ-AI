
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, RefreshCw, X } from "lucide-react";

import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import { useToast } from "../components/ui/Toast";

const initialForm = {
  name: "",
  phone: "",
  source: "Website",
  project_id: "1",
  consent: false,
};

export default function Leads() {
  const { addToast } = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  async function fetchLeads() {
    setLoading(true);

    try {
      const response = await api.get("/leads");
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addToast(error.response?.data?.detail || "Failed to load leads.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch = [
        lead.name, lead.phone, lead.source, lead.project,
        String(lead.id), lead.lead_code,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      const matchesStatus = statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleAddLead(event) {
    event.preventDefault();
    if (saving) return;

    if (!form.consent) {
      addToast("Confirm the buyer's permission before creating this lead.", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        source: form.source,
        project_id: Number(form.project_id),
      };

      const response = await api.post("/leads", payload);

      if (response.data?.duplicate) {
        addToast(
          `Possible duplicate lead: ${response.data.existing_lead?.lead_code || ""}`,
          "error"
        );
        return;
      }

      setForm(initialForm);
      setShowForm(false);
      addToast("Lead created. Verify that consent is recorded in the system.", "success");
      await fetchLeads();
    } catch (error) {
      addToast(
        error.response?.data?.detail || "Unable to create lead.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#142B46]">Lead Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track buyer enquiries from every channel.
          </p>
        </div>
        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? "Close Form" : "Add New Lead"}
        </Button>
      </div>

      {showForm && (
        <Card title="Create New Lead">
          <form onSubmit={handleAddLead} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" name="name" value={form.name}
                onChange={updateField} required maxLength={120} />

              <Input label="Phone Number" name="phone" value={form.phone}
                onChange={updateField} placeholder="+919876543210" required />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
                <select name="source" value={form.source} onChange={updateField}
                  className="w-full border border-[#E7EDF4] p-3 rounded-xl bg-white">
                  {["Website", "Portal", "Social", "Hoarding", "Referral", "Walk-in"].map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <Input label="Project ID" name="project_id" type="number" min="1"
                value={form.project_id} onChange={updateField} required />
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" name="consent" checked={form.consent}
                onChange={updateField} className="mt-1" />
              <span>
                The buyer has explicitly agreed to the communication described
                in the applicable consent notice.
              </span>
            </label>

            <p className="text-xs text-slate-500">
              The backend must store the consent timestamp, purpose and
              communication channel. This form confirmation alone does not
              create a persisted consent record.
            </p>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Lead"}
            </Button>
          </form>
        </Card>
      )}

      <Card title={`All Leads (${filteredLeads.length})`}>
        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, source or ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#E7EDF4] rounded-xl outline-none focus:border-[#1677C8]" />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#E7EDF4] rounded-xl px-3 py-2.5 bg-white text-sm">
            <option value="All">All statuses</option>
            {["New", "AI qualified", "Visit booked", "Visited", "Human follow-up", "Lost"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <Button variant="secondary" onClick={fetchLeads}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-center py-8 text-slate-500">Loading leads...</p>
        ) : filteredLeads.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No leads found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm text-left">
              <thead className="bg-[#F7F9FC] text-slate-500">
                <tr>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#E7EDF4] last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-[#142B46]">
                      {lead.name}
                      <span className="block text-xs text-slate-400 font-normal">
                        {lead.lead_code || `#${lead.id}`}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{lead.phone}</td>
                    <td className="p-4 text-slate-600">{lead.source || "Unknown"}</td>
                    <td className="p-4 text-slate-600">{lead.project || lead.project_id || "Not assigned"}</td>
                    <td className="p-4"><StatusBadge status={lead.status} /></td>
                    <td className="p-4">
                      <Link to={`/leads/${lead.id}`} className="font-medium text-[#1677C8] hover:underline">
                        View details
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
  );
}
