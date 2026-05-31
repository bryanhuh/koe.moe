import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Library,
  Disc3,
  Mic2,
  ListMusic,
  Heart,
  ScrollText,
  Palette,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const items: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/albums", label: "Album", icon: Disc3 },
  { to: "/artists", label: "Artist", icon: Mic2 },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/theme", label: "Theme Editor", icon: Palette },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const width = collapsed ? "w-[68px]" : "w-[230px]";

  return (
    <aside
      className={`${width} hidden md:flex flex-col shrink-0 h-full bg-[#0d0d0d] border-r border-[#1a1a1a] transition-[width] duration-200`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1a1a]">
        {!collapsed && (
          <div className="font-mono font-extrabold text-xl tracking-tight">
            Koe<span className="accent-text">.</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded hover:bg-[#1a1a1a] text-neutral-400 hover:text-neutral-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 mx-2 my-0.5 h-10 rounded-md text-sm relative",
                "transition-colors",
                isActive
                  ? "text-white accent-soft-bg"
                  : "text-neutral-400 hover:text-neutral-100 hover:bg-[#161616]",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r accent-bg"
                    aria-hidden
                  />
                )}
                <Icon size={18} className={isActive ? "accent-text" : ""} />
                {!collapsed && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[#1a1a1a] px-3 py-3">
        {user ? (
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
            {!collapsed && (
              <span className="flex-1 min-w-0 text-xs text-neutral-400 truncate font-mono">
                {user.email}
              </span>
            )}
            <button
              onClick={() => void signOut()}
              title="Sign out"
              className="p-1.5 rounded hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-200 transition-colors shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-neutral-400 hover:text-neutral-100 hover:bg-[#1a1a1a] transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogIn size={15} />
            {!collapsed && <span>Sign in</span>}
          </button>
        )}

        {!collapsed && (
          <div className="mt-3 flex items-center gap-2 px-2 text-[10px] font-mono uppercase tracking-wider text-neutral-600">
            <NavLink to="/privacy" className="hover:text-neutral-400 transition-colors">
              Privacy
            </NavLink>
            <span aria-hidden>·</span>
            <NavLink to="/terms" className="hover:text-neutral-400 transition-colors">
              Terms
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
