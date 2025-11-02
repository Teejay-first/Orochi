import { useState } from "react";
import { WorkflowDirectory } from "./WorkflowDirectory";
import { WorkflowCanvas } from "./WorkflowCanvas";

export function WorkflowManager() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);

  if (selectedWorkflowId) {
    return (
      <WorkflowCanvas
        workflowId={selectedWorkflowId}
        onBack={() => setSelectedWorkflowId(null)}
      />
    );
  }

  return <WorkflowDirectory onSelectWorkflow={setSelectedWorkflowId} />;
}
