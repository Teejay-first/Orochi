import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const UserDisplay: React.FC = () => {
  const { user, session, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if user signed in with Google (has email) or invite code (anonymous)
  const isGoogleUser = !!user.email;
  const isInviteUser = !user.email && user.user_metadata?.auth_method === 'invite_code';
  
  const displayName = isGoogleUser 
    ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
    : `Invite: ${user.user_metadata?.invite_code || 'User'}`;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center gap-3">
      {/* Conversations button - more visible */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigate('/conversations')} 
        className="flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">My Conversations</span>
      </Button>
      
      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={user.user_metadata?.avatar_url} 
                alt={displayName}
              />
              <AvatarFallback>
                {isGoogleUser 
                  ? (user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U')
                  : 'I'
                }
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm">{displayName}</p>
              {isGoogleUser && user.email && (
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
              {isInviteUser && (
                <p className="text-xs text-muted-foreground">
                  Anonymous User
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/conversations')} className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            My Conversations
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};