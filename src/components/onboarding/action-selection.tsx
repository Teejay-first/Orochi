import { Card } from "@/components/ui/card"
import { Check, Download, Plus } from "lucide-react"
import type { Provider, Action } from "@/components/onboarding-flow"

interface ActionSelectionProps {
  provider: Provider
  action: Action
  setAction: (action: Action) => void
}

export function ActionSelection({ provider, action, setAction }: ActionSelectionProps) {
  const getProviderName = () => {
    if (provider === "vapi") return "VAPI"
    if (provider === "11labs") return "11Labs"
    return "Orochi Pipeline"
  }

  const actions = [
    {
      id: "import" as const,
      name: "Import Existing Assistant",
      description:
        provider === "vapi"
          ? "Import your existing assistants from VAPI"
          : `Import configuration for ${getProviderName()}`,
      icon: Download,
      available: true,
    },
    {
      id: "create" as const,
      name: "Create New Assistant",
      description: `Build a custom assistant for ${getProviderName()}`,
      icon: Plus,
      available: provider !== "orochi",
      comingSoon: provider === "orochi",
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-balance">What would you like to do?</h2>
        <p className="text-muted-foreground text-balance">
          Choose whether to import existing assistants or create a new one
        </p>
      </div>

      <div className="grid gap-4">
        {actions.map((a) => (
          <Card
            key={a.id}
            className={`border-2 p-6 transition-all ${
              a.available && !a.comingSoon ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed opacity-60"
            } ${action === a.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"}`}
            onClick={() => {
              if (a.available && !a.comingSoon) {
                setAction(a.id)
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-1 items-start gap-4">
                <div
                  className={`rounded-lg p-3 ${action === a.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <a.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{a.name}</h3>
                    {a.comingSoon && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-pretty">{a.description}</p>
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  action === a.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                }`}
              >
                {action === a.id && <Check className="h-4 w-4" />}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
