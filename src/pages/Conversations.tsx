import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Clock, Hash, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ConversationSession {
  id: string;
  agent_id: string;
  started_at: string;
  ended_at?: string;
  duration_ms?: number;
  status: string;
  turns: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cached_input_tokens: number;
  agents?: {
    name: string;
    avatar_url: string;
  };
}

interface ConversationTurn {
  turn_index: number;
  user_text: string;
  assistant_text: string;
  input_tokens: number;
  output_tokens: number;
  cached_input_tokens: number;
  started_at: string;
}

export const Conversations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select(`
          *,
          agents (
            name,
            avatar_url
          )
        `)
        .eq('user_id', user?.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched conversations:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurns = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('turn_index');

      if (error) throw error;
      setTurns(data || []);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error fetching turns:', error);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    // Handle extremely large duration values (likely calculation errors)
    if (ms > 86400000) return 'Invalid duration'; // More than 24 hours
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedConversation(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Conversations
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {turns.map((turn, index) => (
                <div key={index} className="border-l-4 border-primary/20 pl-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    Turn {turn.turn_index + 1}
                    <Badge variant="outline" className="text-xs">
                      {turn.input_tokens + turn.output_tokens} tokens
                    </Badge>
                    {turn.cached_input_tokens > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {turn.cached_input_tokens} cached
                      </Badge>
                    )}
                  </div>
                  
                  {turn.user_text && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">You:</div>
                      <div className="text-sm">{turn.user_text}</div>
                    </div>
                  )}
                  
                  {turn.assistant_text && (
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Assistant:</div>
                      <div className="text-sm">{turn.assistant_text}</div>
                    </div>
                  )}
                </div>
              ))}
              
              {turns.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No turns recorded for this conversation.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
          <h1 className="text-2xl font-bold">My Conversations</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first conversation with an AI agent to see it here.
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Agents
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Turns</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conversation) => (
                    <TableRow key={conversation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {conversation.agents?.avatar_url ? (
                            <img
                              src={conversation.agents.avatar_url}
                              alt={conversation.agents.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">
                            {conversation.agents?.name || 'Unknown Agent'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(conversation.started_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(conversation.duration_ms)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conversation.status === 'completed' ? 'default' : 'secondary'}>
                          {conversation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          {conversation.turns}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          {conversation.total_tokens?.toLocaleString() || 0}
                          {conversation.cached_input_tokens > 0 && (
                            <Badge variant="outline" className="text-xs ml-1">
                              +{conversation.cached_input_tokens} cached
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchTurns(conversation.id)}
                        >
                          View Transcript
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};