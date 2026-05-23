'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { setEventFeatured } from '@/lib/api';
import { extractApiError } from '@/lib/api-error';

interface EventFeaturedToggleProps {
  eventId: string;
  featured: boolean;
  rowVersion: number;
}

export const EventFeaturedToggle = ({
  eventId,
  featured,
  rowVersion,
}: EventFeaturedToggleProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'Admin') return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const { error } = await setEventFeatured({
        path: { id: eventId },
        body: { featured: !featured, rowVersion },
      });
      if (error) {
        toast.error(extractApiError(error), { duration: Infinity });
      } else {
        toast.success(
          featured ? 'Removed from featured' : 'Marked as featured'
        );
        router.refresh();
      }
    } catch (err) {
      toast.error(
        extractApiError(err, 'Something went wrong. Please try again.'),
        {
          duration: Infinity,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      disabled={loading}
      className="w-full gap-2"
    >
      <Star
        className={`size-4 transition-colors ${featured ? 'fill-yellow-400 text-yellow-400' : ''}`}
      />
      {featured ? 'Remove from Featured' : 'Mark as Featured'}
    </Button>
  );
};
