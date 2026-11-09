
import { Search, Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-20 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-[#E7EDF4] bg-white">

      {/* Page title */}
      <div className="flex items-center gap-4 min-w-0">

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-[#1677C8] hover:bg-slate-50 rounded-lg"
        >
          <Menu size={23} />
        </button>

        <div className="min-w-0">
          <p className="hidden sm:block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            EstateIQ AI / Workspace
          </p>

          <h2 className="text-lg sm:text-xl font-bold text-[#142B46] truncate">
            {title}
          </h2>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Decorative search until global search is implemented */}
        <div
          className="hidden md:flex items-center gap-2 bg-[#F7F9FC] rounded-full px-4 py-2.5 w-56 border border-[#E7EDF4]"
          title="Global search is not enabled yet"
        >
          <Search size={16} className="text-slate-400" />

          <input
            disabled
            placeholder="Search..."
            aria-label="Search"
            className="bg-transparent outline-none text-sm w-full text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Notifications placeholder */}
        <button
          type="button"
          disabled
          aria-label="Notifications not available in demo"
          title="Notifications are not enabled yet"
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E7EDF4] text-slate-400 relative opacity-70 cursor-not-allowed"
        >
          <Bell size={18} />
        </button>

        {/* User avatar */}
        <div
          className="w-9 h-9 shrink-0 bg-[#142B46] rounded-full flex items-center justify-center text-white font-bold text-xs"
          title={user?.name || "Admin"}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
