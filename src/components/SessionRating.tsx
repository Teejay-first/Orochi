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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (ratingType === 'thumbs_down') {
      setIsFeedbackModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('agent_ratings')
        .insert({
          agent_id: agentId,
          session_id: sessionId,
          rating_type: ratingType
        });

      if (error) throw error;

      setHasRated(true);
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback! This helps us improve the agent experience.",
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={hasRated || isSubmitting}
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
            disabled={hasRated || isSubmitting}
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
      />
    </>
  );
};