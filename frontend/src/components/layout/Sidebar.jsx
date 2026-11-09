
import {
  LayoutDashboard,
  Users,
  Bot,
  CalendarDays,
  Settings,
  LogOut,
  ChartPie,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "AI Assistant", icon: Bot, path: "/assistant" },
  { label: "Site Visits", icon: CalendarDays, path: "/visits" },
  { label: "Analytics", icon: ChartPie, path: "/analytics" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    onNavigate?.();
  };

  return (
    <aside className="w-full h-full bg-[#142B46] text-white flex flex-col rounded-none lg:rounded-[24px] shadow-xl overflow-hidden">

      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 bg-[#B9F5D0] rounded-xl flex items-center justify-center text-[#142B46] font-bold text-xl">
          E
        </div>

        <div>
          <h1 className="font-bold text-lg tracking-tight">
            EstateIQ AI
          </h1>
          <p className="text-[10px] text-slate-400 tracking-wider uppercase">
            Real Estate Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 flex-1 overflow-y-auto">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3 mt-4">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;

            const active =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavigation(item.path)}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#1677C8] text-white shadow-md shadow-blue-900/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "text-white" : "text-slate-400"}
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-3 flex items-center justify-between gap-2">

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-[#B9F5D0] rounded-full flex items-center justify-center text-[#142B46] font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.name || "Admin"}
              </p>

              <p className="text-[11px] text-slate-400 truncate capitalize">
                {user?.role?.replaceAll("_", " ") || "Sales"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="shrink-0 p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
