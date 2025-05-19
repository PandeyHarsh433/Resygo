
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, isAdmin, isStaff } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Current user:', user?.email);
  console.log('ProtectedRoute - Role check:', { requiredRole, isAdmin, isStaff });

  useEffect(() => {
    if (!loading && user) {
      if (requiredRole === 'admin' && !isAdmin) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive"
        });
      } else if (requiredRole === 'staff' && !isStaff) {
        toast({
          title: "Access Denied",
          description: "You need staff privileges to access this page.",
          variant: "destructive"
        });
      }
    }
  }, [loading, user, requiredRole, isAdmin, isStaff]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cinema-gold" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log('ProtectedRoute - Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Role check for admin access
  if (requiredRole === 'admin' && !isAdmin) {
    console.log('ProtectedRoute - Not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // Role check for staff access
  if (requiredRole === 'staff' && !isStaff) {
    console.log('ProtectedRoute - Not staff, redirecting to /');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
