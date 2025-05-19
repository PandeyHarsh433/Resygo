
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-[90vh] overflow-hidden cinema-grain">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-dark to-black/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-6xl text-white font-bold leading-tight cinema-text-shadow">
            <span className="text-cinema-gold">Resygo</span> Dining Experience
          </h1>

          <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
            Immerse yourself in a culinary journey where every dish tells a story and every meal is a memorable scene.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
            <Button asChild size="lg" className="bg-cinema-gold hover:bg-cinema-gold/90 text-white">
              <Link to="/menu">Browse Menu</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cinema-light text-cinema-light hover:bg-cinema-light/10">
              <Link to="/reservations">Make a Reservation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
