import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch } from 'lucide-react';

export const ConditionNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-indigo-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Condition'}
              </div>
              <Badge variant="secondary" className="text-xs">
                Condition
              </Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Branch based on logic
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
    </>
  );
});

ConditionNode.displayName = 'ConditionNode';
