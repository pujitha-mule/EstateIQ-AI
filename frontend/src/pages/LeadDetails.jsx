
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Building2, RefreshCw, MessageCircle } from "lucide-react";

import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchLead() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load this lead.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLead();
  }, [id]);

  if (loading) {
    return <p className="p-8 text-center text-slate-500">Loading lead details...</p>;
  }

  if (error || !lead) {
    return (
      <Card title="Lead unavailable">
        <p className="text-red-600 mb-4">{error || "Lead not found."}</p>
        <Button variant="secondary" onClick={fetchLead}>
          <RefreshCw size={16} /> Try again
        </Button>
        <Link to="/leads" className="block text-[#1677C8] mt-4 text-sm">Back to Leads</Link>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1677C8]">
        <ArrowLeft size={17} /> Back to Leads
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#B9F5D0] flex items-center justify-center text-2xl font-bold text-[#142B46]">
          {lead.name?.charAt(0)?.toUpperCase() || "L"}
        </div>
        <div className="flex-1 min-w-[180px]">
          <h1 className="text-2xl font-bold text-[#142B46]">{lead.name}</h1>
          <p className="text-sm text-slate-500">Lead ID: #{lead.id}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contact Information">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Phone size={19} className="text-[#1677C8]" />
              <div>
                <p className="text-xs text-slate-500">Phone Number</p>
                <p className="font-semibold text-[#142B46]">{lead.phone || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 size={19} className="text-[#1677C8]" />
              <div>
                <p className="text-xs text-slate-500">Project</p>
                <p className="font-semibold text-[#142B46]">
                  {lead.project || lead.project_id || "Not assigned"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lead Source</p>
              <p className="font-semibold text-[#142B46] mt-1">{lead.source || "Unknown"}</p>
            </div>
          </div>
        </Card>

        <Card title="Buyer Requirements">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Configuration</p>
              <p className="font-semibold text-[#142B46]">{lead.configuration || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Budget</p>
              <p className="font-semibold text-[#142B46]">{lead.budget || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Assigned Executive</p>
              <p className="font-semibold text-[#142B46]">{lead.assigned_to || "Not assigned"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Consent Status</p>
              <p className="font-semibold text-[#142B46]">
                {lead.consent ? "Recorded" : "Not recorded"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Created At</p>
              <p className="font-medium text-[#142B46]">
                {lead.created_at ? new Date(lead.created_at).toLocaleString() : "Not available"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Continue Conversation">
        <p className="text-sm text-slate-600 mb-4">
          Open the AI assistant to review the buyer's conversation and continue qualification.
        </p>
        <Link to={`/assistant?lead=${lead.id}`}>
          <Button><MessageCircle size={17} /> Open AI Assistant</Button>
        </Link>
      </Card>
    </div>
  );
}
