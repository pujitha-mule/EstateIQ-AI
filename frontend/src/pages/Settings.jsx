
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export default function Settings() {
  const { addToast } = useToast();

  const [facts, setFacts] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function loadFacts() {
    setLoading(true);

    try {
      const response = await api.get("/facts");
      const items = Array.isArray(response.data) ? response.data : [];

      setFacts(items);
      setDrafts(Object.fromEntries(
        items.map((item) => [item.id, item.content || ""])
      ));
    } catch (error) {
      addToast(error.response?.data?.detail || "Unable to load project facts.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFacts();
  }, []);

  async function saveFact(fact) {
    setSavingId(fact.id);

    try {
      await api.put(`/facts/${fact.id}`, {
        content: drafts[fact.id],
      });

      addToast("Project fact updated successfully.", "success");
      await loadFacts();
    } catch (error) {
      addToast(error.response?.data?.detail || "Could not save this fact.", "error");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <SettingsIcon size={27} className="text-[#142B46]" />
          <h1 className="text-2xl font-bold text-[#142B46]">Project Settings</h1>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Manage approved project information used by the AI assistant.
        </p>
      </div>

      <Card title="Approved Project Fact Sheet">
        <div className="flex justify-between items-center gap-3 mb-5">
          <p className="text-sm text-slate-500">
            Only verified information should be published here.
          </p>
          <Button variant="secondary" onClick={loadFacts} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-5">Loading project facts...</p>
        ) : facts.length === 0 ? (
          <p className="text-sm text-slate-500 py-5">No approved facts have been added yet.</p>
        ) : (
          <div className="space-y-5">
            {facts.map((fact) => (
              <div key={fact.id} className="border border-[#E7EDF4] rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-[#142B46]">
                      {fact.project || "Project"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {fact.category || "General information"}
                    </p>
                  </div>
                  <FileText size={18} className="text-[#1677C8]" />
                </div>

                <textarea
                  rows={4}
                  value={drafts[fact.id] ?? ""}
                  onChange={(e) => setDrafts((previous) => ({
                    ...previous,
                    [fact.id]: e.target.value,
                  }))}
                  className="w-full border border-[#E7EDF4] rounded-xl p-3 text-sm outline-none focus:border-[#1677C8] resize-y"
                />

                <div className="flex justify-end mt-3">
                  <Button onClick={() => saveFact(fact)} disabled={savingId === fact.id}>
                    {savingId === fact.id ? "Saving..." : "Save Fact"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Data Privacy and Consent">
        <div className="flex gap-3">
          <ShieldCheck size={22} className="text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-[#142B46]">Consent-aware communication</p>
            <p className="text-sm text-slate-500 mt-1">
              Record consent purpose, timestamp, channel and opt-out status.
              Only send messages when the required permission exists.
            </p>
          </div>
        </div>
      </Card>

      <Card title="AI Response Safety">
        <div className="flex gap-3">
          <AlertCircle size={22} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-[#142B46]">Approved information only</p>
            <p className="text-sm text-slate-500 mt-1">
              The assistant must not invent prices, discounts, availability,
              possession dates or RERA information. Unknown questions must
              be escalated to a sales executive.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
