
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Download } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

interface DailySales {
  date: string;
  sales: number;
}

interface CategorySales {
  name: string;
  sales: number;
}

interface ItemSales {
  name: string;
  sales: number;
}

interface CustomerStats {
  name: string;
  orders: number;
  spending: number;
}

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [topItems, setTopItems] = useState<ItemSales[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerStats[]>([]);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate the data fetching from the database
      await Promise.all([
        fetchSalesData(),
        fetchCategorySales(),
        fetchTopItems(),
        fetchTopCustomers()
      ]);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // These functions would normally fetch data from the database
  // Here, we're generating sample data for demonstration purposes
  
  const fetchSalesData = async () => {
    // Get date range
    const days = getDateRange();
    const daysMap = days.map(day => ({ date: day, sales: 0 }));
    
    // Fetch orders from the date range
    const { data, error } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', days[0])
      .order('created_at');
    
    if (error) throw error;
    
    if (data) {
      // Calculate total revenue and orders
      let revenue = 0;
      let orderCount = 0;
      
      data.forEach(order => {
        if (order.status !== 'cancelled') {
          revenue += order.total_amount;
          orderCount++;
          
          // Find the day index and add the sale
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          const dayIndex = daysMap.findIndex(d => d.date === orderDate);
          if (dayIndex !== -1) {
            daysMap[dayIndex].sales += order.total_amount;
          }
        }
      });
      
      setTotalRevenue(revenue);
      setTotalOrders(orderCount);
      setAverageOrderValue(orderCount > 0 ? revenue / orderCount : 0);
      setDailySales(daysMap);
    }
  };

  const fetchCategorySales = async () => {
    // This would normally join tables to get category sales
    // Here, we'll generate sample data based on our existing categories
    setCategorySales([
      { name: 'Appetizers', sales: 1250 },
      { name: 'Main Courses', sales: 3420 },
      { name: 'Desserts', sales: 980 },
      { name: 'Drinks', sales: 1680 },
      { name: 'Special Menu', sales: 2100 }
    ]);
  };

  const fetchTopItems = async () => {
    // This would normally join tables to get top selling items
    // Here, we'll generate sample data
    setTopItems([
      { name: 'Ribeye Steak', sales: 85 },
      { name: 'Truffle Arancini', sales: 64 },
      { name: 'Mushroom Risotto', sales: 52 },
      { name: 'Chocolate Soufflé', sales: 48 },
      { name: 'Burrata Salad', sales: 36 }
    ]);
  };

  const fetchTopCustomers = async () => {
    // This would normally join tables to get top customers
    // Here, we'll generate sample data
    setTopCustomers([
      { name: 'John Smith', orders: 12, spending: 845 },
      { name: 'Emily Johnson', orders: 8, spending: 620 },
      { name: 'David Wilson', orders: 6, spending: 530 },
      { name: 'Sarah Brown', orders: 5, spending: 480 },
      { name: 'Michael Davis', orders: 4, spending: 390 }
    ]);
  };

  // Helper to get date range based on selected time range
  const getDateRange = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    let days: number;
    
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '12m': days = 365; break;
      default: days = 7;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  // Chart colors
  const COLORS = ['#ffc658', '#8884d8', '#82ca9d', '#ff7c43', '#a05195'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cinema-gold" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl font-bold">Reports</h1>
          
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                For the selected time period
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-xs text-muted-foreground">
                For the selected time period
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">
                For the selected time period
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          
          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailySales}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                          labelFormatter={(label) => formatDate(label)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySales}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="sales"
                        >
                          {categorySales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topItems}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80}
                        />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categorySales}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                        />
                        <Bar dataKey="sales" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Customers Tab */}
          <TabsContent value="customers">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topCustomers}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80}
                        />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topCustomers}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
                        />
                        <Bar dataKey="spending" fill="#ff7c43" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Reports;
