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
  ratingType: 'thumbs_up' | 'thumbs_down' | null;
}

const NEGATIVE_FEEDBACK_TAGS = [
  { label: 'Wrong/Outdated Info', value: 'wrong_info', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  { label: "Didn't Understand", value: 'did_not_understand', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { label: 'Hallucinated/Made Up', value: 'hallucination', color: 'bg-red-200 text-red-900 hover:bg-red-300' },
  { label: 'Off-Topic/Looping', value: 'off_topic_loop', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { label: 'Slow/High Latency', value: 'latency', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { label: 'Audio Quality (TTS)', value: 'audio_quality', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { label: 'Mic/ASR Errors', value: 'asr_error', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
  { label: 'Accent/Language Mismatch', value: 'lang_mismatch', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
  { label: 'Background Noise', value: 'background_noise', color: 'bg-teal-100 text-teal-800 hover:bg-teal-200' },
  { label: 'Rude/Unsafe Content', value: 'unsafe_content', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { label: 'Policy Violation', value: 'policy_violation', color: 'bg-red-300 text-red-900 hover:bg-red-400' },
  { label: 'Action Failed (API)', value: 'action_failed', color: 'bg-orange-200 text-orange-900 hover:bg-orange-300' },
  { label: 'Wrong Route/Workflow', value: 'routing_error', color: 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300' },
  { label: 'UI/Controls Issue', value: 'ui_issue', color: 'bg-gray-100 text-gray-800 hover:bg-gray-200' },
  { label: 'Payment/Access Issue', value: 'access_issue', color: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
];

const POSITIVE_FEEDBACK_TAGS = [
  { label: 'Accurate / Helpful Info', value: 'accurate_helpful', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { label: 'Understood Me Well', value: 'understood_me', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { label: 'Fast / Low Latency', value: 'fast_latency', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
  { label: 'Clear & Concise Explanations', value: 'clear_concise', color: 'bg-teal-100 text-teal-800 hover:bg-teal-200' },
  { label: 'Friendly / Polite Tone', value: 'friendly_polite', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
  { label: 'Natural-Sounding Voice', value: 'natural_voice', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { label: 'Stayed On Topic', value: 'on_topic', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
  { label: 'Solved My Problem', value: 'solved_problem', color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
  { label: 'Great Recommendations', value: 'good_recommendations', color: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200' },
  { label: 'Handled Accent / Language Well', value: 'lang_handling', color: 'bg-lime-100 text-lime-800 hover:bg-lime-200' },
  { label: 'Engaging / Fun to Use', value: 'engaging_fun', color: 'bg-amber-100 text-amber-800 hover:bg-amber-200' },
  { label: 'Consistent / Reliable Responses', value: 'consistent_reliable', color: 'bg-violet-100 text-violet-800 hover:bg-violet-200' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  agentId, 
  sessionId,
  ratingType 
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
    // Validate that all 3 ratings are provided (mandatory)
    if (!ratings.voice_naturality || !ratings.accuracy || !ratings.response_speed) {
      toast({
        title: "Required ratings missing",
        description: "Please rate all three categories before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!ratingType) {
      toast({
        title: "Error",
        description: "Rating type is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('agent_ratings')
        .insert({
          agent_id: agentId,
          session_id: sessionId,
          rating_type: ratingType,
          voice_naturality: ratings.voice_naturality,
          accuracy: ratings.accuracy,
          response_speed: ratings.response_speed,
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
            {ratingType === 'thumbs_up' ? 'Share what you loved!' : 'Help us improve this agent'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Rate your experience <span className="text-destructive">*</span></h3>
            <div className="grid gap-4">
              <RatingStars
                value={ratings.voice_naturality}
                onChange={(value) => handleRatingChange('voice_naturality', value)}
                label="Voice naturality *"
              />
              <RatingStars
                value={ratings.accuracy}
                onChange={(value) => handleRatingChange('accuracy', value)}
                label="Accuracy/factuality *"
              />
              <RatingStars
                value={ratings.response_speed}
                onChange={(value) => handleRatingChange('response_speed', value)}
                label="Speed of responses *"
              />
            </div>
          </div>

          {/* Feedback Tags */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">
              {ratingType === 'thumbs_up' ? 'What worked well? (optional)' : 'What went wrong? (optional)'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(ratingType === 'thumbs_up' ? POSITIVE_FEEDBACK_TAGS : NEGATIVE_FEEDBACK_TAGS).map((tag) => (
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
              placeholder={ratingType === 'thumbs_up' ? 'Share more about what you enjoyed...' : 'Tell us more about your experience...'}
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