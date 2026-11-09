``
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  RefreshCw,
  MapPin,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
}

export default function Visits() {
  const { addToast } = useToast();

  const [slots, setSlots] = useState([]);
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitDate, setVisitDate] = useState(getTomorrowDate());

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const selectedLead = leads.find(
    (lead) => String(lead.id) === selectedLeadId
  );

  const confirmedBookings = bookings.filter(
    (item) => String(item.status).toLowerCase() === "confirmed"
  );

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadLeadsAndBookings() {
    const [leadResponse, bookingResponse] = await Promise.all([
      api.get("/leads"),
      api.get("/bookings"),
    ]);

    setLeads(
      Array.isArray(leadResponse.data) ? leadResponse.data : []
    );

    setBookings(
      Array.isArray(bookingResponse.data)
        ? bookingResponse.data
        : []
    );
  }

  async function loadSlots(projectId, date = visitDate) {
    if (!projectId || !date) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    setSlotsLoading(true);
    setSelectedSlot(null);

    try {
      const response = await api.get("/slots", {
        params: {
          project_id: Number(projectId),
          visit_date: date,
        },
      });

      setSlots(
        Array.isArray(response.data)
          ? response.data.filter((slot) => slot.available === true)
          : []
      );
    } catch (error) {
      setSlots([]);
      addToast(
        error.response?.data?.detail ||
          "Could not load available slots.",
        "error"
      );
    } finally {
      setSlotsLoading(false);
    }
  }

  async function loadData() {
    setLoading(true);

    try {
      await loadLeadsAndBookings();
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          "Unable to load booking data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    await loadData();

    if (selectedLead?.project_id) {
      await loadSlots(selectedLead.project_id, visitDate);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedLead?.project_id) {
      loadSlots(selectedLead.project_id, visitDate);
    } else {
      setSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedLeadId, leads, visitDate]);

  async function handleBook() {
    if (
      !selectedSlot ||
      !selectedLead ||
      !selectedLead.project_id ||
      booking
    ) {
      addToast(
        "Please select a buyer and an available slot.",
        "error"
      );
      return;
    }

    setBooking(true);

    try {
      await api.post("/bookings", {
        lead_id: Number(selectedLead.id),
        project_id: Number(selectedLead.project_id),
        slot_id: Number(selectedSlot.id),
      });

      addToast("Site visit booked successfully.", "success");
      setSelectedSlot(null);

      await loadData();
      await loadSlots(selectedLead.project_id, visitDate);
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          "This slot could not be booked. Please select another slot.",
        "error"
      );

      await loadSlots(selectedLead.project_id, visitDate);
    } finally {
      setBooking(false);
    }
  }

  async function handleCancel(item) {
    const confirmed = window.confirm(
      `Cancel the site visit for ${
        getBookingLead(item)?.name || `Lead #${item.lead_id}`
      } on ${formatDate(getBookingDate(item))}?`
    );

    if (!confirmed || cancellingId !== null) return;

    setCancellingId(item.id);

    try {
      await api.patch(`/bookings/${item.id}/cancel`);

      addToast("Site visit cancelled successfully.", "success");

      await loadData();

      if (selectedLead?.project_id) {
        await loadSlots(selectedLead.project_id, visitDate);
      }
    } catch (error) {
      addToast(
        error.response?.data?.detail ||
          "Unable to cancel this site visit.",
        "error"
      );
    } finally {
      setCancellingId(null);
    }
  }

  function getBookingLead(item) {
    return leads.find(
      (lead) => Number(lead.id) === Number(item.lead_id)
    );
  }

  function getBookingDate(item) {
    return item.slot_start || item.starts_at || item.start;
  }

  function getBookingProject(item) {
    return item.project_id
      ? `Project ${item.project_id}`
      : "Project unavailable";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#142B46]">
            Site Visits
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Book genuinely available time slots for buyers.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={loading || slotsLoading}
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <Card title="Select Buyer">
        <select
          value={selectedLeadId}
          onChange={(event) => setSelectedLeadId(event.target.value)}
          className="w-full md:max-w-md border border-[#E7EDF4] rounded-xl p-3 bg-white"
        >
          <option value="">Choose a lead</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.name} · Project {lead.project_id}
            </option>
          ))}
        </select>
      </Card>

      <Card title="Visit Date">
        <label
          htmlFor="visit-date"
          className="block text-sm font-medium text-[#142B46] mb-2"
        >
          Select your preferred visit date
        </label>

        <input
          id="visit-date"
          type="date"
          value={visitDate}
          min={getLocalDateString(new Date())}
          onChange={(event) => {
            setVisitDate(event.target.value);
            setSelectedSlot(null);
          }}
          className="w-full md:max-w-md border border-[#E7EDF4] rounded-xl p-3 bg-white text-[#142B46]"
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <Card title="Available Slots">
          {loading || slotsLoading ? (
            <p className="text-slate-500 py-6">
              Loading available slots...
            </p>
          ) : !selectedLeadId ? (
            <p className="text-slate-500 py-6">
              Select a buyer to see available slots.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-slate-500 py-6">
              No free slots available for this project and date.
              Please try another date.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-4 border rounded-xl text-left transition-colors ${
                    selectedSlot?.id === slot.id
                      ? "border-[#1677C8] bg-blue-50 ring-1 ring-[#1677C8]"
                      : "border-[#E7EDF4] hover:border-[#1677C8]"
                  }`}
                >
                  <div className="flex gap-3">
                    <CalendarDays
                      className="text-[#1677C8] shrink-0"
                      size={19}
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-[#142B46]">
                        {formatDate(slot.starts_at || slot.start)}
                      </p>

                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <Clock size={14} />
                        {slot.duration_minutes || 60} minutes
                      </p>

                      {slot.location && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} />
                          {slot.location}
                        </p>
                      )}

                      <p className="text-xs text-green-700 mt-2">
                        Available
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Booking Confirmation">
          {selectedSlot ? (
            <div className="space-y-4">
              <div className="bg-[#F7F9FC] rounded-xl p-4">
                <p className="text-xs text-slate-500">Buyer</p>
                <p className="font-semibold text-[#142B46] mt-1">
                  {selectedLead?.name}
                </p>

                <p className="text-xs text-slate-500 mt-3">
                  Selected time
                </p>
                <p className="font-semibold text-[#142B46] mt-1">
                  {formatDate(
                    selectedSlot.starts_at || selectedSlot.start
                  )}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleBook}
                disabled={!selectedLead || booking}
              >
                {booking ? "Booking..." : "Confirm Site Visit"}
              </Button>

              <p className="text-xs text-slate-400">
                The server rechecks availability before confirming.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Select a buyer and an available slot.
            </p>
          )}
        </Card>
      </div>

      <Card title={`Confirmed Visits (${confirmedBookings.length})`}>
        {confirmedBookings.length === 0 ? (
          <p className="text-sm text-slate-500 py-5">
            No confirmed visits yet.
          </p>
        ) : (
          <div className="space-y-3">
            {confirmedBookings.map((item) => {
              const lead = getBookingLead(item);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[#E7EDF4] flex flex-wrap justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#142B46]">
                      {lead?.name ||
                        item.lead_name ||
                        `Lead #${item.lead_id}`}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {getBookingProject(item)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(getBookingDate(item))}
                    </p>

                    <span className="inline-block mt-2 text-xs font-semibold text-green-700 bg-green-50 rounded-full px-3 py-1">
                      Confirmed
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCancel(item)}
                    disabled={cancellingId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={15} />
                    {cancellingId === item.id
                      ? "Cancelling..."
                      : "Cancel Visit"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}