import React, { useState, useEffect } from 'react';
import { supabase, getUserEmail } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { User, Calendar, Loader2, Search, Filter, DollarSign, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'online' | null;
type StatusFilter = 'all' | OrderStatus;
type PaymentFilter = 'all' | PaymentStatus;

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes: string | null;
  menu_items?: {
    name: string;
  };
  menu_item_name?: string; // Fallback if menu_items relation fails
}

interface Order {
  id: string;
  user_id: string | null;
  table_id: string | null;
  status: OrderStatus;
  total_amount: number | null;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  created_at: string | null;
  updated_at: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
  };
  tables?: {
    number: number;
  } | null;
  order_items: OrderItem[];
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Editing state
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending');
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [editPaymentMethod, setEditPaymentMethod] = useState<string>('none'); // Default to 'none' instead of empty string

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // First, fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Process each order to fetch related data
      const processedOrders: Order[] = [];
      
      for (const order of ordersData) {
        try {
          // Get user profile
          let profileData = null;
          if (order.user_id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone_number')
              .eq('id', order.user_id)
              .single();
              
            if (!profileError) {
              // Get user email via RPC
              const email = await getUserEmail(order.user_id);
                
              profileData = {
                ...profile,
                email
              };
            }
          }
          
          // Get table info if exists
          let tableData = null;
          if (order.table_id) {
            const { data: table, error: tableError } = await supabase
              .from('tables')
              .select('number')
              .eq('id', order.table_id)
              .single();
              
            if (!tableError && table) {
              tableData = table;
            }
          }
          
          // Get order items
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('id, menu_item_id, quantity, price, notes')
            .eq('order_id', order.id);
            
          if (itemsError) throw itemsError;
          
          // For each item, get the menu item name
          const orderItems = await Promise.all(items.map(async (item) => {
            try {
              if (item.menu_item_id) {
                const { data: menuItem, error: menuItemError } = await supabase
                  .from('menu_items')
                  .select('name')
                  .eq('id', item.menu_item_id)
                  .single();
                  
                if (!menuItemError && menuItem) {
                  return {
                    ...item,
                    menu_items: { name: menuItem.name }
                  };
                }
              }
              
              // Fallback if menu_item lookup fails
              return {
                ...item,
                menu_item_name: 'Unknown Item'
              };
            } catch (err) {
              console.error('Error fetching menu item:', err);
              return {
                ...item,
                menu_item_name: 'Unknown Item'
              };
            }
          }));
          
          // Cast status fields to the correct types
          const typedOrder: Order = {
            ...order,
            status: (order.status || 'pending') as OrderStatus,
            payment_status: (order.payment_status || 'unpaid') as PaymentStatus,
            payment_method: order.payment_method as PaymentMethod,
            profiles: profileData,
            tables: tableData,
            order_items: orderItems
          };
          
          processedOrders.push(typedOrder);
        } catch (err) {
          console.error('Error processing order:', err);
          // Still include order with minimal info but with proper typing
          const fallbackOrder: Order = {
            ...order,
            status: (order.status || 'pending') as OrderStatus,
            payment_status: (order.payment_status || 'unpaid') as PaymentStatus,
            payment_method: order.payment_method as PaymentMethod,
            order_items: []
          };
          processedOrders.push(fallbackOrder);
        }
      }
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load order data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: 'Status updated',
        description: `Order status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handlePaymentStatusChange = async (id: string, newStatus: PaymentStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, payment_status: newStatus } : order
        )
      );
      
      toast({
        title: 'Payment status updated',
        description: `Payment status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.payment_status);
    setEditPaymentMethod(order.payment_method || 'none'); // Default to 'none' instead of empty string
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: editStatus,
          payment_status: editPaymentStatus,
          payment_method: editPaymentMethod || null
        })
        .eq('id', selectedOrder.id);
      
      if (error) throw error;
      
      // Update the local state
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id 
            ? { 
                ...order, 
                status: editStatus, 
                payment_status: editPaymentStatus,
                payment_method: editPaymentMethod as PaymentMethod || null
              } 
            : order
        )
      );
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Order updated',
        description: 'The order has been updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ready': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'served': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    // Apply status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Apply payment filter
    if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) {
      return false;
    }
    
    // Apply date filter
    if (dateFilter && order.created_at) {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (orderDate !== dateFilter) {
        return false;
      }
    }
    
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const firstName = order.profiles?.first_name?.toLowerCase() || '';
      const lastName = order.profiles?.last_name?.toLowerCase() || '';
      const email = order.profiles?.email?.toLowerCase() || '';
      const phone = order.profiles?.phone_number?.toLowerCase() || '';
      const orderId = order.id.toLowerCase();
      
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        orderId.includes(searchLower)
      );
    }
    
    return true;
  });

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex flex-1 items-center space-x-2 min-w-[250px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone or order ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="served">Served</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={paymentFilter} onValueChange={(value: PaymentFilter) => setPaymentFilter(value)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-auto"
                />
                
                {(statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setPaymentFilter('all');
                      setDateFilter('');
                      setSearchQuery('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        No orders found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono text-sm font-medium">
                            #{order.id.slice(-8)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.profiles?.first_name} {order.profiles?.last_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {order.profiles?.email || "Email not available"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.created_at && formatDate(order.created_at)}</span>
                            {order.tables && (
                              <span className="text-sm text-muted-foreground">
                                Table {order.tables.number}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">${order.total_amount?.toFixed(2) || '0.00'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getPaymentStatusColor(order.payment_status)}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(order)}
                            >
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.created_at && formatDate(selectedOrder.created_at)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                        {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name} ({selectedOrder.profiles?.email || "Email not available"})
                    </span>
                  </div>
                  
                  {selectedOrder.tables && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Table: {selectedOrder.tables.number}</span>
                    </div>
                  )}
                  
                  {selectedOrder.payment_method && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Payment Method: {selectedOrder.payment_method}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="mb-2 font-medium">Order Items</h3>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.order_items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.menu_items?.name || item.menu_item_name || "Unknown Item"}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${selectedOrder.total_amount?.toFixed(2) || '0.00'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-between gap-2">
                  {selectedOrder.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'preparing');
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      Start Preparing
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'preparing' && (
                    <Button 
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'ready');
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      Mark as Ready
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'ready' && (
                    <Button 
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'served');
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      Mark as Served
                    </Button>
                  )}
                  
                  {['served', 'ready'].includes(selectedOrder.status) && (
                    <Button 
                      onClick={() => {
                        handleStatusChange(selectedOrder.id, 'completed');
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      Complete Order
                    </Button>
                  )}
                  
                  {selectedOrder.payment_status === 'unpaid' && (
                    <Button 
                      variant="default"
                      onClick={() => {
                        handlePaymentStatusChange(selectedOrder.id, 'paid');
                        setIsDetailsDialogOpen(false);
                      }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Edit Order Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{selectedOrder.created_at && formatDate(selectedOrder.created_at)}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Status</label>
                  <Select value={editStatus} onValueChange={(value: OrderStatus) => setEditStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select value={editPaymentStatus} onValueChange={(value: PaymentStatus) => setEditPaymentStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select 
                    value={editPaymentMethod} 
                    onValueChange={setEditPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem> {/* Changed from empty string to "none" */}
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : 'Update Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default OrdersManagement;
