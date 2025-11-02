import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Variable } from 'lucide-react';

export const ExtractVariablesNode = memo(({ data }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 border-2 border-yellow-500/50 shadow-lg">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
              <Variable className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {data.name || 'Extract Variables'}
              </div>
              <Badge variant="secondary" className="text-xs">
                Extract
              </Badge>
            </div>
          </div>
          {data.extractVariables && data.extractVariables.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {data.extractVariables.length} variable{data.extractVariables.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
});

ExtractVariablesNode.displayName = 'ExtractVariablesNode';
