import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const useAuthGuard = (requiredRole?: 'admin' | 'super_admin') => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          navigate('/admin-login');
          return;
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          navigate('/admin-login');
          return;
        }

        const role = profile.role;
        setUserRole(role);

        // Check if user has required role
        if (requiredRole) {
          if (role !== requiredRole && role !== 'super_admin') {
            navigate('/');
            setIsAuthorized(false);
            return;
          }
        }

        // Both 'admin' and 'super_admin' can access admin features
        if (role === 'admin' || role === 'super_admin') {
          setIsAuthorized(true);
        } else {
          navigate('/');
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/admin-login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  return { isAuthorized, userRole, loading };
};