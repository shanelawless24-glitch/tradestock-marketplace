// TradeStock Marketplace - Auth Hook
// ============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, AuthState } from '@/lib/types';

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    dealerId: null,
    dealerStatus: null,
    subscriptionStatus: null,
    isLoading: true,
  });

  // Fetch complete auth state
  const fetchAuthState = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setState({
          user: null,
          role: null,
          dealerId: null,
          dealerStatus: null,
          subscriptionStatus: null,
          isLoading: false,
        });
        return;
      }

      const user: User = {
        id: authUser.id,
        email: authUser.email!,
        user_metadata: authUser.user_metadata,
        app_metadata: authUser.app_metadata,
      };

      // Check if admin
      const isAdmin = authUser.app_metadata?.role === 'admin';
      
      if (isAdmin) {
        setState({
          user,
          role: 'admin',
          dealerId: null,
          dealerStatus: null,
          subscriptionStatus: null,
          isLoading: false,
        });
        return;
      }

      // Fetch dealer info
      const { data: dealerUser } = await supabase
        .from('dealer_users')
        .select(`
          dealer_id,
          role,
          dealer:dealers(
            id,
            status,
            subscription_status
          )
        `)
        .eq('user_id', authUser.id)
        .single();

      const dealer = dealerUser?.dealer as any;

      setState({
        user,
        role: dealerUser?.role as AuthState['role'],
        dealerId: dealerUser?.dealer_id || null,
        dealerStatus: dealer?.status || null,
        subscriptionStatus: dealer?.subscription_status || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching auth state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [supabase]);

  // Initial load
  useEffect(() => {
    fetchAuthState();
  }, [fetchAuthState]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          fetchAuthState();
        } else {
          setState({
            user: null,
            role: null,
            dealerId: null,
            dealerStatus: null,
            subscriptionStatus: null,
            isLoading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchAuthState]);

  // Auth actions
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    await fetchAuthState();
    router.refresh();
    
    return data;
  }, [supabase, router, fetchAuthState]);

  const signUp = useCallback(async (email: string, password: string, metadata?: object) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    
    return data;
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      role: null,
      dealerId: null,
      dealerStatus: null,
      subscriptionStatus: null,
      isLoading: false,
    });
    router.push('/');
    router.refresh();
  }, [supabase, router]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  }, [supabase]);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }, [supabase]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refresh: fetchAuthState,
  };
}

// Hook for checking marketplace access
export function useMarketplaceAccess() {
  const { subscriptionStatus, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const { isBeforeLaunch } = require('@/lib/constants');
      setHasAccess(
        subscriptionStatus === 'active' && !isBeforeLaunch()
      );
    }
  }, [subscriptionStatus, isLoading]);

  return { hasAccess, isLoading };
}
