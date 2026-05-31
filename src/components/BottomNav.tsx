import { NavLink } from "react-router-dom";
import {
  Home,
  Search,
  Library,
  Heart,
  Settings as SettingsIcon,
} from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/favorites", label: "Favs", icon: Heart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
  return (
    <nav className="flex md:hidden h-[56px] bg-[#0d0d0d] border-t border-[#1a1a1a] shrink-0">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? "accent-text" : "text-neutral-500"
            }`
          }
        >
          {() => (
            <>
              <Icon size={19} />
              <span className="text-[9px] font-mono uppercase tracking-wider">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
