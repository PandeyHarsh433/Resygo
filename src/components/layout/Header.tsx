
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Menu, X, LogIn, User, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import AuthModal from '@/components/auth/AuthModal';

const Header = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-serif text-2xl font-bold text-cinema-gold">Resygo</span>
        </Link>

        {/* Desktop Navigation - Only show Home and Menu on desktop, rest in mobile menu */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navigationLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-cinema-gold ${isActive(link.path) ? 'text-cinema-gold' : 'text-foreground'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side - Auth & Cart */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="hidden md:flex">
                  <Link to="/admin">
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="icon">
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cinema-gold text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          {/* Mobile Menu Trigger */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-5">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <Link
                    to="/"
                    className="flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-serif text-xl font-bold text-cinema-gold">Resygo</span>
                  </Link>

                </div>

                <nav className="mt-6 flex flex-col space-y-4">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`py-2 text-lg font-medium transition-colors hover:text-cinema-gold ${isActive(link.path) ? 'text-cinema-gold' : 'text-foreground'
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="border-t border-border pt-4 mt-2">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center py-2 text-lg font-medium transition-colors hover:text-cinema-gold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="mr-2 h-5 w-5" />
                          My Profile
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center py-2 text-lg font-medium transition-colors hover:text-cinema-gold"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In / Sign Up
                      </Button>
                    )}

                    <Link
                      to="/cart"
                      className="flex items-center py-2 mt-2 text-lg font-medium transition-colors hover:text-cinema-gold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Cart {totalItems > 0 && `(${totalItems})`}
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab="login"
      />
    </header>
  );
};

export default Header;
