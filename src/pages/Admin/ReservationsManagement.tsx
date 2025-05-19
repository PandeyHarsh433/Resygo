import React, { useState, useEffect } from 'react';
import { supabase, getUserEmail } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Calendar, User, Clock, Users, Loader2, Search, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type StatusFilter = 'all' | ReservationStatus;

interface Reservation {
  id: string;
  user_id: string | null;
  table_id: string | null;
  reservation_date: string;
  start_time: string;
  end_time: string;
  guests: number;
  status: ReservationStatus;
  notes: string | null;
  created_at: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone_number: string | null;
  } | null;
  tables: {
    number: number;
    capacity: number;
  } | null;
}

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
}

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Editing state
  const [editStatus, setEditStatus] = useState<ReservationStatus>('pending');
  const [editTable, setEditTable] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchReservations(), fetchTables()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reservation data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      // First, fetch all reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: false });
      
      if (reservationsError) throw reservationsError;
      
      // Then, fetch user profiles separately
      const userIds = reservationsData
        .map((r: any) => r.user_id)
        .filter(Boolean);
        
      let userProfiles: Record<string, any> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, phone_number')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // Create a map of user_id -> profile data
        userProfiles = profilesData.reduce((acc: Record<string, any>, profile: any) => {
          acc[profile.id] = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: null, // Will be fetched separately
            phone_number: profile.phone_number
          };
          return acc;
        }, {});
        
        // For each user ID, try to fetch their email using RPC
        for (const userId of userIds) {
          try {
            if (userId && userProfiles[userId]) {
              const email = await getUserEmail(userId);
              
              if (email) {
                userProfiles[userId].email = email;
              }
            }
          } catch (emailError) {
            console.error('Error fetching user email:', emailError);
          }
        }
      }
      
      // Then fetch table data
      const tableIds = reservationsData
        .map((r: any) => r.table_id)
        .filter(Boolean);
        
      let tableData: Record<string, any> = {};
      
      if (tableIds.length > 0) {
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('id, number, capacity')
          .in('id', tableIds);
          
        if (tablesError) throw tablesError;
        
        // Create a map of table_id -> table data
        tableData = tablesData.reduce((acc: Record<string, any>, table: any) => {
          acc[table.id] = {
            number: table.number,
            capacity: table.capacity
          };
          return acc;
        }, {});
      }
      
      // Combine all the data and apply correct typing
      const formattedReservations = reservationsData.map((reservation: any) => {
        // Ensure the status is a valid ReservationStatus
        const status = (reservation.status || 'pending') as ReservationStatus;
        
        return {
          ...reservation,
          status,
          profiles: userProfiles[reservation.user_id] || null,
          tables: reservation.table_id && tableData[reservation.table_id] ? 
            tableData[reservation.table_id] : null
        };
      });
      
      setReservations(formattedReservations);
    } catch (error) {
      console.error('Error in fetchReservations:', error);
      throw error;
    }
  };

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number');
    
    if (error) throw error;
    setTables(data);
  };

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setReservations(prev => 
        prev.map(res => 
          res.id === id ? { ...res, status: newStatus } : res
        )
      );
      
      toast({
        title: 'Status updated',
        description: `Reservation status changed to ${newStatus}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditStatus(reservation.status);
    setEditTable(reservation.table_id);
    setEditNotes(reservation.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: editStatus,
          table_id: editTable,
          notes: editNotes
        })
        .eq('id', selectedReservation.id);
      
      if (error) throw error;
      
      // Find the relevant table data
      const tableInfo = tables.find(t => t.id === editTable);
      
      // Update the local state
      setReservations(prev => 
        prev.map(res => 
          res.id === selectedReservation.id 
            ? { 
                ...res, 
                status: editStatus, 
                table_id: editTable,
                notes: editNotes,
                tables: tableInfo 
                  ? {
                      number: tableInfo.number,
                      capacity: tableInfo.capacity
                    }
                  : null
              } 
            : res
        )
      );
      
      setIsEditDialogOpen(false);
      toast({
        title: 'Reservation updated',
        description: 'The reservation has been updated successfully'
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
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  // Filter and search reservations
  const filteredReservations = reservations.filter(reservation => {
    // Apply status filter
    if (statusFilter !== 'all' && reservation.status !== statusFilter) {
      return false;
    }
    
    // Apply date filter
    if (dateFilter && reservation.reservation_date !== dateFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const firstName = reservation.profiles?.first_name?.toLowerCase() || '';
      const lastName = reservation.profiles?.last_name?.toLowerCase() || '';
      const email = reservation.profiles?.email?.toLowerCase() || '';
      const phone = reservation.profiles?.phone_number?.toLowerCase() || '';
      
      return (
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower)
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
          <h1 className="text-2xl font-bold">Reservations Management</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex flex-1 items-center space-x-2 min-w-[250px]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone"
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-auto"
                />
                
                {(statusFilter !== 'all' || dateFilter || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all');
                      setDateFilter('');
                      setSearchQuery('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead className="text-center">Guests</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                        No reservations found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {reservation.profiles?.first_name} {reservation.profiles?.last_name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {reservation.profiles?.email}
                            </span>
                            {reservation.profiles?.phone_number && (
                              <span className="text-sm text-muted-foreground">
                                {reservation.profiles.phone_number}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(reservation.reservation_date)}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.tables ? (
                            <span>Table {reservation.tables.number} (Seats {reservation.tables.capacity})</span>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{reservation.guests}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditReservation(reservation)}
                            >
                              Edit
                            </Button>
                            {reservation.status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                            )}
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
        
        {/* Edit Reservation Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Reservation</DialogTitle>
            </DialogHeader>
            {selectedReservation && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {selectedReservation.profiles?.first_name} {selectedReservation.profiles?.last_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {formatDate(selectedReservation.reservation_date)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {formatTime(selectedReservation.start_time)} - {formatTime(selectedReservation.end_time)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {selectedReservation.guests} {selectedReservation.guests === 1 ? 'Guest' : 'Guests'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editStatus} 
                    onValueChange={(value: ReservationStatus) => setEditStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="table">Assign Table</Label>
                  <Select 
                    value={editTable || "unassigned"} 
                    onValueChange={(value) => setEditTable(value === "unassigned" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No table assigned</SelectItem>
                      {tables
                        .filter(table => table.capacity >= selectedReservation.guests)
                        .map((table) => (
                          <SelectItem key={table.id} value={table.id}>
                            Table {table.number} (Seats {table.capacity})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateReservation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : 'Update Reservation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ReservationsManagement;
