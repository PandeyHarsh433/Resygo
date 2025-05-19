
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Bell, Sun, Moon, User, Settings } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="w-full bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Title */}
        <div className="flex items-center">
          <h1 className="text-lg font-medium">Admin Dashboard</h1>
        </div>
        
        {/* Right Side - Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-cinema-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
          
          <div className="flex items-center space-x-2 ml-2">
            <div className="h-8 w-8 rounded-full bg-cinema-gold flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
