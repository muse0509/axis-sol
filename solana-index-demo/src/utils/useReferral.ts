import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

export function useReferral() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [referrer, setReferrer] = useState<string | null>(null);
  const [hasProcessedReferral, setHasProcessedReferral] = useState(false);

  useEffect(() => {
    const { ref } = router.query;
    if (ref && typeof ref === 'string') {
      setReferrer(ref);
      localStorage.setItem('referrer', ref);
    } else {
      const storedReferrer = localStorage.getItem('referrer');
      if (storedReferrer) {
        setReferrer(storedReferrer);
      }
    }
  }, [router.query]);

  useEffect(() => {
    if (connected && publicKey && referrer && !hasProcessedReferral) {
      processReferral(referrer, publicKey.toBase58());
    }
  }, [connected, publicKey, referrer, hasProcessedReferral]);

  const processReferral = async (referrerAddress: string, referredAddress: string) => {
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referrer: referrerAddress,
          referred: referredAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('🎉 Referral established! Welcome to AXIS!');
        localStorage.removeItem('referrer');
        setHasProcessedReferral(true);
      } else if (response.status === 409) {
        toast.success('You\'ve already joined through a referral!');
        localStorage.removeItem('referrer');
        setHasProcessedReferral(true);
      } else {
        console.error('Failed to process referral:', data.error);
      }
    } catch (error) {
      console.error('Error processing referral:', error);
    }
  };

  return {
    referrer,
    hasReferrer: !!referrer,
  };
}