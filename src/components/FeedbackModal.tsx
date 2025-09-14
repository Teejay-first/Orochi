import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  sessionId?: string;
}

const FEEDBACK_TAGS = [
  { label: 'Gives wrong info', value: 'wrong_info', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  { label: "Didn't understand me", value: 'did_not_understand', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { label: 'Audio quality', value: 'audio_quality', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { label: 'Too slow / latency', value: 'too_slow', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { label: 'Rude / offensive', value: 'rude', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { label: 'UI issue', value: 'ui_issue', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  agentId, 
  sessionId 
}) => {
  const [ratings, setRatings] = useState({
    voice_naturality: 0,
    accuracy: 0,
    response_speed: 0
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleTagToggle = (tagValue: string) => {
    setSelectedTags(prev => 
      prev.includes(tagValue) 
        ? prev.filter(tag => tag !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('agent_ratings')
        .insert({
          agent_id: agentId,
          session_id: sessionId,
          rating_type: 'thumbs_down',
          voice_naturality: ratings.voice_naturality || null,
          accuracy: ratings.accuracy || null,
          response_speed: ratings.response_speed || null,
          feedback_tags: selectedTags.length > 0 ? selectedTags : null,
          feedback_text: feedbackText.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! This helps improve the agent.",
      });

      onClose();
      
      // Reset form
      setRatings({ voice_naturality: 0, accuracy: 0, response_speed: 0 });
      setSelectedTags([]);
      setFeedbackText('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = ({ value, onChange, label }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string; 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-primary text-primary'
                  : 'fill-none text-muted-foreground hover:text-primary'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Help us improve this agent
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Rate your experience (optional)</h3>
            <div className="grid gap-4">
              <RatingStars
                value={ratings.voice_naturality}
                onChange={(value) => handleRatingChange('voice_naturality', value)}
                label="Voice naturality"
              />
              <RatingStars
                value={ratings.accuracy}
                onChange={(value) => handleRatingChange('accuracy', value)}
                label="Accuracy/factuality"
              />
              <RatingStars
                value={ratings.response_speed}
                onChange={(value) => handleRatingChange('response_speed', value)}
                label="Speed of responses"
              />
            </div>
          </div>

          {/* Feedback Tags */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">What went wrong? (optional)</h3>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <Badge
                  key={tag.value}
                  variant="outline"
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag.value)
                      ? tag.color
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => handleTagToggle(tag.value)}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Additional feedback (optional)
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};