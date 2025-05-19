
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const featuredItems: MenuItem[] = [
  {
    id: '1',
    name: 'Moonlit Risotto',
    description: 'Creamy wild mushroom risotto with truffle oil and aged parmesan',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1626106752570-4496495ccdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
    category: 'Mains'
  },
  {
    id: '2',
    name: 'Sunset Boulevard Salmon',
    description: 'Cedar-planked salmon with citrus glaze and roasted seasonal vegetables',
    price: 28.99,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Seafood'
  },
  {
    id: '3',
    name: 'Director\'s Cut Steak',
    description: 'Prime ribeye with black truffle butter and red wine reduction',
    price: 36.99,
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    category: 'Mains'
  },
  {
    id: '4',
    name: 'Nocturne Chocolate Cake',
    description: 'Dark chocolate layer cake with espresso buttercream and gold leaf',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80',
    category: 'Desserts'
  },
];

const FeaturedItems: React.FC = () => {
  const { addItem } = useCart();

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Featured <span className="text-cinema-gold">Culinary Creations</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our chef's selection of signature dishes, crafted with precision and passion to deliver an unforgettable dining experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <div key={item.id} className="menu-item rounded-lg overflow-hidden animate-scale-in">
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="menu-item-image"
                />
                <div className="absolute top-2 right-2 bg-cinema-dark/70 px-2 py-1 rounded text-xs font-medium text-white">
                  {item.category}
                </div>
              </div>
              
              <div className="p-4 bg-card border-t border-border">
                <h3 className="font-serif text-xl font-bold">{item.name}</h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{item.description}</p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium text-lg">${item.price.toFixed(2)}</span>
                  <Button 
                    className="bg-cinema-gold hover:bg-cinema-gold/90 text-white"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link to="/menu">View Full Menu</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
