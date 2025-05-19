
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import {
  LayoutDashboard,
  Menu,
  CalendarClock,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  to,
  isActive = false
}) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 hidden md:flex flex-col h-screen bg-sidebar border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold text-cinema-gold">Resygo</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1">
        <SidebarLink
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          to="/admin"
          isActive={currentPath === "/admin"}
        />
        <SidebarLink
          icon={<Menu size={18} />}
          label="Menu Management"
          to="/admin/menu"
          isActive={currentPath.includes("/admin/menu")}
        />
        <SidebarLink
          icon={<CalendarClock size={18} />}
          label="Reservations"
          to="/admin/reservations"
          isActive={currentPath.includes("/admin/reservations")}
        />
        <SidebarLink
          icon={<ShoppingCart size={18} />}
          label="Orders"
          to="/admin/orders"
          isActive={currentPath.includes("/admin/orders")}
        />
        <SidebarLink
          icon={<Users size={18} />}
          label="Staff"
          to="/admin/staff"
          isActive={currentPath.includes("/admin/staff")}
        />
        <SidebarLink
          icon={<FileText size={18} />}
          label="Reports"
          to="/admin/reports"
          isActive={currentPath.includes("/admin/reports")}
        />

        <div className="pt-6 mt-6 border-t border-border">
          <SidebarLink
            icon={<Settings size={18} />}
            label="Settings"
            to="/admin/settings"
            isActive={currentPath.includes("/admin/settings")}
          />
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-md w-full transition-colors text-muted-foreground hover:bg-primary/5 hover:text-primary"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
