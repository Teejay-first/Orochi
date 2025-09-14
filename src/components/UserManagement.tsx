import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, MessageSquare, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserStats {
  user_id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  conversations_count: number;
  total_minutes: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cached_tokens: number;
  total_turns: number;
  user_created_at: string;
}

interface UserConversation {
  id: string;
  agent_id: string;
  agent_name: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  turns: number;
  status: string;
  input_tokens: number;
  output_tokens: number;
}

interface ConversationTurn {
  id: string;
  turn_index: number;
  started_at: string;
  completed_at: string | null;
  user_text: string | null;
  assistant_text: string | null;
  input_tokens: number;
  output_tokens: number;
}

interface UserManagementProps {
  currentUserProfile: any;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUserProfile }) => {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [userConversations, setUserConversations] = useState<Record<string, UserConversation[]>>({});
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());
  const [conversationTurns, setConversationTurns] = useState<Record<string, ConversationTurn[]>>({});
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUserProfile?.is_super_admin;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_usage_stats')
        .select('*')
        .order('user_created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "Only super admins can change admin status",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.user_id === userId 
          ? { ...user, is_admin: !currentStatus }
          : user
      ));

      toast({
        title: "Success",
        description: `User admin status ${!currentStatus ? 'granted' : 'revoked'}`,
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const toggleUserExpansion = async (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    
    if (expandedUsers.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
      // Fetch user conversations if not already loaded
      if (!userConversations[userId]) {
        await fetchUserConversations(userId);
      }
    }
    
    setExpandedUsers(newExpanded);
  };

  const fetchUserConversations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select(`
          id,
          agent_id,
          started_at,
          ended_at,
          duration_ms,
          turns,
          status,
          input_tokens,
          output_tokens,
          agents(name)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const conversations = data?.map(conv => ({
        ...conv,
        agent_name: (conv.agents as any)?.name || 'Unknown Agent'
      })) || [];

      setUserConversations(prev => ({
        ...prev,
        [userId]: conversations
      }));
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user conversations",
        variant: "destructive",
      });
    }
  };

  const toggleConversationExpansion = async (conversationId: string) => {
    const newExpanded = new Set(expandedConversations);
    
    if (expandedConversations.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
      // Fetch conversation turns if not already loaded
      if (!conversationTurns[conversationId]) {
        await fetchConversationTurns(conversationId);
      }
    }
    
    setExpandedConversations(newExpanded);
  };

  const fetchConversationTurns = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('conversation_turns')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('turn_index', { ascending: true });

      if (error) throw error;

      setConversationTurns(prev => ({
        ...prev,
        [conversationId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching conversation turns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversation details",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading users...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Management ({users.length} users)
          {!isSuperAdmin && (
            <Badge variant="secondary" className="text-xs">
              View Only - Super Admin required for changes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <Collapsible key={user.user_id}>
              <div className="border rounded-lg">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserExpansion(user.user_id);
                        }}
                      >
                        {expandedUsers.has(user.user_id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">
                          {user.full_name || user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          {user.conversations_count} conversations
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(user.total_minutes)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {user.is_super_admin && (
                          <Badge variant="default">Super Admin</Badge>
                        )}
                        {user.is_admin && !user.is_super_admin && (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Admin</span>
                          <Switch
                            checked={user.is_admin}
                            disabled={!isSuperAdmin || user.is_super_admin}
                            onCheckedChange={() => toggleAdminStatus(user.user_id, user.is_admin)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  {expandedUsers.has(user.user_id) && (
                    <div className="border-t p-4 bg-muted/20">
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Usage Statistics</h4>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Total Turns</div>
                            <div className="font-medium">{user.total_turns}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Input Tokens</div>
                            <div className="font-medium">{user.total_input_tokens.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Output Tokens</div>
                            <div className="font-medium">{user.total_output_tokens.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Cached Tokens</div>
                            <div className="font-medium">{user.total_cached_tokens.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recent Conversations</h4>
                        {userConversations[user.user_id] ? (
                          <div className="space-y-2">
                            {userConversations[user.user_id].map((conversation) => (
                              <Collapsible key={conversation.id}>
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleConversationExpansion(conversation.id);
                                        }}
                                      >
                                        {expandedConversations.has(conversation.id) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <span className="font-medium text-sm">{conversation.agent_name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {conversation.status}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(conversation.started_at).toLocaleDateString()} • 
                                      {conversation.duration_ms ? formatDuration(conversation.duration_ms / 60000) : 'Ongoing'} • 
                                      {conversation.turns} turns
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  {expandedConversations.has(conversation.id) && (
                                    <div className="p-3 border-t bg-background/50">
                                      {conversationTurns[conversation.id] ? (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                          {conversationTurns[conversation.id].map((turn) => (
                                            <div key={turn.id} className="border rounded p-2 text-sm">
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">Turn {turn.turn_index + 1}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  {turn.completed_at ? new Date(turn.completed_at).toLocaleTimeString() : 'In progress'}
                                                </span>
                                              </div>
                                              {turn.user_text && (
                                                <div className="mb-1">
                                                  <span className="text-xs font-medium text-blue-600">User: </span>
                                                  <span className="text-xs">{turn.user_text}</span>
                                                </div>
                                              )}
                                              {turn.assistant_text && (
                                                <div>
                                                  <span className="text-xs font-medium text-green-600">Assistant: </span>
                                                  <span className="text-xs">{turn.assistant_text}</span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center text-xs text-muted-foreground py-2">
                                          Loading conversation details...
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-sm text-muted-foreground py-2">
                            Loading conversations...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};