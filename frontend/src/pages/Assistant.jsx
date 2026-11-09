
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bot, User, Send, AlertCircle, UserRound } from "lucide-react";

import api from "../services/api";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

export default function Assistant() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(searchParams.get("lead") || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [error, setError] = useState("");
  const [executive, setExecutive] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get("/leads")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setLeads(items);

        const requested = searchParams.get("lead");
        const exists = items.some((item) => String(item.id) === requested);

        if (requested && exists) {
          setSelectedLeadId(requested);
        } else if (items.length) {
          setSelectedLeadId(String(items[0].id));
        }
      })
      .catch(() => setError("Could not load leads."));
  }, []);

  useEffect(() => {
    if (!selectedLeadId) return;

    let cancelled = false;
    setMessages([]);
    setHandoff(false);
    setLoading(true);
    setError("");

    api.get(`/chat/${selectedLeadId}`)
      .then((res) => {
        if (cancelled) return;

        const history = Array.isArray(res.data)
          ? res.data
          : res.data.messages || [];

        setMessages(history.map((item) => ({
          role: ["user", "buyer"].includes(item.role || item.sender) ? "user" : "assistant",
          content: item.content || item.message || "",
        })));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || "Could not load chat history.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedLeadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();

    const message = input.trim();
    if (!message || !selectedLeadId || sending || loading) return;

    setInput("");
    setMessages((previous) => [...previous, { role: "user", content: message }]);
    setSending(true);
    setError("");

    try {
      const response = await api.post("/chat", {
        lead_id: Number(selectedLeadId),
        message,
        language,
      });

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: response.data.reply || "No response returned." },
      ]);

      if (response.data.handoff_required) {
        setHandoff(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function handleHandoff() {
    if (!selectedLeadId || !executive) {
      addToast("Select an executive first.", "error");
      return;
    }

    try {
      await api.post("/handoff", {
        lead_id: Number(selectedLeadId),
        executive,
        summary: messages.slice(-10).map((message) =>
          `${message.role}: ${message.content}`
        ).join("\n"),
      });

      setHandoff(true);
      addToast("Handoff submitted successfully.", "success");
    } catch (err) {
      addToast(err.response?.data?.detail || "Handoff failed.", "error");
    }
  }

  const selectedLead = leads.find((lead) => String(lead.id) === selectedLeadId);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
      <section className="bg-white border border-[#E7EDF4] rounded-2xl shadow-sm flex flex-col min-h-[650px]">
        <header className="p-4 border-b border-[#E7EDF4] flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="text-[#1677C8]" />
            <div>
              <h2 className="font-bold text-[#142B46]">EstateIQ Assistant</h2>
              <p className="text-xs text-slate-500">Fact-sheet-grounded buyer conversation</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="border border-[#E7EDF4] rounded-lg p-2 text-sm" aria-label="Conversation language">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
            </select>

            <select value={selectedLeadId} onChange={(e) => setSelectedLeadId(e.target.value)}
              className="border border-[#E7EDF4] rounded-lg p-2 text-sm max-w-[180px]" aria-label="Select lead">
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.name}</option>
              ))}
            </select>
          </div>
        </header>

        {handoff && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm flex gap-2">
            <AlertCircle size={18} />
            Human follow-up has been requested.
          </div>
        )}

        {error && <p role="alert" className="p-3 text-sm text-red-600 bg-red-50">{error}</p>}

        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {!messages.length && !loading && (
            <div className="text-center text-slate-400 mt-16">
              <Bot size={42} className="mx-auto mb-3" />
              <p>Select a buyer and start a conversation.</p>
              <p className="text-xs mt-2">Answers must come from approved project information.</p>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div key={index} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1677C8] flex items-center justify-center shrink-0">
                    <Bot size={17} />
                  </div>
                )}

                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  isUser
                    ? "bg-[#142B46] text-white rounded-tr-sm"
                    : "bg-[#F7F9FC] border border-[#E7EDF4] text-[#142B46] rounded-tl-sm"
                }`}>
                  {message.content}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#B9F5D0] text-[#142B46] flex items-center justify-center shrink-0">
                    <User size={17} />
                  </div>
                )}
              </div>
            );
          })}

          {(loading || sending) && (
            <p className="text-sm text-slate-400 animate-pulse">Processing...</p>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-[#E7EDF4] flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the project, configuration or visit..."
            disabled={!selectedLeadId || loading || sending}
            className="flex-1 min-w-0 border border-[#E7EDF4] rounded-xl p-3 text-sm outline-none focus:border-[#1677C8]" />
          <button type="submit" disabled={!selectedLeadId || loading || sending || !input.trim()}
            className="bg-[#1677C8] text-white rounded-xl px-4 disabled:opacity-50" aria-label="Send message">
            <Send size={19} />
          </button>
        </form>
      </section>

      <aside className="space-y-4">
        <Card title="Selected Buyer">
          {selectedLead ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-semibold text-[#142B46]">{selectedLead.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-semibold text-[#142B46]">{selectedLead.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <StatusBadge status={selectedLead.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Project</p>
                <p className="font-semibold text-[#142B46]">{selectedLead.project || selectedLead.project_id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Budget</p>
                <p className="font-semibold text-[#142B46]">{selectedLead.budget || "Not provided"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a buyer.</p>
          )}
        </Card>

        <Card title="Human Handoff">
          <label className="block text-sm text-slate-600 mb-2">Assign executive</label>
          <select value={executive} onChange={(e) => setExecutive(e.target.value)}
            className="w-full border border-[#E7EDF4] rounded-xl p-3 bg-white text-sm mb-3">
            <option value="">Select executive</option>
            <option value="Aarav Mehta">Aarav Mehta</option>
            <option value="Riya Desai">Riya Desai</option>
            <option value="Dev Patel">Dev Patel</option>
            <option value="Ananya Shah">Ananya Shah</option>
          </select>
          <Button className="w-full" onClick={handleHandoff} disabled={!selectedLeadId}>
            <UserRound size={16} /> Handoff to Executive
          </Button>
          <p className="text-xs text-slate-400 mt-3">
            The backend must save the assignment and conversation summary.
          </p>
        </Card>
      </aside>
    </div>
  );
}
