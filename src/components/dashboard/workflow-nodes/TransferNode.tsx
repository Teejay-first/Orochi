import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneForwarded } from 'lucide-react';

export const TransferNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-green-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <PhoneForwarded className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Transfer'}
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.transfer?.transferPlan?.mode || 'Transfer'}
              </Badge>
            </div>
          </div>
          {data.transfer?.destination && (
            <div className="text-xs text-muted-foreground font-mono line-clamp-1 mt-2">
              → {data.transfer.destination}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

TransferNode.displayName = 'TransferNode';
