import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleTalk = () => {
    console.log('Talk clicked for agent:', agent.id, 'authenticated:', isAuthenticated);
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/agent/${agent.id}`);
      return;
    }
    navigate(`/agent/${agent.id}`);
  };

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-gradient-card hover:border-primary/30 transition-smooth shadow-card hover:shadow-glow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-smooth"
            />
            <div className="absolute -bottom-1 -right-1 voice-indicator" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary transition-smooth">
              {agent.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {agent.tagline}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {agent.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {agent.language}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleTalk}
          className="w-full group-hover:shadow-accent transition-spring"
          size="sm"
        >
          <Mic className="w-4 h-4 mr-2" />
          Talk
        </Button>
      </CardContent>
    </Card>
  );
};