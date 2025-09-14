import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent, STATUS_TYPES } from '@/types/agent';
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
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-smooth"
            />
            <div className="absolute -bottom-1 -right-1 voice-indicator" />
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2 truncate group-hover:text-primary transition-smooth">
                {agent.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2 h-10 leading-5">
                {agent.tagline}
              </p>
            </div>
            
            <div className="flex items-center gap-1 flex-wrap h-12 overflow-hidden">
              <Badge 
                className={`text-xs font-medium ${
                  agent.status_type === 'deployed' ? 'bg-status-deployed text-status-deployed-foreground' :
                  agent.status_type === 'testing' ? 'bg-status-testing text-status-testing-foreground' :
                  agent.status_type === 'building' ? 'bg-status-building text-status-building-foreground' :
                  'bg-status-repairing text-status-repairing-foreground'
                }`}
              >
                {STATUS_TYPES.find(s => s.value === agent.status_type)?.label || agent.status_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {agent.language[0]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {agent.category}
              </Badge>
              {agent.language.length > 1 && (
                <div className="flex gap-1 flex-wrap">
                  {agent.language.slice(1).map((lang, index) => (
                    <Badge key={index} variant="outline" className="text-xs opacity-70">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleTalk}
          className="w-full group-hover:shadow-accent transition-spring mt-4"
          size="sm"
        >
          <Mic className="w-4 h-4 mr-2" />
          Talk
        </Button>
      </CardContent>
    </Card>
  );
};