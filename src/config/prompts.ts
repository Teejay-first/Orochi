// OpenAI Playground Default Prompt Configuration
// Set your default prompt ID from OpenAI Playground here
// When set, this will override individual agent prompt_ids to always use the latest \"default\" prompt

export const PROMPT_CONFIG = {
  // Uncomment and set your default prompt ID from OpenAI Playground
  // This will be used for ALL agents, ensuring they always get the latest version
  // DEFAULT_PROMPT_ID: 'pmpt_your_default_prompt_id_here',
  DEFAULT_PROMPT_ID: null as string | null,
  
  // Optional: Set default variables that will be passed to the prompt
  DEFAULT_VARIABLES: {
    // user_goal: 'have a helpful conversation',
    // company_name: 'VoiceTube'
  } as Record<string, any>
};

// Helper function to get the prompt configuration
export const getPromptConfig = (agent?: any) => {
  // If a default prompt ID is configured, use it (always gets latest version)
  if (PROMPT_CONFIG.DEFAULT_PROMPT_ID) {
    return {
      id: PROMPT_CONFIG.DEFAULT_PROMPT_ID,
      // Never specify version - this ensures OpenAI always uses latest published version
      variables: {
        ...PROMPT_CONFIG.DEFAULT_VARIABLES,
        ...(agent?.prompt_variables || {})
      }
    };
  }
  
  // Otherwise, use agent's specific prompt_id (if available)
  if (agent?.prompt_source === 'prompt_id' && agent.prompt_id) {
    return {
      id: agent.prompt_id,
      // Never specify version - this ensures OpenAI always uses latest published version
      variables: agent.prompt_variables || {}
    };
  }
  
  return null;
};
