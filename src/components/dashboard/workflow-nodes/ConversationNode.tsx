import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

export const ConversationNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-purple-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Conversation'}
              </div>
              <Badge variant="secondary" className="text-xs">
                Conversation
              </Badge>
            </div>
          </div>
          {data.messages && data.messages.length > 0 && (
            <div className="text-xs text-muted-foreground line-clamp-2 mt-2">
              {data.messages[0].content}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

ConversationNode.displayName = 'ConversationNode';
