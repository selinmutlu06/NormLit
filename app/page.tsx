"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GuideReferencePanel } from "@/components/guide-reference-panel"
import { 
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Info,
  Clock,
  Users,
  Zap,
  Droplets,
  Settings,
  Trash2,
  ClipboardCheck,
  Ruler,
  MapPin,
  Sparkles,
  Plug,
  Lock,
  Target,
  Box,
  Rows3,
  Syringe,
  Gauge,
  Undo2,
  ShowerHead,
  Shield,
  Archive,
  Calculator,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { ElectrodeMap } from "@/components/electrode-map"
import { ElectrodePositionCalculator } from "@/components/electrode-position-calculator"
import { EogDiagram } from "@/components/eog-diagram"
import { ArtifactTrainer } from "@/components/artifact-trainer"
import { LandmarksDiagram } from "@/components/landmarks-diagram"

const sections = [
  { id: "overview", title: "Overview", icon: Info },
  { id: "preparation", title: "Preparation", icon: Users },
  { id: "positions", title: "Position Finder", icon: Calculator },
  { id: "setup", title: "Cap Setup", icon: Settings },
  { id: "gel", title: "Gel Application", icon: Droplets },
  { id: "recording", title: "Recording", icon: Zap },
  { id: "cleanup", title: "Cleanup", icon: Trash2 },
]

const equipmentList = [
  { name: "EEG amplifier and acquisition software", required: true },
  { name: "EEG Cap (appropriate size)", required: true },
  { name: "Electrodes (64 or 128 channel)", required: true },
  { name: "SignaGel or similar conductive gel", required: true },
  { name: "Blunt-tip syringes (10-20ml)", required: true },
  { name: "Measuring tape (for head circumference)", required: true },
  { name: "Alcohol prep pads", required: true },
  { name: "Cotton swabs", required: true },
  { name: "Towels and tissues", required: true },
  { name: "Reference/ground electrodes", required: true },
  { name: "External EOG electrodes (4 for VEOG + HEOG)", required: true },
  { name: "Adhesive electrode collars/stickers", required: true },
  { name: "Chin strap (optional)", required: false },
  { name: "Electrode gel applicator sticks", required: false },
]

const capSizes = [
  { size: "Extra Small", circumference: "< 52 cm", typical: "Young children" },
  { size: "Small", circumference: "52-54 cm", typical: "Children, small adults" },
  { size: "Medium", circumference: "54-58 cm", typical: "Most adults" },
  { size: "Large", circumference: "58-62 cm", typical: "Large adults" },
]

const troubleshooting = [
  { 
    problem: "High impedance on specific electrode", 
    solution: "Add more gel, gently abrade scalp with cotton swab, ensure electrode is making contact with scalp"
  },
  { 
    problem: "Widespread high impedances", 
    solution: "Check reference electrodes, ensure cap is properly positioned, verify cable connections"
  },
  { 
    problem: "60Hz noise in signal", 
    solution: "Check grounding, move cables away from power sources, ensure participant is not touching metal"
  },
  { 
    problem: "Drifting baseline", 
    solution: "Allow system to stabilize, check for loose connections, ensure gel hasn't dried out"
  },
  { 
    problem: "Muscle artifact", 
    solution: "Ask participant to relax jaw and forehead, check electrode placement near muscles"
  },
]

/** Every checkable step, in guide order. Progress is derived from this — never hardcode a count. */
const stepIds = [
  "prep-1", "prep-2", "prep-3", "prep-4",
  "setup-1", "setup-2", "setup-3", "setup-4", "setup-5",
  "gel-1", "gel-2", "gel-3", "gel-4",
  "clean-1", "clean-2", "clean-3", "clean-4", "clean-5",
]

const STEPS_STORAGE_KEY = "normlit:eeg-guide:completed-steps"
const EQUIPMENT_STORAGE_KEY = "normlit:eeg-guide:checked-equipment"

const equipmentNames = equipmentList.map(e => e.name)

/** Read a persisted string array from localStorage, keeping only allowed values. */
function loadStringSet(key: string, allowed: string[]): string[] {
  try {
    const saved = window.localStorage.getItem(key)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s): s is string => allowed.includes(s as string))
  } catch {
    return []
  }
}

/** Persist a string array, silently tolerating unavailable/full storage. */
function saveStringSet(key: string, values: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // In-memory state still works for this session if storage is blocked.
  }
}

export default function EEGGuidePage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [checkedEquipment, setCheckedEquipment] = useState<string[]>([])

  // Restore after mount so server and first client render agree.
  useEffect(() => {
    setCompletedSteps(loadStringSet(STEPS_STORAGE_KEY, stepIds))
    setCheckedEquipment(loadStringSet(EQUIPMENT_STORAGE_KEY, equipmentNames))
  }, [])

  const toggleStep = (step: string) => {
    setCompletedSteps(prev => {
      const next = prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
      saveStringSet(STEPS_STORAGE_KEY, next)
      return next
    })
  }

  const toggleEquipment = (name: string) => {
    setCheckedEquipment(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
      saveStringSet(EQUIPMENT_STORAGE_KEY, next)
      return next
    })
  }

  const resetProgress = () => {
    setCompletedSteps([])
    saveStringSet(STEPS_STORAGE_KEY, [])
  }

  const progress = (completedSteps.length / stepIds.length) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <BookOpen className="size-5 text-muted-foreground" />
            <span className="font-sans text-lg font-semibold tracking-tight">NormLit</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <Clock className="size-4" />
              <span>30-45 min setup</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {completedSteps.length} of {stepIds.length} steps completed
                    </p>
                    {completedSteps.length > 0 && (
                      <button
                        onClick={resetProgress}
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <section.icon className="size-4" />
                    {section.title}
                  </button>
                ))}
              </nav>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Safety First</p>
                      <p className="text-xs text-muted-foreground">
                        Always follow your lab&apos;s IRB-approved protocols and safety guidelines.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Hero Section */}
            <div className="border-b pb-8">
              <h1 className="font-sans text-3xl font-bold tracking-tight md:text-4xl">
                EEG Study Guide
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                A step-by-step protocol for running a gel-based EEG session, from participant
                preparation through post-session cleanup. Written for 64/128-channel research
                systems.
              </p>
              <div className="flex flex-wrap gap-3 pt-5">
                <Badge variant="outline" className="gap-1">
                  <Clock className="size-3" />
                  30-45 min setup
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Users className="size-3" />
                  2 researchers recommended
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Zap className="size-3" />
                  64/128 channel
                </Badge>
              </div>
            </div>

            {/* Section nav — the only section switcher on small screens */}
            <nav className="flex flex-wrap gap-2 lg:hidden" aria-label="Guide sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={activeSection === section.id ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    activeSection === section.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <section.icon className="size-4" />
                  {section.title}
                </button>
              ))}
            </nav>

            {/* Tabbed Content */}
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              <TabsList className="hidden">
                {sections.map(s => <TabsTrigger key={s.id} value={s.id}>{s.title}</TabsTrigger>)}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="font-sans text-2xl">Equipment Checklist</CardTitle>
                        <CardDescription>
                          Tap each item to check it off as you gather materials
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {checkedEquipment.length}/{equipmentList.length} gathered
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {equipmentList.map((item, i) => {
                        const checked = checkedEquipment.includes(item.name)
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleEquipment(item.name)}
                            aria-pressed={checked}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                              item.required ? "border-border" : "border-dashed border-muted"
                            } ${checked ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/50"}`}
                          >
                            {checked ? (
                              <CheckCircle2 className="size-5 shrink-0 text-primary" />
                            ) : (
                              <Circle className={`size-5 shrink-0 ${item.required ? "text-muted-foreground" : "text-muted-foreground/60"}`} />
                            )}
                            <span
                              className={`${item.required ? "" : "text-muted-foreground"} ${
                                checked ? "line-through decoration-primary/40" : ""
                              }`}
                            >
                              {item.name}
                            </span>
                            {!item.required && (
                              <Badge variant="outline" className="ml-auto shrink-0 text-xs">Optional</Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Cap Size Guide</CardTitle>
                    <CardDescription>
                      Measure head circumference at the widest point (above eyebrows, around occipital protuberance)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="py-3 px-4 text-left font-medium">Size</th>
                            <th className="py-3 px-4 text-left font-medium">Circumference</th>
                            <th className="py-3 px-4 text-left font-medium">Typical Use</th>
                          </tr>
                        </thead>
                        <tbody>
                          {capSizes.map((size, i) => (
                            <tr key={i} className="border-b border-border/50">
                              <td className="py-3 px-4 font-mono">{size.size}</td>
                              <td className="py-3 px-4">{size.circumference}</td>
                              <td className="py-3 px-4 text-muted-foreground">{size.typical}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-5" />
                        Important Precautions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p>Screen for contraindications before each session:</p>
                      <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        <li>History of epilepsy or seizures</li>
                        <li>Open wounds or skin conditions on scalp</li>
                        <li>Recent head injury</li>
                        <li>Metal implants in head/neck area</li>
                        <li>Allergies to electrode gel or adhesives</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Info className="size-5" />
                        Best Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        <li>Ask participant to avoid hair products on study day</li>
                        <li>Have participant arrive with dry hair</li>
                        <li>Schedule adequate time for setup (45+ min)</li>
                        <li>Prepare all equipment before participant arrives</li>
                        <li>Keep room at comfortable temperature</li>
                        <li>Minimize electronic interference sources</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Preparation Tab */}
              <TabsContent value="preparation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Participant Preparation</CardTitle>
                    <CardDescription>
                      Steps to prepare the participant for EEG recording
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
                      <p className="text-sm font-medium">Reference: cranial landmarks</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The nasion, inion, and the two preauricular points anchor the cap. The
                        dashed lines are the nasion-inion and ear-to-ear measurement lines; they
                        cross at the vertex (Cz).
                      </p>
                      <div className="mt-4 flex justify-center">
                        <LandmarksDiagram />
                      </div>
                    </div>

                    <StepCard
                      step={1}
                      title="Informed Consent"
                      description="Review and obtain signed informed consent. Explain the procedure, duration, and what to expect."
                      tips={["Use clear, non-technical language", "Allow time for questions", "Provide a copy of signed consent"]}
                      completed={completedSteps.includes("prep-1")}
                      onToggle={() => toggleStep("prep-1")}
                      icon={ClipboardCheck}
                    />
                    
                    <StepCard
                      step={2}
                      title="Measure Head Circumference"
                      description="Using a flexible measuring tape, measure around the head at the widest point - just above the eyebrows and around the occipital protuberance."
                      tips={["Measure twice for accuracy", "Round up if between sizes", "Record measurement in participant file"]}
                      completed={completedSteps.includes("prep-2")}
                      onToggle={() => toggleStep("prep-2")}
                      icon={Ruler}
                    />

                    <StepCard
                      step={3}
                      title="Identify Anatomical Landmarks"
                      description="Locate the nasion (bridge of nose), inion (bump at back of head), and preauricular points (in front of ears) for proper cap placement."
                      tips={["Use a skin-safe marker if needed", "These landmarks ensure consistent placement", "Cz should be exactly between nasion-inion and preauricular points"]}
                      completed={completedSteps.includes("prep-3")}
                      onToggle={() => toggleStep("prep-3")}
                      icon={MapPin}
                    />

                    <StepCard
                      step={4}
                      title="Prepare the Scalp"
                      description="Have the participant sit comfortably. Part hair to expose scalp where reference electrodes will be placed. Gently clean skin with alcohol prep pad."
                      tips={["Be gentle - avoid irritating the skin", "Let alcohol dry completely before gel application", "Also clean the mastoids and the EOG sites around the eyes for external electrodes"]}
                      completed={completedSteps.includes("prep-4")}
                      onToggle={() => toggleStep("prep-4")}
                      icon={Sparkles}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Position Finder Tab */}
              <TabsContent value="positions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">10-20 Position Finder</CardTitle>
                    <CardDescription>
                      Turn the standard 10-20 percentages into exact centimeter marks for this
                      participant&apos;s head. Measure three lines, and mark each electrode where
                      the table says.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ElectrodePositionCalculator />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cap Setup Tab */}
              <TabsContent value="setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">EEG Cap Setup</CardTitle>
                    <CardDescription>
                      Proper cap placement is critical for accurate recordings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-6">
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        10-20 system. Click an electrode for placement notes, and align <span className="font-mono font-medium text-foreground">Cz</span> at the vertex.
                      </p>
                      <ElectrodeMap variant="guide" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        Need exact centimeter marks for this participant&apos;s head?
                      </p>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveSection("positions")}>
                        <Calculator className="size-4" />
                        Open the Position Finder
                      </Button>
                    </div>

                    <GuideReferencePanel
                      title="Reference: EEG recording cap"
                      description="Electrodes sit in holders on the cap; hair is parted and gel applied at each site."
                      mediaKey="eegRecordingCap"
                    />

                    <StepCard
                      step={1}
                      title="Select Correct Cap Size"
                      description="Based on head circumference measurement, select the appropriate cap size. The cap should fit snugly but not cause discomfort."
                      tips={["If between sizes, try smaller first", "Cap should not slide when participant moves head", "Ensure all electrode holes align with scalp"]}
                      completed={completedSteps.includes("setup-1")}
                      onToggle={() => toggleStep("setup-1")}
                      icon={Box}
                    />

                    <StepCard
                      step={2}
                      title="Position the Cap"
                      description="Place the cap on the participant's head. Align Cz (vertex) with the midpoint between nasion-inion and between preauricular points. Fpz should be 10% of nasion-inion distance above nasion."
                      tips={["Have participant hold front of cap while you adjust back", "Check symmetry by comparing left and right electrode positions", "Cz should be at the very top of the head"]}
                      completed={completedSteps.includes("setup-2")}
                      onToggle={() => toggleStep("setup-2")}
                      icon={Target}
                    />

                    <StepCard
                      step={3}
                      title="Secure the Cap"
                      description="Fasten the chin strap (if using) and adjust any straps to ensure the cap is secure. The cap should not shift during head movements."
                      tips={["Chin strap should be snug but comfortable", "Check that no electrodes are lifted off the scalp", "Ask participant if they feel any pressure points"]}
                      completed={completedSteps.includes("setup-3")}
                      onToggle={() => toggleStep("setup-3")}
                      icon={Lock}
                    />

                    <StepCard
                      step={4}
                      title="Connect to Amplifier"
                      description="Connect the electrode cables to the amplifier. Ensure the ribbon cable is properly seated and locked, then power on the amplifier."
                      tips={["Check that status LED indicates proper connection", "Route cables to minimize movement artifacts", "Ensure battery is fully charged before session"]}
                      completed={completedSteps.includes("setup-4")}
                      onToggle={() => toggleStep("setup-4")}
                      icon={Plug}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">External Eye Electrodes (EOG)</CardTitle>
                    <CardDescription>
                      Bipolar electrodes on the face record eye movements so blinks and saccades
                      can be identified and removed from the EEG. Place them after the cap is on,
                      before checking signal quality.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_1.1fr]">
                      <div className="flex justify-center rounded-xl border border-border bg-muted/20 p-4">
                        <EogDiagram />
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-lg border border-chart-1/30 bg-chart-1/5 p-4">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="size-3 rounded-full bg-chart-1" />
                            <h4 className="font-medium">VEOG — vertical</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            One electrode directly above and one directly below the same eye
                            (in line with the pupil). Captures blinks and up-and-down gaze.
                          </p>
                        </div>
                        <div className="rounded-lg border border-chart-2/30 bg-chart-2/5 p-4">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="size-3 rounded-full bg-chart-2" />
                            <h4 className="font-medium">HEOG — horizontal</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            One electrode near the outer corner (lateral canthus) of each eye.
                            Captures left-to-right eye movements.
                          </p>
                        </div>
                      </div>
                    </div>

                    <StepCard
                      step={5}
                      title="Place VEOG and HEOG Electrodes"
                      description="Prep each site with an alcohol pad and let it dry. Apply a small amount of gel, then attach each electrode with an adhesive collar: the VEOG pair above and below one eye, and the HEOG pair at the outer canthus of each eye."
                      tips={[
                        "Keep VEOG electrodes vertically aligned with the pupil for a clean blink signal",
                        "Place electrodes on bone (orbital rim) rather than soft tissue to reduce movement",
                        "Avoid the eyelashes and keep leads clear of the participant's line of sight",
                        "A bipolar VEOG/HEOG pair is read as the difference between its two electrodes",
                      ]}
                      completed={completedSteps.includes("setup-5")}
                      onToggle={() => toggleStep("setup-5")}
                      icon={Target}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-xl">Brain Regions Overview</CardTitle>
                    <CardDescription>
                      Understanding which brain areas each electrode group covers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-blue-500" />
                            <h4 className="font-medium">Frontal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Executive function, decision making, planning, and motor control.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["Fp1", "Fp2", "Fpz", "AF3", "AF4", "AF7", "AF8", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "Fz", "FC1", "FC2", "FC3", "FC4", "FC5", "FC6", "FCz"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-green-500" />
                            <h4 className="font-medium">Central (Motor Cortex)</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Primary motor cortex and somatosensory processing.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["C1", "C2", "C3", "C4", "C5", "C6", "Cz"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-purple-500" />
                            <h4 className="font-medium">Temporal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Auditory processing, memory, language comprehension.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["T7", "T8", "FT7", "FT8", "TP7", "TP8"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-amber-500" />
                            <h4 className="font-medium">Parietal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Spatial processing, attention, sensory integration.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "Pz", "CP1", "CP2", "CP3", "CP4", "CP5", "CP6", "CPz"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-rose-500" />
                            <h4 className="font-medium">Occipital Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Visual processing and visual perception.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["O1", "O2", "Oz", "PO3", "PO4", "PO7", "PO8", "POz", "Iz"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-gray-500/30 bg-gray-500/5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-3 rounded-full bg-gray-500" />
                            <h4 className="font-medium">Reference Electrodes</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Mastoid or earlobe references for differential recording.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["A1", "A2"].map(e => (
                              <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gel Application Tab */}
              <TabsContent value="gel" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Gel Application</CardTitle>
                    <CardDescription>
                      Proper gel application is essential for good signal quality and low impedances
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <GuideReferencePanel
                        title="Reference: electrode cap on scalp"
                        mediaKey="eegRecordingCap"
                        className="h-full"
                      />
                      <div className="space-y-4">
                        <h3 className="font-sans text-xl font-semibold">About SignaGel</h3>
                        <p className="text-muted-foreground">
                          SignaGel is a highly conductive electrode gel specifically designed for 
                          EEG recordings. It provides excellent conductivity while being gentle on 
                          the scalp and easy to wash out.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span className="text-sm">High chloride content for conductivity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span className="text-sm">Water-soluble and easy to clean</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span className="text-sm">Hypoallergenic formula</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span className="text-sm">Doesn&apos;t dry out during long sessions</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <StepCard
                      step={1}
                      title="Prepare Gel Syringes"
                      description="Fill blunt-tip syringes with SignaGel or your preferred conductive gel. Have several syringes ready to avoid interruptions during application."
                      tips={["Remove air bubbles from syringe", "Keep gel at room temperature", "Have 2-3 syringes prepared in advance"]}
                      completed={completedSteps.includes("gel-1")}
                      onToggle={() => toggleStep("gel-1")}
                      icon={Droplets}
                    />

                    <StepCard
                      step={2}
                      title="Part Hair at Each Electrode Site"
                      description="Using the syringe tip or a cotton swab, gently part the hair beneath each electrode holder to expose the scalp. Work systematically from front to back."
                      tips={["Use a gentle swirling motion", "Don't scratch or irritate the scalp", "Ensure you can see the scalp through the electrode hole"]}
                      completed={completedSteps.includes("gel-2")}
                      onToggle={() => toggleStep("gel-2")}
                      icon={Rows3}
                    />

                    <StepCard
                      step={3}
                      title="Apply Gel to Each Electrode"
                      description="Insert the syringe tip into the electrode holder and inject a small amount of gel while gently swirling. The gel should make contact with both the scalp and the electrode."
                      tips={["Don't overfill - gel bridges between electrodes cause shorts", "A small amount (pea-sized) is usually sufficient", "You should feel slight resistance as gel contacts scalp"]}
                      completed={completedSteps.includes("gel-3")}
                      onToggle={() => toggleStep("gel-3")}
                      icon={Syringe}
                    />

                    <StepCard
                      step={4}
                      title="Check Signal Quality at Each Site"
                      description="Check every channel in your acquisition software before starting. What you read depends on your hardware: passive-electrode systems report impedance in kΩ, while active-electrode systems (such as BioSemi ActiveTwo in ActiView) report electrode offset in mV instead, since the built-in preamps make impedance far less critical."
                      tips={["Passive systems: aim for under 5-10 kΩ, and keep channels within a similar range of each other", "Active systems: aim for a stable offset within roughly ±25 mV and watch for drift rather than an absolute number", "Re-gel and re-part the hair at any site that stays out of range", "Document any channel you cannot bring in range, so it can be excluded during preprocessing"]}
                      completed={completedSteps.includes("gel-4")}
                      onToggle={() => toggleStep("gel-4")}
                      icon={Gauge}
                    />
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="size-5 text-primary" />
                      Impedance Troubleshooting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {troubleshooting.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                          <AccordionTrigger className="text-left">
                            {item.problem}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.solution}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recording Tab */}
              <TabsContent value="recording" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Recording Session</CardTitle>
                    <CardDescription>
                      Tips for successful EEG data acquisition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Before Recording</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Verify all impedances are acceptable</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Check signal quality in preview mode</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Confirm trigger codes are working</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Set correct filename and save location</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Brief participant on task instructions</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">During Recording</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Monitor signal quality continuously</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Note any artifacts or issues in log</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Offer breaks if session is long</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Re-gel electrodes if impedances drift</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary mt-0.5" />
                            <span>Keep room quiet and minimize movement</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Common Artifacts to Watch For</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <div className="h-16 rounded border border-border bg-background flex items-center justify-center">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 Q10,20 20,5 T40,20 T60,5 T80,20 T100,5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-amber-500"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Eye Blinks</p>
                            <p className="text-xs text-muted-foreground">Large deflections in frontal channels</p>
                          </div>
                          <div className="space-y-2">
                            <div className="h-16 rounded border border-border bg-background flex items-center justify-center">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 L10,15 L20,25 L30,15 L40,25 L50,15 L60,25 L70,15 L80,25 L90,15 L100,20" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-red-500"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Muscle (EMG)</p>
                            <p className="text-xs text-muted-foreground">High-frequency noise from muscle tension</p>
                          </div>
                          <div className="space-y-2">
                            <div className="h-16 rounded border border-border bg-background flex items-center justify-center">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,30 Q25,30 50,10 Q75,30 100,30" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-blue-500"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Movement</p>
                            <p className="text-xs text-muted-foreground">Slow drifts from head/body movement</p>
                          </div>
                          <div className="space-y-2">
                            <div className="h-16 rounded border border-border bg-background flex items-center justify-center">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 L5,10 L10,30 L15,10 L20,30 L25,10 L30,30 L35,10 L40,30 L45,10 L50,30 L55,10 L60,30 L65,10 L70,30 L75,10 L80,30 L85,10 L90,30 L95,10 L100,20" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="1.5"
                                  className="text-purple-500"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">60Hz Line Noise</p>
                            <p className="text-xs text-muted-foreground">Regular sinusoidal interference</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Spot the Artifact</CardTitle>
                    <CardDescription>
                      Practice reading traces the way you will during a live recording. Identify
                      each one, then check your answer.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ArtifactTrainer />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cleanup Tab */}
              <TabsContent value="cleanup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-2xl">Post-Session Cleanup</CardTitle>
                    <CardDescription>
                      Proper cleanup ensures participant comfort and equipment longevity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <StepCard
                      step={1}
                      title="Remove the Cap"
                      description="Gently unfasten the chin strap and carefully remove the cap. Lift from the back first, then roll forward off the forehead."
                      tips={["Go slowly to avoid pulling hair", "Have participant hold their head steady", "Support the cable to prevent tangling"]}
                      completed={completedSteps.includes("clean-1")}
                      onToggle={() => toggleStep("clean-1")}
                      icon={Undo2}
                    />

                    <StepCard
                      step={2}
                      title="Participant Cleanup"
                      description="Provide the participant with towels and access to a sink or shower. Most gel washes out easily with warm water and regular shampoo."
                      tips={["Offer a comb or brush", "Provide privacy if using shower", "Have extra towels available"]}
                      completed={completedSteps.includes("clean-2")}
                      onToggle={() => toggleStep("clean-2")}
                      icon={ShowerHead}
                    />

                    <StepCard
                      step={3}
                      title="Clean the Cap and Electrodes"
                      description="Rinse the cap thoroughly with lukewarm water to remove all gel. Use a soft brush if needed. Do not use hot water or harsh chemicals."
                      tips={["Never submerge the connector end", "Use gentle water pressure", "Check each electrode holder is clean"]}
                      completed={completedSteps.includes("clean-3")}
                      onToggle={() => toggleStep("clean-3")}
                      icon={Sparkles}
                    />

                    <StepCard
                      step={4}
                      title="Disinfect Equipment"
                      description="After rinsing, disinfect the cap according to your lab's protocol. Common methods include soaking in a dilute disinfectant solution or using disinfectant wipes."
                      tips={["Follow manufacturer guidelines", "Ensure complete contact with disinfectant", "Allow proper contact time per protocol"]}
                      completed={completedSteps.includes("clean-4")}
                      onToggle={() => toggleStep("clean-4")}
                      icon={Shield}
                    />

                    <StepCard
                      step={5}
                      title="Dry and Store"
                      description="Allow the cap to air dry completely before storage. Store in a clean, dry location away from direct sunlight. Coil cables loosely to prevent damage."
                      tips={["Never store wet caps - promotes mold/bacteria", "Use cap stand or hook for drying", "Check electrodes for damage before storing"]}
                      completed={completedSteps.includes("clean-5")}
                      onToggle={() => toggleStep("clean-5")}
                      icon={Archive}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-sans text-xl">Equipment Maintenance Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">After Each Session</p>
                          <p className="text-sm text-muted-foreground">Rinse and disinfect cap, clean syringes</p>
                        </div>
                        <Badge>Daily</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">Inspect Electrodes</p>
                          <p className="text-sm text-muted-foreground">Check for corrosion, loose connections</p>
                        </div>
                        <Badge variant="secondary">Weekly</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-border">
                        <div>
                          <p className="font-medium">Deep Clean Cables</p>
                          <p className="text-sm text-muted-foreground">Check for damage, test connectivity</p>
                        </div>
                        <Badge variant="secondary">Monthly</Badge>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium">Full System Check</p>
                          <p className="text-sm text-muted-foreground">Calibration, battery health, software updates</p>
                        </div>
                        <Badge variant="outline">Quarterly</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
              <div className="flex gap-2">
                {activeSection !== "overview" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection)
                      if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id)
                    }}
                  >
                    <ChevronLeft className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous Section</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                )}
                {activeSection !== "cleanup" && (
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection)
                      if (currentIndex < sections.length - 1) setActiveSection(sections[currentIndex + 1].id)
                    }}
                  >
                    <span className="hidden sm:inline">Next Section</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="size-4 sm:ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

interface StepCardProps {
  step: number
  title: string
  description: string
  tips: string[]
  completed: boolean
  onToggle: () => void
  icon: LucideIcon
}

function StepCard({ step, title, description, tips, completed, onToggle, icon: Icon }: StepCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 sm:p-6 ${
      completed
        ? "border-accent/40 bg-accent/5 ring-1 ring-accent/15"
        : "border-border hover:border-accent/30 hover:shadow-sm"
    }`}>
      {/* Accent bar marks a completed step */}
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-accent transition-opacity ${completed ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
      <div className="flex gap-4 sm:gap-5">
        <button
          onClick={onToggle}
          aria-pressed={completed}
          aria-label={completed ? `Mark step ${step} incomplete` : `Mark step ${step} complete`}
          className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all hover:scale-105 ${
            completed
              ? "border-accent bg-accent text-accent-foreground shadow-sm"
              : "border-muted-foreground/30 text-muted-foreground hover:border-accent hover:text-accent"
          }`}
        >
          {completed ? <CheckCircle2 className="size-5" /> : step}
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-lg font-semibold sm:text-xl">{title}</h3>
            {/* Decorative icon — hidden on phones to give text room */}
            <div
              className="hidden size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 text-accent sm:flex"
              aria-hidden
            >
              <Icon className="size-6" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>

          {tips.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-accent">Tips:</p>
              <ul className="space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
