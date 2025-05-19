import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { UserRound, Calendar, ShoppingBag, LogOut, Edit, Save, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  address: string | null;
  role: string;
}

interface Reservation {
  id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  guests: number;
  status: string;
  created_at: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfile(),
        fetchReservations(),
        fetchOrders()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const fetchReservations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }
      
      if (data) {
        setReservations(data);
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }
      
      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSavingProfile(true);
    try {
      console.log("Updating profile with data:", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        address: formData.address
      });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      // Refresh profile data
      await fetchProfile();
      setEditing(false);
    } catch (error: any) {
      console.error('Profile update error (caught):', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    // Parse the time string (e.g., "18:00")
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Format the time
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
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

  const handleOrderDetail = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cinema-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold">
            Your <span className="text-cinema-gold">Profile</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account, reservations, and orders
          </p>
        </div>
        
        <div className="mx-auto max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center">
                <UserRound className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Reservations
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>View and update your personal details</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!editing ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setEditing(true)}
                          className="flex items-center"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditing(false);
                            // Reset form data to current profile values
                            if (profile) {
                              setFormData({
                                first_name: profile.first_name || '',
                                last_name: profile.last_name || '',
                                phone_number: profile.phone_number || '',
                                address: profile.address || ''
                              });
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        onClick={signOut}
                        className="flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-cinema-gold hover:bg-cinema-gold/90"
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Name</p>
                          <p>
                            {profile?.first_name || ''} {profile?.last_name || ''}
                            {!profile?.first_name && !profile?.last_name && 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p>{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                          <p>{profile?.phone_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                          <Badge variant="outline" className="mt-1">
                            {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Guest'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p>{profile?.address || 'Not provided'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reservations Tab */}
            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Reservations</CardTitle>
                      <CardDescription>View and manage your table reservations</CardDescription>
                    </div>
                    <Button 
                      className="bg-cinema-gold hover:bg-cinema-gold/90"
                      onClick={() => navigate('/reservations')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      New Reservation
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {reservations.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center space-y-4 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="text-lg font-medium">No reservations yet</p>
                        <p className="text-sm text-muted-foreground">
                          Book a table to plan your next visit
                        </p>
                      </div>
                      <Button 
                        onClick={() => navigate('/reservations')}
                        className="bg-cinema-gold hover:bg-cinema-gold/90"
                      >
                        Make Reservation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reservations.map((reservation) => (
                        <Card key={reservation.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between">
                              <div className="mb-2 md:mb-0">
                                <p className="font-serif text-lg font-medium">
                                  {formatDate(reservation.reservation_date)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {reservation.guests} {reservation.guests === 1 ? 'Guest' : 'Guests'}
                                </p>
                              </div>
                              
                              <Badge className={getReservationStatusColor(reservation.status)}>
                                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>View your past and current orders</CardDescription>
                    </div>
                    <Button 
                      className="bg-cinema-gold hover:bg-cinema-gold/90"
                      onClick={() => navigate('/menu')}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center space-y-4 text-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                      <div>
                        <p className="text-lg font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground">
                          Place an order to see your order history
                        </p>
                      </div>
                      <Button 
                        onClick={() => navigate('/menu')}
                        className="bg-cinema-gold hover:bg-cinema-gold/90"
                      >
                        Browse Menu
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between">
                              <div className="mb-2 md:mb-0">
                                <p className="font-serif text-lg font-medium">
                                  Order #{order.id.slice(-8)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                                <p className="font-medium">
                                  ${order.total_amount.toFixed(2)}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Badge className={getOrderStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                                <Badge className={getPaymentStatusColor(order.payment_status)}>
                                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
