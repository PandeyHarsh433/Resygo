
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // General settings
  const [restaurantName, setRestaurantName] = useState('Resygo');
  const [restaurantEmail, setRestaurantEmail] = useState('info@cinematictable.com');
  const [restaurantPhone, setRestaurantPhone] = useState('(212) 555-7890');
  const [restaurantAddress, setRestaurantAddress] = useState('123 Cinema Boulevard, New York, NY 10001');

  // Appearance settings
  const [colorTheme, setColorTheme] = useState('cinema-gold');
  const [darkMode, setDarkMode] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reservationNotifications, setReservationNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [guestFeedbackNotifications, setGuestFeedbackNotifications] = useState(true);

  // Hours settings
  const [hoursData, setHoursData] = useState({
    monday: { open: '11:00', close: '22:00', closed: false },
    tuesday: { open: '11:00', close: '22:00', closed: false },
    wednesday: { open: '11:00', close: '22:00', closed: false },
    thursday: { open: '11:00', close: '22:00', closed: false },
    friday: { open: '11:00', close: '24:00', closed: false },
    saturday: { open: '11:00', close: '24:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });

  // This would normally load settings from the database
  useEffect(() => {
    setLoading(true);
    // Simulate loading settings from database
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHoursData(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    setSaving(true);

    // Simulate saving to database
    setTimeout(() => {
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully'
      });
      setSaving(false);
    }, 1000);
  };

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
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your restaurant information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-email">Email Address</Label>
                    <Input
                      id="restaurant-email"
                      type="email"
                      value={restaurantEmail}
                      onChange={(e) => setRestaurantEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-phone">Phone Number</Label>
                    <Input
                      id="restaurant-phone"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurant-address">Address</Label>
                  <Input
                    id="restaurant-address"
                    value={restaurantAddress}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reservations-enabled">Allow Online Reservations</Label>
                    <Switch
                      id="reservations-enabled"
                      checked={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customers can make reservations through the website
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="orders-enabled">Allow Online Orders</Label>
                    <Switch
                      id="orders-enabled"
                      checked={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customers can place orders online for pickup or dine-in
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your restaurant interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="color-theme">Color Theme</Label>
                  <Select value={colorTheme} onValueChange={setColorTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinema-gold">Cinema Gold</SelectItem>
                      <SelectItem value="restaurant-red">Restaurant Red</SelectItem>
                      <SelectItem value="ocean-blue">Ocean Blue</SelectItem>
                      <SelectItem value="forest-green">Forest Green</SelectItem>
                      <SelectItem value="elegant-purple">Elegant Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the admin interface
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className={`rounded-md border p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
                    <div className={`mb-2 text-lg font-bold ${colorTheme === 'cinema-gold' ? 'text-cinema-gold' : 'text-blue-500'}`}>
                      Resygo
                    </div>
                    <p className="text-sm">This is how your theme settings will look to users.</p>
                    <div className="mt-4">
                      <Button
                        className={colorTheme === 'cinema-gold' ? 'bg-cinema-gold hover:bg-cinema-gold/90' : ''}
                      >
                        Sample Button
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage your email and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Types</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reservation-notifications">New Reservations</Label>
                      <Switch
                        id="reservation-notifications"
                        checked={reservationNotifications}
                        onCheckedChange={setReservationNotifications}
                        disabled={!emailNotifications}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new reservation is made
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="order-notifications">New Orders</Label>
                      <Switch
                        id="order-notifications"
                        checked={orderNotifications}
                        onCheckedChange={setOrderNotifications}
                        disabled={!emailNotifications}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new order is placed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="feedback-notifications">Guest Feedback</Label>
                      <Switch
                        id="feedback-notifications"
                        checked={guestFeedbackNotifications}
                        onCheckedChange={setGuestFeedbackNotifications}
                        disabled={!emailNotifications}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get notified when guests leave feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hours Tab */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  Set your restaurant's operating hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(hoursData).map(([day, hours]) => (
                    <div key={day} className="grid grid-cols-12 items-center gap-4">
                      <div className="col-span-3 font-medium">
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </div>

                      <div className="col-span-8 flex items-center space-x-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor={`${day}-open`} className="text-xs">Opening Time</Label>
                            <Input
                              id={`${day}-open`}
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                              disabled={hours.closed}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${day}-close`} className="text-xs">Closing Time</Label>
                            <Input
                              id={`${day}-close`}
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                              disabled={hours.closed}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${day}-closed`}
                            checked={hours.closed}
                            onCheckedChange={(checked) => handleHoursChange(day, 'closed', checked)}
                          />
                          <Label htmlFor={`${day}-closed`} className="text-xs">Closed</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
