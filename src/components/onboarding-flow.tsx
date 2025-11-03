import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProviderSelection } from "@/components/onboarding/provider-selection"
import { ActionSelection } from "@/components/onboarding/action-selection"
import { AssistantForm } from "@/components/onboarding/assistant-form"

export type Provider = "vapi" | "11labs" | "orochi" | null
export type Action = "import" | "create" | null

export function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState<Provider>(null)
  const [action, setAction] = useState<Action>(null)

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    if (step === 1) return provider !== null
    if (step === 2) return action !== null
    return false
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-balance">
            Welcome to <span className="text-primary">VoxHive</span>
          </h1>
          <p className="text-muted-foreground text-balance">Set up your Voice AI agent in just a few steps</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  i === step
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : i < step
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                <span className="text-sm font-semibold">{i}</span>
              </div>
              {i < 3 && <div className={`h-0.5 w-16 transition-all ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden border-2 shadow-xl">
          <div className="min-h-[500px] p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProviderSelection provider={provider} setProvider={setProvider} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActionSelection provider={provider} action={action} setAction={setAction} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AssistantForm provider={provider} action={action} onComplete={() => setStep(1)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t bg-muted/30 px-8 py-4">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">Step {step} of 3</div>

            {step < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
