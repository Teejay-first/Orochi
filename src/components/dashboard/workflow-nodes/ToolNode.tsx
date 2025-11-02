import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

export const ToolNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-orange-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Tool'}
              </div>
              <Badge variant="secondary" className="text-xs">
                Tool
              </Badge>
            </div>
          </div>
          {data.toolId && (
            <div className="text-xs text-muted-foreground font-mono line-clamp-1 mt-2">
              ID: {data.toolId}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

ToolNode.displayName = 'ToolNode';
