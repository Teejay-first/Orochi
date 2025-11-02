import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export const GlobalNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-amber-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Global Node'}
              </div>
              <Badge variant="secondary" className="text-xs">
                Global
              </Badge>
            </div>
          </div>
          {data.enterCondition && (
            <div className="text-xs text-muted-foreground line-clamp-2 mt-2">
              {data.enterCondition}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

GlobalNode.displayName = 'GlobalNode';
