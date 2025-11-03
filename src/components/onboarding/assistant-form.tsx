import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useProvider } from "@/contexts/ProviderContext"
import { toast } from "@/hooks/use-toast"
import type { Provider, Action } from "@/components/onboarding-flow"

interface AssistantFormProps {
  provider: Provider
  action: Action
  onComplete?: () => void
}

export function AssistantForm({ provider, action, onComplete }: AssistantFormProps) {
  const navigate = useNavigate()
  const { addConnection } = useProvider()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    apiKey: "",
    assistantId: "",
    voiceId: "",
    systemPrompt: "",
    label: "",
  })

  const getProviderName = () => {
    if (provider === "vapi") return "VAPI"
    if (provider === "11labs") return "11Labs"
    return "Orochi Pipeline"
  }

  const handleSubmit = async () => {
    if (!formData.apiKey.trim()) {
      setError("Please enter your API key")
      return
    }

    if (action === "import" && !formData.assistantId.trim()) {
      setError("Please enter the assistant ID to import")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Map provider types
      const providerKey = provider === "vapi" ? "vapi" : provider === "11labs" ? "elevenlabs" : "orochi"
      
      await addConnection(providerKey, formData.apiKey.trim(), formData.label.trim() || "Production")

      toast({
        title: "Connected!",
        description: `Successfully connected to ${getProviderName()}`,
      })

      // Redirect based on action
      if (action === "import") {
        navigate("/dashboard?view=assistants&action=import")
      } else {
        navigate("/dashboard?view=assistants&action=create")
      }

      onComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect")
    } finally {
      setLoading(false)
    }
  }

  if (action === "import") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-balance">Import Assistant</h2>
          <p className="text-muted-foreground text-balance">
            Connect your {getProviderName()} account to import existing assistants
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-2 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="mb-1 font-semibold">API Key Required</h4>
                <p className="text-sm text-muted-foreground text-pretty">
                  You'll need your {getProviderName()} API key to import assistants
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="label">Connection Label (Optional)</Label>
            <Input
              id="label"
              placeholder="Production"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Give this connection a name to identify it later</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key <span className="text-destructive">*</span></Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${getProviderName()} API key`}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Your API key is stored securely and never shared</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistantId">Assistant ID</Label>
            <Input
              id="assistantId"
              placeholder="Enter the assistant ID to import"
              value={formData.assistantId}
              onChange={(e) => setFormData({ ...formData, assistantId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Find this in your {getProviderName()} dashboard</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Where to find your API key:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://dashboard.vapi.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  dashboard.vapi.ai
                </a>
              </li>
              <li>Navigate to Settings → API Keys</li>
              <li>Copy your organization API key</li>
            </ol>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !formData.apiKey.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Connect & Continue"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            We'll validate your API key and {action === "import" ? "fetch your assistants" : "set up a new assistant"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-balance">Create New Assistant</h2>
        <p className="text-muted-foreground text-balance">Configure your new {getProviderName()} voice assistant</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Assistant Name</Label>
          <Input
            id="name"
            placeholder="e.g., Customer Support Agent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what your assistant does..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Connection Label (Optional)</Label>
          <Input
            id="label"
            placeholder="Production"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Give this connection a name to identify it later</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key <span className="text-destructive">*</span></Label>
          <Input
            id="apiKey"
            type="password"
            placeholder={`Enter your ${getProviderName()} API key`}
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Your API key is stored securely and never shared</p>
        </div>

        {provider === "11labs" && (
          <div className="space-y-2">
            <Label htmlFor="voiceId">Voice ID</Label>
            <Input
              id="voiceId"
              placeholder="Enter the 11Labs voice ID"
              value={formData.voiceId}
              onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Choose from your 11Labs voice library</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            placeholder="Define how your assistant should behave..."
            rows={4}
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">This guides your assistant's personality and responses</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={loading || !formData.apiKey.trim() || !formData.name.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Assistant"
          )}
        </Button>
      </div>
    </div>
  )
}
