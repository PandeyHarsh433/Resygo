
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { CalendarClock, Users, Clock, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

interface TimeSlot {
  label: string;
  value: string;
}

// Generate time slots from 10 AM to 10 PM with 30-minute intervals
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 10; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      const time = `${hourStr}:${minuteStr}`;
      slots.push({ label: time, value: time });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();
const partySize = Array.from({ length: 10 }, (_, i) => i + 1);

const Reservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("18:00");
  const [guests, setGuests] = useState<string>("2");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!date || !time || !guests) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Calculate end time (2 hours after start)
    const startTime = time;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = (hours + 2) % 24;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          reservation_date: formattedDate,
          start_time: startTime,
          end_time: endTime,
          guests: parseInt(guests),
          notes: notes
        })
        .select();

      if (error) throw error;

      toast({
        title: "Reservation successful",
        description: "Your table has been reserved!"
      });

      // Reset form or navigate
      navigate('/profile');

    } catch (error: any) {
      console.error('Reservation error:', error);
      toast({
        title: "Reservation failed",
        description: error.message || "Failed to make reservation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-1 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold">
            Make a <span className="text-cinema-gold">Reservation</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reserve your table for a memorable dining experience
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book Your Table</CardTitle>
              <CardDescription>
                Please fill in your details to make a reservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReservation} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4" />
                      Date
                    </Label>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => {
                        // Disable dates in the past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="border rounded-md"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Time
                      </Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Number of Guests
                      </Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select party size" />
                        </SelectTrigger>
                        <SelectContent>
                          {partySize.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'Person' : 'People'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Special Requests</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests or dietary requirements?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-cinema-gold hover:bg-cinema-gold/90"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : 'Book Now'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="login"
      />
    </Layout>
  );
};

export default Reservations;
