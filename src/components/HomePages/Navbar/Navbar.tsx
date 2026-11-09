import { NavLink } from "react-router-dom";
import { Icon } from "../../ui/Icon";

const TABS = [
  { to: "/home", label: "Home", icon: "home" },
  { to: "/vocabulary", label: "Words", icon: "book" },
  { to: "/settings", label: "Settings", icon: "settings" },
] as const;

export default function Navbar() {
  return (
    <div className="tabbar">
      <nav aria-label="Main">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            <Icon name={tab.icon} size={22} />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
