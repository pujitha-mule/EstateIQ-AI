
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTitle = (path) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/leads")) return "Lead Management";
    if (path.startsWith("/assistant")) return "AI Assistant";
    if (path.startsWith("/visits")) return "Site Visits";
    if (path.startsWith("/analytics")) return "Analytics";
    if (path.startsWith("/settings")) return "Settings";
    return "EstateIQ AI";
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col lg:flex-row lg:p-4 lg:gap-4">

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transition-transform duration-300
        lg:static lg:w-[260px] lg:translate-x-0 lg:sticky lg:top-4
        lg:h-[calc(100vh-32px)]
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onNavigate={closeMobileMenu} />
      </div>

      {/* Main workspace */}
      <div className="flex-1 min-w-0 min-h-screen lg:min-h-0 flex flex-col bg-white border border-[#E7EDF4] shadow-sm lg:rounded-[24px] overflow-hidden">

        <Topbar
          title={getTitle(location.pathname)}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F7F9FC]">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <footer className="px-6 py-4 bg-white border-t border-[#E7EDF4] flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
          <span>© 2026 EstateIQ AI</span>
          <span>Every enquiry matters. Every visit counts.</span>
        </footer>
      </div>
    </div>
  );
}
