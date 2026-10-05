"use client"

import { useState } from "react"
import Link from "next/link"
import { GuideReferencePanel } from "@/components/guide-reference-panel"
import { ChevronRight, ChevronLeft, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { SiteHeader } from "@/components/site-chrome"
import { EEGWaveform } from "@/components/eeg-waveform"
import { ElectrodeMap } from "@/components/electrode-map"

const sections = [
  { id: "overview", title: "Overview" },
  { id: "preparation", title: "Preparation" },
  { id: "setup", title: "Cap setup" },
  { id: "gel", title: "Gel application" },
  { id: "recording", title: "Recording" },
  { id: "cleanup", title: "Cleanup" },
]

// Steps rendered with StepCard across all sections
const TOTAL_STEPS = 17

const equipmentList = [
  { name: "BioSemi ActiveTwo System", required: true },
  { name: "EEG Cap (appropriate size)", required: true },
  { name: "Electrodes (64 or 128 channel)", required: true },
  { name: "SignaGel or similar conductive gel", required: true },
  { name: "Blunt-tip syringes (10-20ml)", required: true },
  { name: "Measuring tape (for head circumference)", required: true },
  { name: "Alcohol prep pads", required: true },
  { name: "Cotton swabs", required: true },
  { name: "Towels and tissues", required: true },
  { name: "Chin strap (optional)", required: false },
  { name: "Electrode gel applicator sticks", required: false },
  { name: "Reference/ground electrodes", required: true },
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

export default function EEGGuidePage() {
  const [activeSection, setActiveSection] = useState("overview")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const toggleStep = (step: string) => {
    setCompletedSteps(prev => 
      prev.includes(step) 
        ? prev.filter(s => s !== step)
        : [...prev, step]
    )
  }

  const progress = (completedSteps.length / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-12 lg:pt-16">
        {/* Title block */}
        <div className="border-b pb-10">
          <h1 className="max-w-3xl font-serif text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl">
            EEG guide
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            How to run an EEG session on the BioSemi ActiveTwo. Check off each step as you go.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            {[
              { label: "Setup time", value: "30–45 min" },
              { label: "Staff", value: "2 researchers" },
              { label: "Channels", value: "64 / 128" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-1">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Section strip for small screens */}
        <nav className="-mx-6 overflow-x-auto border-b px-6 lg:hidden" aria-label="Sections">
          <ol className="flex gap-6 whitespace-nowrap text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`border-b-2 py-3 transition-colors ${
                    activeSection === section.id
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-12 pt-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-10">
              <nav aria-label="Sections">
                <p className="text-xs text-muted-foreground">Sections</p>
                <ol className="mt-3 border-t">
                  {sections.map((section) => (
                    <li key={section.id} className="border-b">
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`flex w-full items-baseline py-2.5 text-left text-sm transition-colors ${
                          activeSection === section.id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>

              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className="text-xs">
                    {completedSteps.length}/{TOTAL_STEPS}
                  </p>
                </div>
                <Progress value={progress} className="mt-3" />
              </div>

              <div className="border-l-2 border-accent pl-4">
                <p className="text-sm font-medium">Safety first</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Always follow your lab&apos;s IRB-approved protocols and safety guidelines.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 space-y-8">
            {/* Tabbed Content */}
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
              <TabsList className="hidden">
                {sections.map(s => <TabsTrigger key={s.id} value={s.id}>{s.title}</TabsTrigger>)}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Equipment checklist</CardTitle>
                    <CardDescription>
                      Gather all materials before beginning the study session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-x-8 border-t sm:grid-cols-2">
                      {equipmentList.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 border-b py-2.5"
                        >
                          <span className="size-3 shrink-0 rounded-[2px] border border-foreground/40" aria-hidden />
                          <span className={item.required ? "" : "text-muted-foreground"}>
                            {item.name}
                          </span>
                          {!item.required && (
                            <Badge variant="outline" className="ml-auto text-xs">Optional</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Cap size guide</CardTitle>
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
                              <td className="py-3 px-4">{size.size}</td>
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
                  <Card className="border-accent/50">
                    <CardHeader>
                      <CardTitle>
                        Important precautions
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

                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Best practices
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
                    <CardTitle className="text-3xl">Participant preparation</CardTitle>
                    <CardDescription>
                      Steps to prepare the participant for EEG recording
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <GuideReferencePanel
                      title="The 10–20 electrode positions"
                      description="Landmarks (nasion, inion, preauricular points) align the cap to this standard layout."
                      mediaKey="eeg1020"
                    />

                    <StepCard
                      step={1}
                      title="Informed Consent"
                      description="Review and obtain signed informed consent. Explain the procedure, duration, and what to expect."
                      tips={["Use clear, non-technical language", "Allow time for questions", "Provide a copy of signed consent"]}
                      completed={completedSteps.includes("prep-1")}
                      onToggle={() => toggleStep("prep-1")}
                    />
                    
                    <StepCard
                      step={2}
                      title="Measure Head Circumference"
                      description="Using a flexible measuring tape, measure around the head at the widest point - just above the eyebrows and around the occipital protuberance."
                      tips={["Measure twice for accuracy", "Round up if between sizes", "Record measurement in participant file"]}
                      completed={completedSteps.includes("prep-2")}
                      onToggle={() => toggleStep("prep-2")}
                    />

                    <StepCard
                      step={3}
                      title="Identify Anatomical Landmarks"
                      description="Locate the nasion (bridge of nose), inion (bump at back of head), and preauricular points (in front of ears) for proper cap placement."
                      tips={["Use a skin-safe marker if needed", "These landmarks ensure consistent placement", "Cz should be exactly between nasion-inion and preauricular points"]}
                      completed={completedSteps.includes("prep-3")}
                      onToggle={() => toggleStep("prep-3")}
                    />

                    <StepCard
                      step={4}
                      title="Prepare the Scalp"
                      description="Have the participant sit comfortably. Part hair to expose scalp where reference electrodes will be placed. Gently clean skin with alcohol prep pad."
                      tips={["Be gentle - avoid irritating the skin", "Let alcohol dry completely before gel application", "For external electrodes, clean mastoid areas"]}
                      completed={completedSteps.includes("prep-4")}
                      onToggle={() => toggleStep("prep-4")}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cap Setup Tab */}
              <TabsContent value="setup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">EEG cap setup</CardTitle>
                    <CardDescription>
                      Proper cap placement is critical for accurate recordings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-sm border border-border bg-background p-4 sm:p-6">
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        10-20 system. Click an electrode for placement notes, and align <span className="font-mono font-medium text-foreground">Cz</span> at the vertex.
                      </p>
                      <ElectrodeMap variant="guide" />
                    </div>

                    <GuideReferencePanel
                      title="An EEG recording cap"
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
                    />

                    <StepCard
                      step={2}
                      title="Position the Cap"
                      description="Place the cap on the participant's head. Align Cz (vertex) with the midpoint between nasion-inion and between preauricular points. Fpz should be 10% of nasion-inion distance above nasion."
                      tips={["Have participant hold front of cap while you adjust back", "Check symmetry by comparing left and right electrode positions", "Cz should be at the very top of the head"]}
                      completed={completedSteps.includes("setup-2")}
                      onToggle={() => toggleStep("setup-2")}
                    />

                    <StepCard
                      step={3}
                      title="Secure the Cap"
                      description="Fasten the chin strap (if using) and adjust any straps to ensure the cap is secure. The cap should not shift during head movements."
                      tips={["Chin strap should be snug but comfortable", "Check that no electrodes are lifted off the scalp", "Ask participant if they feel any pressure points"]}
                      completed={completedSteps.includes("setup-3")}
                      onToggle={() => toggleStep("setup-3")}
                    />

                    <GuideReferencePanel
                      title="An EEG amplifier setup"
                      description="Verify cable connections and system status before starting impedance checks."
                      mediaKey="eegClinicalSetup"
                    />

                    <StepCard
                      step={4}
                      title="Connect to Amplifier"
                      description="Connect the electrode cables to the BioSemi ActiveTwo amplifier. Ensure the ribbon cable is properly seated and locked. Power on the amplifier."
                      tips={["Check that status LED indicates proper connection", "Route cables to minimize movement artifacts", "Ensure battery is fully charged before session"]}
                      completed={completedSteps.includes("setup-4")}
                      onToggle={() => toggleStep("setup-4")}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Brain regions overview</CardTitle>
                    <CardDescription>
                      Understanding which brain areas each electrode group covers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                      <div className="space-y-6">
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--chart-1)" }} />
                            <h4 className="font-serif text-lg">Frontal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Executive function, decision making, planning, and motor control.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["Fp1", "Fp2", "Fpz", "AF3", "AF4", "AF7", "AF8", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "Fz", "FC1", "FC2", "FC3", "FC4", "FC5", "FC6", "FCz"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--chart-3)" }} />
                            <h4 className="font-serif text-lg">Central (Motor Cortex)</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Primary motor cortex and somatosensory processing.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["C1", "C2", "C3", "C4", "C5", "C6", "Cz"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--chart-4)" }} />
                            <h4 className="font-serif text-lg">Temporal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Auditory processing, memory, language comprehension.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["T7", "T8", "FT7", "FT8", "TP7", "TP8"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
                            <h4 className="font-serif text-lg">Parietal Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Spatial processing, attention, sensory integration.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "Pz", "CP1", "CP2", "CP3", "CP4", "CP5", "CP6", "CPz"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--chart-5)" }} />
                            <h4 className="font-serif text-lg">Occipital Lobe</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Visual processing and visual perception.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["O1", "O2", "Oz", "PO3", "PO4", "PO7", "PO8", "POz", "Iz"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-2.5 rounded-full" style={{ backgroundColor: "var(--muted-foreground)" }} />
                            <h4 className="font-serif text-lg">Reference Electrodes</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Mastoid or earlobe references for differential recording.
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["A1", "A2"].map(e => (
                              <Badge key={e} variant="outline" className="font-mono text-xs font-normal text-muted-foreground">{e}</Badge>
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
                    <CardTitle className="text-3xl">Gel application</CardTitle>
                    <CardDescription>
                      Proper gel application is essential for good signal quality and low impedances
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <GuideReferencePanel
                        title="Electrode cap on the scalp"
                        mediaKey="eegRecordingCap"
                        className="h-full"
                      />
                      <div className="space-y-4">
                        <h3 className="font-serif text-2xl tracking-tight">About SignaGel</h3>
                        <p className="text-muted-foreground">
                          SignaGel is a highly conductive electrode gel specifically designed for 
                          EEG recordings. It provides excellent conductivity while being gentle on 
                          the scalp and easy to wash out.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span className="text-sm">High chloride content for conductivity</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span className="text-sm">Water-soluble and easy to clean</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span className="text-sm">Hypoallergenic formula</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
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
                    />

                    <StepCard
                      step={2}
                      title="Part Hair at Each Electrode Site"
                      description="Using the syringe tip or a cotton swab, gently part the hair beneath each electrode holder to expose the scalp. Work systematically from front to back."
                      tips={["Use a gentle swirling motion", "Don't scratch or irritate the scalp", "Ensure you can see the scalp through the electrode hole"]}
                      completed={completedSteps.includes("gel-2")}
                      onToggle={() => toggleStep("gel-2")}
                    />

                    <StepCard
                      step={3}
                      title="Apply Gel to Each Electrode"
                      description="Insert the syringe tip into the electrode holder and inject a small amount of gel while gently swirling. The gel should make contact with both the scalp and the electrode."
                      tips={["Don't overfill - gel bridges between electrodes cause shorts", "A small amount (pea-sized) is usually sufficient", "You should feel slight resistance as gel contacts scalp"]}
                      completed={completedSteps.includes("gel-3")}
                      onToggle={() => toggleStep("gel-3")}
                    />

                    <StepCard
                      step={4}
                      title="Check Impedances"
                      description="Using ActiView software, check impedances for all electrodes. Good impedances are typically below 20kΩ for BioSemi systems. Re-apply gel to any electrodes with high impedances."
                      tips={["Start recording to see live impedance values", "Focus on problem electrodes first", "Document any persistently high-impedance channels"]}
                      completed={completedSteps.includes("gel-4")}
                      onToggle={() => toggleStep("gel-4")}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Impedance troubleshooting
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
                    <CardTitle className="text-3xl">Recording session</CardTitle>
                    <CardDescription>
                      Tips for successful EEG data acquisition
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="overflow-hidden rounded-sm border border-border">
                      <div className="border-b border-border px-4 py-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <div className="flex items-center gap-3">
                            <span className="size-2 rounded-full bg-accent" aria-hidden />
                            <span className="text-xs">Example recording view</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                            <span>Sample Rate: 2048 Hz</span>
                            <span>Channels: 64</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <EEGWaveform 
                          channels={8}
                          labels={["Fp1", "Fz", "C3", "Cz", "C4", "Pz", "O1", "O2"]}
                          animated={true}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>Before recording</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Verify all impedances are acceptable</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Check signal quality in preview mode</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Confirm trigger codes are working</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Set correct filename and save location</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Brief participant on task instructions</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle>During recording</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Monitor signal quality continuously</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Note any artifacts or issues in log</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Offer breaks if session is long</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Re-gel electrodes if impedances drift</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                            <span>Keep room quiet and minimize movement</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-background">
                      <CardHeader>
                        <CardTitle>Common artifacts to watch for</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <div className="flex h-16 items-center justify-center rounded-sm border border-border bg-card">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 Q10,20 20,5 T40,20 T60,5 T80,20 T100,5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-foreground"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Eye Blinks</p>
                            <p className="text-xs text-muted-foreground">Large deflections in frontal channels</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex h-16 items-center justify-center rounded-sm border border-border bg-card">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 L10,15 L20,25 L30,15 L40,25 L50,15 L60,25 L70,15 L80,25 L90,15 L100,20" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-foreground"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Muscle (EMG)</p>
                            <p className="text-xs text-muted-foreground">High-frequency noise from muscle tension</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex h-16 items-center justify-center rounded-sm border border-border bg-card">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,30 Q25,30 50,10 Q75,30 100,30" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2"
                                  className="text-foreground"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium">Movement</p>
                            <p className="text-xs text-muted-foreground">Slow drifts from head/body movement</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex h-16 items-center justify-center rounded-sm border border-border bg-card">
                              <svg viewBox="0 0 100 40" className="w-full h-8 px-2">
                                <path 
                                  d="M0,20 L5,10 L10,30 L15,10 L20,30 L25,10 L30,30 L35,10 L40,30 L45,10 L50,30 L55,10 L60,30 L65,10 L70,30 L75,10 L80,30 L85,10 L90,30 L95,10 L100,20" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="1.5"
                                  className="text-foreground"
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
              </TabsContent>

              {/* Cleanup Tab */}
              <TabsContent value="cleanup" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-3xl">Post-session cleanup</CardTitle>
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
                    />

                    <StepCard
                      step={2}
                      title="Participant Cleanup"
                      description="Provide the participant with towels and access to a sink or shower. Most gel washes out easily with warm water and regular shampoo."
                      tips={["Offer a comb or brush", "Provide privacy if using shower", "Have extra towels available"]}
                      completed={completedSteps.includes("clean-2")}
                      onToggle={() => toggleStep("clean-2")}
                    />

                    <StepCard
                      step={3}
                      title="Clean the Cap and Electrodes"
                      description="Rinse the cap thoroughly with lukewarm water to remove all gel. Use a soft brush if needed. Do not use hot water or harsh chemicals."
                      tips={["Never submerge the connector end", "Use gentle water pressure", "Check each electrode holder is clean"]}
                      completed={completedSteps.includes("clean-3")}
                      onToggle={() => toggleStep("clean-3")}
                    />

                    <StepCard
                      step={4}
                      title="Disinfect Equipment"
                      description="After rinsing, disinfect the cap according to your lab's protocol. Common methods include soaking in a dilute disinfectant solution or using disinfectant wipes."
                      tips={["Follow manufacturer guidelines", "Ensure complete contact with disinfectant", "Allow proper contact time per protocol"]}
                      completed={completedSteps.includes("clean-4")}
                      onToggle={() => toggleStep("clean-4")}
                    />

                    <StepCard
                      step={5}
                      title="Dry and Store"
                      description="Allow the cap to air dry completely before storage. Store in a clean, dry location away from direct sunlight. Coil cables loosely to prevent damage."
                      tips={["Never store wet caps - promotes mold/bacteria", "Use cap stand or hook for drying", "Check electrodes for damage before storing"]}
                      completed={completedSteps.includes("clean-5")}
                      onToggle={() => toggleStep("clean-5")}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Equipment maintenance schedule</CardTitle>
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/chat">
                  <ArrowLeft className="size-4" />
                  Back to chat
                </Link>
              </Button>
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
                    <span className="hidden sm:inline">Previous section</span>
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
                    <span className="hidden sm:inline">Next section</span>
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
}

function StepCard({ step, title, description, tips, completed, onToggle }: StepCardProps) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-4 border-t pt-6 sm:grid-cols-[3rem_1fr] sm:gap-5">
      <button
        onClick={onToggle}
        aria-pressed={completed}
        aria-label={completed ? `Mark step ${step} incomplete` : `Mark step ${step} complete`}
        className={`flex size-9 items-center justify-center rounded-sm border text-sm transition-colors ${
          completed
            ? "border-accent bg-accent text-accent-foreground"
            : "border-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground"
        }`}
      >
        {completed ? <Check className="size-4" strokeWidth={2.5} /> : step}
      </button>
      <div className="min-w-0">
        <h3
          className={`font-serif text-xl tracking-tight sm:text-2xl ${
            completed ? "text-muted-foreground line-through decoration-1" : ""
          }`}
        >
          {title}
        </h3>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{description}</p>

        {tips.length > 0 && (
          <div className="mt-4 max-w-2xl rounded-sm bg-muted/60 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Tips</p>
            <ul className="mt-2 space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/50" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
