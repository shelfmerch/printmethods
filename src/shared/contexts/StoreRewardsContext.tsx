import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storeRewardsApi } from '@/lib/api';
import { useStoreAuth } from '@/contexts/StoreAuthContext';

export type StoreRewardStatus = 'claimable' | 'claimed' | 'expired' | 'used';

export type StoreReward = {
  id: string;
  title: string;
  category: string;
  amountPaise: number;
  status: StoreRewardStatus;
  expiresAt?: string | null;
  claimedAt?: string | null;
};

export type RewardsWalletSummary = {
  totalBalancePaise: number;
  usedBalancePaise: number;
  remainingBalancePaise: number;
  pendingClaimablePaise: number;
  hasClaimedRewards?: boolean;
};

type StoreRewardsContextType = {
  wallet: RewardsWalletSummary | null;
  rewards: StoreReward[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const StoreRewardsContext = createContext<StoreRewardsContextType | undefined>(undefined);

export const StoreRewardsProvider: React.FC<{ children: React.ReactNode; subdomain: string }> = ({ children, subdomain }) => {
  const { isAuthenticated, customer, isLoading: authLoading } = useStoreAuth();
  const [wallet, setWallet] = useState<RewardsWalletSummary | null>(null);
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!subdomain || authLoading || !isAuthenticated || !customer) {
      setWallet(null);
      setRewards([]);
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const [walletResp, rewardsResp] = await Promise.all([
        storeRewardsApi.getWallet(subdomain),
        storeRewardsApi.listRewards(subdomain),
      ]);

      if (walletResp?.success) {
        setWallet(walletResp.data || null);
      }

      if (rewardsResp?.success) {
        setRewards(Array.isArray(rewardsResp.data) ? rewardsResp.data : []);
      }
    } catch (e) {
      console.error('Failed to load store rewards', e);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [subdomain, authLoading, isAuthenticated, customer]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      wallet,
      rewards,
      loading,
      refresh,
    }),
    [wallet, rewards, loading, refresh]
  );

  return <StoreRewardsContext.Provider value={value}>{children}</StoreRewardsContext.Provider>;
};

export function useStoreRewards() {
  const ctx = useContext(StoreRewardsContext);
  if (!ctx) throw new Error('useStoreRewards must be used within StoreRewardsProvider');
  return ctx;
}

