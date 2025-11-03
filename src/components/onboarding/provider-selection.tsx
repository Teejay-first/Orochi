import { Card } from "@/components/ui/card"
import { Check, Lock } from "lucide-react"
import type { Provider } from "@/components/onboarding-flow"

interface ProviderSelectionProps {
  provider: Provider
  setProvider: (provider: Provider) => void
}

export function ProviderSelection({ provider, setProvider }: ProviderSelectionProps) {
  const providers = [
    {
      id: "vapi" as const,
      name: "VAPI",
      description: "Industry-leading voice AI platform with advanced features",
      badge: "Popular",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      available: true,
    },
    {
      id: "11labs" as const,
      name: "11Labs",
      description: "High-quality voice synthesis and natural conversations",
      badge: "Coming Soon",
      badgeColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      available: false,
    },
    {
      id: "orochi" as const,
      name: "Custom Orochi Pipeline",
      description: "Build your own custom voice AI pipeline from scratch",
      badge: "Coming Soon",
      badgeColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      available: false,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-balance">Choose Your Provider</h2>
        <p className="text-muted-foreground text-balance">Select the voice AI platform that best fits your needs</p>
      </div>

      <div className="grid gap-4">
        {providers.map((p) => (
          <Card
            key={p.id}
            className={`border-2 p-6 transition-all ${
              !p.available
                ? "cursor-not-allowed border-border opacity-60"
                : `cursor-pointer hover:shadow-md ${
                    provider === p.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`
            }`}
            onClick={() => p.available && setProvider(p.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  
                  {!p.available && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground text-pretty">{p.description}</p>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  provider === p.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                }`}
              >
                {provider === p.id && <Check className="h-4 w-4" />}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
