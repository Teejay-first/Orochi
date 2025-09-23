import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Agent, STATUS_TYPES, PRICE_TYPES } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mic, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/StarRating';
import { PopularityScore } from '@/components/PopularityScore';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isSuperAdmin, isAdmin } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  
  const isMasterAgent = agent.id === 'master-agent-aristocratic';
  const hasAdminAccess = isAdmin || isSuperAdmin;

  const handleTalk = () => {
    console.log('Talk clicked for agent:', agent.id, 'authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/agent/${agent.id}`);
      return;
    }
    
    // Check if trying to access master agent without admin privileges
    if (isMasterAgent && !hasAdminAccess) {
      setShowAccessDenied(true);
      return;
    }
    
    navigate(`/agent/${agent.id}`);
  };

  return (
    <>
      <Card className={`group relative overflow-hidden border-border/40 bg-gradient-card hover:border-primary/30 transition-smooth shadow-card hover:shadow-glow ${
        isMasterAgent ? 'ring-2 ring-amber-500/50 shadow-amber-500/20' : ''
      }`}>
        {isMasterAgent && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 shadow-md">
              <Crown className="w-3 h-3 mr-1" />
              Master Agent
            </Badge>
          </div>
        )}
        <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex flex-col">
            <div className="relative flex-shrink-0 mb-2">
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/50 transition-smooth"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-deployed rounded-full border-2 border-card animate-pulse" />
            </div>
            
            {/* Star rating positioned below avatar */}
            {agent.average_rating !== undefined && (
              <div className="mt-3 mb-2">
                <StarRating rating={agent.average_rating} count={agent.total_ratings} />
              </div>
            )}
            
            {/* Combined popularity score and price in outlined row */}
            <div className="mt-2">
              <PopularityScore 
                score={agent.rating || 0} 
                price={agent.agent_price}
              />
            </div>
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
            
            <div className="flex items-center gap-1 flex-wrap mb-2">
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
            </div>
            
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
        
        <Button 
          onClick={handleTalk}
          className={`w-full group-hover:shadow-accent transition-spring mt-4 ${
            isMasterAgent ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white border-0' : ''
          }`}
          size="sm"
        >
          {isMasterAgent ? <Crown className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
          {isMasterAgent ? 'Access Master' : 'Talk'}
        </Button>
      </CardContent>
    </Card>

    {/* Access Denied Dialog */}
    <Dialog open={showAccessDenied} onOpenChange={setShowAccessDenied}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Voxie Access Denied
          </DialogTitle>
          <DialogDescription>
            Voxie is the Master Agent with advanced capabilities. Access is restricted to Administrators only.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Voxie represents the pinnacle of AI conversation technology with sophisticated reasoning capabilities and advanced prompt engineering.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAccessDenied(false)} 
            className="w-full"
          >
            Return to Directory
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};