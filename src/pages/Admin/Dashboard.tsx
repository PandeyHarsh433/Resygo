
import React from 'react';
import DashboardStats from '@/components/admin/DashboardStats';
import RecentOrders from '@/components/admin/RecentOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

const data = [
  {
    name: 'Jan',
    revenue: 4000,
  },
  {
    name: 'Feb',
    revenue: 3000,
  },
  {
    name: 'Mar',
    revenue: 5000,
  },
  {
    name: 'Apr',
    revenue: 4500,
  },
  {
    name: 'May',
    revenue: 6000,
  },
  {
    name: 'Jun',
    revenue: 7000,
  },
  {
    name: 'Jul',
    revenue: 8000,
  },
];

const Dashboard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const reservations = [
    {
      id: 1,
      name: "John Smith",
      time: "12:30 PM",
      guests: 2,
      status: "confirmed"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      time: "1:00 PM",
      guests: 4,
      status: "pending"
    },
    {
      id: 3,
      name: "Michael Brown",
      time: "7:30 PM",
      guests: 6,
      status: "confirmed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RecentOrders />
          
          <div className="col-span-1">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#D4A64B" 
                          fill="#D4A64B" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Today's Reservations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border mx-auto"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reservation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.time} · {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
