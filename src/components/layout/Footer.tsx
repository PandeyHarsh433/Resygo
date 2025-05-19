
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="font-serif text-2xl font-bold text-cinema-gold">Resygo</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              A unique dining experience blending the art of cinema with fine culinary craftsmanship.
            </p>

            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-cinema-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-cinema-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-cinema-gold transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-1">
            <h3 className="font-serif font-bold">Site Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-cinema-gold">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-sm text-muted-foreground hover:text-cinema-gold">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-sm text-muted-foreground hover:text-cinema-gold">
                  Reservations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-cinema-gold">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-cinema-gold">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="font-serif font-bold">Contact Us</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-muted-foreground">
                123 Cinema Boulevard
              </li>
              <li className="text-sm text-muted-foreground">
                New York, NY 10001
              </li>
              <li className="text-sm text-muted-foreground">
                (212) 555-7890
              </li>
              <li className="text-sm text-muted-foreground">
                info@cinematictable.com
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-1">
            <h3 className="font-serif font-bold">Opening Hours</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex justify-between text-sm text-muted-foreground">
                <span>Monday - Thursday</span>
                <span>11AM - 10PM</span>
              </li>
              <li className="flex justify-between text-sm text-muted-foreground">
                <span>Friday - Saturday</span>
                <span>11AM - 12AM</span>
              </li>
              <li className="flex justify-between text-sm text-muted-foreground">
                <span>Sunday</span>
                <span>10AM - 9PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Resygo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
