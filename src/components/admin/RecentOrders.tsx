
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: 'completed' | 'in-progress' | 'pending';
  time: string;
}

const recentOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'Alex Johnson',
    items: ['Moonlit Risotto', 'Director\'s Cut Steak'],
    total: 61.98,
    status: 'completed',
    time: '12 min ago'
  },
  {
    id: 'ORD-002',
    customer: 'Sarah Williams',
    items: ['Sunset Boulevard Salmon', 'Nocturne Chocolate Cake'],
    total: 41.98,
    status: 'in-progress',
    time: '24 min ago'
  },
  {
    id: 'ORD-003',
    customer: 'Michael Brown',
    items: ['Director\'s Cut Steak', 'Moonlit Risotto'],
    total: 61.98,
    status: 'pending',
    time: '36 min ago'
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    items: ['Nocturne Chocolate Cake'],
    total: 12.99,
    status: 'completed',
    time: '48 min ago'
  },
];

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const RecentOrders: React.FC = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{order.id}</span>
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={14} className="mr-1" />
                    {order.time}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{order.customer}</p>
                <p className="text-sm">{order.items.join(", ")}</p>
                <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
