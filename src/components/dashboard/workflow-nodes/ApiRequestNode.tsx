import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

export const ApiRequestNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-blue-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'API Request'}
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.apiRequest?.method || 'GET'}
              </Badge>
            </div>
          </div>
          {data.apiRequest?.url && (
            <div className="text-xs text-muted-foreground font-mono line-clamp-1 mt-2">
              {data.apiRequest.url}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

ApiRequestNode.displayName = 'ApiRequestNode';
