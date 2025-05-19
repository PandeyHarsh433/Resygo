
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Users, Calendar, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface DashboardStat {
  title: string;
  value: number | string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            <div className="flex items-center mt-2">
              <span 
                className={`text-xs font-medium ${
                  isPositive ? 'text-cinema-success' : 'text-cinema-error'
                }`}
              >
                {isPositive ? '+' : ''}{change}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="p-2 rounded-md bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStat[]>([
    { 
      title: "Total Orders", 
      value: "...", 
      change: "0%", 
      isPositive: true, 
      icon: <ShoppingCart size={20} className="text-primary" /> 
    },
    { 
      title: "Menu Items", 
      value: "...", 
      change: "0%", 
      isPositive: true, 
      icon: <Menu size={20} className="text-primary" /> 
    },
    { 
      title: "Reservations", 
      value: "...", 
      change: "0%", 
      isPositive: true, 
      icon: <Calendar size={20} className="text-primary" /> 
    },
    { 
      title: "Active Staff", 
      value: "...", 
      change: "0%", 
      isPositive: true, 
      icon: <Users size={20} className="text-primary" /> 
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: false });

        if (ordersError) throw ordersError;
        
        // Get order count from previous month
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        const lastMonth = date.toISOString().split('T')[0];
        
        const { count: lastMonthOrdersCount, error: lastMonthOrdersError } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: false })
          .lt('created_at', lastMonth);
        
        if (lastMonthOrdersError) throw lastMonthOrdersError;
        
        const orderChange = lastMonthOrdersCount > 0 
          ? (((ordersCount - lastMonthOrdersCount) / lastMonthOrdersCount) * 100).toFixed(1) 
          : "0";

        // Fetch menu items count
        const { count: menuItemsCount, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('id', { count: 'exact', head: false });
          
        if (menuItemsError) throw menuItemsError;
        
        // Fetch reservations count
        const { count: reservationsCount, error: reservationsError } = await supabase
          .from('reservations')
          .select('id', { count: 'exact', head: false });
          
        if (reservationsError) throw reservationsError;
        
        // Get reservations count from previous month
        const { count: lastMonthReservationsCount, error: lastMonthReservationsError } = await supabase
          .from('reservations')
          .select('id', { count: 'exact', head: false })
          .lt('created_at', lastMonth);
        
        if (lastMonthReservationsError) throw lastMonthReservationsError;
        
        const reservationChange = lastMonthReservationsCount > 0 
          ? (((reservationsCount - lastMonthReservationsCount) / lastMonthReservationsCount) * 100).toFixed(1) 
          : "0";
        
        // Fetch staff count
        const { count: staffCount, error: staffError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: false })
          .in('role', ['staff', 'manager', 'admin', 'super_admin']);
          
        if (staffError) throw staffError;

        setStats([
          { 
            title: "Total Orders", 
            value: ordersCount || 0, 
            change: `${orderChange}%`, 
            isPositive: Number(orderChange) >= 0, 
            icon: <ShoppingCart size={20} className="text-primary" /> 
          },
          { 
            title: "Menu Items", 
            value: menuItemsCount || 0, 
            change: "0%", 
            isPositive: true, 
            icon: <Menu size={20} className="text-primary" /> 
          },
          { 
            title: "Reservations", 
            value: reservationsCount || 0, 
            change: `${reservationChange}%`,
            isPositive: Number(reservationChange) >= 0, 
            icon: <Calendar size={20} className="text-primary" /> 
          },
          { 
            title: "Active Staff", 
            value: staffCount || 0, 
            change: "0%", 
            isPositive: true, 
            icon: <Users size={20} className="text-primary" /> 
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard 
          key={index}
          title={stat.title} 
          value={stat.value} 
          change={stat.change} 
          isPositive={stat.isPositive} 
          icon={stat.icon} 
        />
      ))}
    </div>
  );
};

export default DashboardStats;
