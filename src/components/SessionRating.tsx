import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { FeedbackModal } from '@/components/FeedbackModal';

interface SessionRatingProps {
  agentId: string;
  sessionId?: string;
  className?: string;
}

export const SessionRating: React.FC<SessionRatingProps> = ({ 
  agentId, 
  sessionId, 
  className = "" 
}) => {
  const [hasRated, setHasRated] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [currentRatingType, setCurrentRatingType] = useState<'thumbs_up' | 'thumbs_down' | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleRating = async (ratingType: 'thumbs_up' | 'thumbs_down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate this agent.",
        variant: "destructive",
      });
      return;
    }

    if (hasRated) {
      toast({
        title: "Already rated",
        description: "You have already rated this session.",
      });
      return;
    }

    // Both thumbs up and thumbs down now open the feedback modal
    setCurrentRatingType(ratingType);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackModalClose = () => {
    setIsFeedbackModalOpen(false);
    setHasRated(true); // Mark as rated even if they close the modal after submitting thumbs down
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground">Rate this session:</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating('thumbs_up')}
            disabled={hasRated}
            className={`hover:bg-green-100 hover:text-green-700 ${
              hasRated ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRating('thumbs_down')}
            disabled={hasRated}
            className={`hover:bg-red-100 hover:text-red-700 ${
              hasRated ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleFeedbackModalClose}
        agentId={agentId}
        sessionId={sessionId}
        ratingType={currentRatingType}
      />
    </>
  );
};