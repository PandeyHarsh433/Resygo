
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalAmount, checkout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const orderId = await checkout();
      if (orderId) {
        navigate('/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold">
            Your <span className="text-cinema-gold">Cart</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review your items before checkout
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Cart Items ({totalItems})
                </CardTitle>
              </CardHeader>
              
              {items.length === 0 ? (
                <CardContent>
                  <div className="flex h-40 flex-col items-center justify-center space-y-4 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                    <div>
                      <p className="text-lg font-medium">Your cart is empty</p>
                      <p className="text-sm text-muted-foreground">
                        Add items from our menu to get started
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/menu')}
                      className="bg-cinema-gold hover:bg-cinema-gold/90"
                    >
                      Browse Menu
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <ul className="divide-y">
                    {items.map((item) => (
                      <li key={item.id} className="flex py-4">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1546241072-48010ad2862c'}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium">
                            <h3>{item.name}</h3>
                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} each
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-3 w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(totalAmount * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Order Total</span>
                    <span>${(totalAmount * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-cinema-gold hover:bg-cinema-gold/90"
                  onClick={handleCheckout}
                  disabled={items.length === 0 || loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
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

export default Cart;
