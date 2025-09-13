import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, FileText, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ConversationRecord {
  id: string;
  user_id: string;
  agent_id: string;
  status: 'active' | 'completed' | 'ended';
  started_at: string;
  ended_at: string | null;
  transcript: any;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  agents: {
    name: string;
    avatar_url: string;
  } | null;
}

export const ConversationsRegistry: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const filtered = conversations.filter(conv => 
      conv.agents?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.profiles?.full_name && conv.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredConversations(filtered);
  }, [conversations, searchQuery]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          ),
          agents (
            name,
            avatar_url
          )
        `)
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      const typedConversations = (data || []).map(conv => ({
        ...conv,
        status: conv.status as 'active' | 'completed' | 'ended',
        transcript: Array.isArray(conv.transcript) ? conv.transcript : [],
        profiles: conv.profiles || null,
        agents: conv.agents || null
      }));
      
      setConversations(typedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'default',
      ended: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status === 'completed' && '✓ '}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Conversations
            <Badge variant="outline">{conversations.length}</Badge>
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conversation Transcript</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No conversations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredConversations.map((conversation) => (
                  <TableRow key={conversation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={conversation.agents?.avatar_url} />
                          <AvatarFallback>
                            {conversation.agents?.name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{conversation.agents?.name || 'Unknown Agent'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={conversation.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(conversation.profiles?.full_name || conversation.profiles?.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {conversation.profiles?.full_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {conversation.profiles?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(conversation.started_at), 'dd.MM.yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(conversation.status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          // TODO: Implement transcript viewing
                          toast({
                            title: "Coming Soon",
                            description: "Transcript viewing will be available soon",
                          });
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(conversation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};