import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Battery,
  BarChart3,
  Bell,
  Settings,
  Shield,
  LogOut
} from "lucide-react";

const Sidebar = ({ isOpen,closeSidebar }: { isOpen: boolean ; closeSidebar :()=>void; }) => {
  const { user,logout } = useAuth();
   const isMobile = window.innerWidth <= 768;

const handleLinkClick = () => {
  if (isMobile) {
    closeSidebar();
  }
};


  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      
      <NavLink to="/dashboard" end onClick={handleLinkClick}>
        <LayoutDashboard size={22} />
        <span className="link-text">Dashboard</span>
      </NavLink>

      <NavLink to="/devices" onClick={handleLinkClick}>
        <Battery size={22} />
        <span className="link-text">Devices</span>
      </NavLink>

      <NavLink to="/analytics" onClick={handleLinkClick}>
        <BarChart3 size={22} />
        <span className="link-text">Analytics</span>
      </NavLink>

      <NavLink to="/alerts" onClick={handleLinkClick}>
        <Bell size={22} />
        <span className="link-text">Alerts</span>
      </NavLink>

      <NavLink to="/settings" onClick={handleLinkClick}>
        <Settings size={22} />
        <span className="link-text">Settings</span>
      </NavLink>

      {user?.role === "admin" && (
        <NavLink to="/admin" onClick={handleLinkClick}>
          <Shield size={22} />
          <span className="link-text">Admin</span>
        </NavLink>
      )}
      <button className="logout-btn" onClick={() => logout()}>
        <LogOut size={20} />
        <span className="link-text">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
