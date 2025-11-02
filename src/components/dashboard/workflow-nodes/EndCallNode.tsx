import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneOff } from 'lucide-react';

export const EndCallNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-red-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <PhoneOff className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'End Call'}
              </div>
              <Badge variant="secondary" className="text-xs">
                End Call
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
});

EndCallNode.displayName = 'EndCallNode';
