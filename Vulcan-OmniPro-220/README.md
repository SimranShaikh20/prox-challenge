# Vulcan OmniPro 220 — Expert Support Agent
### Prox Founding Engineer Challenge Submission
---

## The Problem This Solves

Someone buys a $800 multiprocess welder. They unbox it. They stare
at it. The manual is 48 pages. They have no idea what DCEP means,
which socket the torch goes into, or why their welds have holes in them.

They call support. Hold time is 45 minutes. They find a YouTube video
that does not match their exact machine. They guess. They get it wrong.
They damage the machine or produce failed welds.

This is the exact problem Prox exists to solve. This is my solution.

---

## What I Built

Not a chatbot. A **multimodal reasoning engine** that treats every
response as a rendering decision.

The agent never just answers in text. It looks at the question and
decides the best possible format to make the answer immediately
understandable — diagram, calculator, flowchart, checklist, or
visual configurator. Then it generates and renders that format live.

```
User asks a question
        ↓
Agent decides: what is the BEST FORMAT for this answer?
        ↓
┌──────────────────────────────────────────────────────┐
│  Polarity / wiring question  →  SVG wiring diagram   │
│  Duty cycle question         →  Interactive calc     │
│  Troubleshooting problem     →  Visual flowchart     │
│  Settings / config question  →  Live configurator    │
│  Pre-weld preparation        →  Step checklist       │
│  Question too vague          →  Clickable chips      │
│  User uploads a photo        →  Vision diagnosis     │
│  New user needs guidance     →  Setup wizard         │
└──────────────────────────────────────────────────────┘
        ↓
LEFT:  Text explanation in chat
RIGHT: Live interactive React component renders instantly
```

---

## The 7 Features That Make This Different

---

### 1. 🧭 Guided Setup Wizard — The Killer Feature

Most agents are reactive. They wait for the user to ask the right
question. This one proactively guides the user through the entire
setup process start to finish like an expert standing next to them.

User clicks Guided Mode and picks their process, material, thickness.
The agent generates a complete 12-step interactive wizard:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STEP 1 OF 12 — SET YOUR POLARITY    ████░░░░  8%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ┌────────────────────────────────┐
 │     VULCAN OMNIPRO 220         │
 │                                │
 │   ⬤  (-)          ⬤  (+)      │
 │   LEFT            RIGHT        │
 │    │                │          │
 │  TORCH           GROUND        │
 └────────────────────────────────┘

 "Move the torch cable to the RIGHT socket.
  This is positive (+). For MIG welding this
  is the correct polarity — called DCEP."

  [ ✓ Done ]   [ ? I need help ]   [ ← Back ]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Every step has a diagram, plain English instruction, and three
buttons. Help opens a mini-chat specifically for that step so
user can ask sub-questions without losing their place in the wizard.
Final step shows duty cycle reminder before they strike their
first arc. Progress bar tracks completion across all 12 steps.

This turns a 48-page manual into a 5-minute guided experience.

---

### 2. 👁️ Weld Photo Diagnosis — Upload Your Bad Weld

User welds, something looks wrong. They photograph the weld bead
and drop it into the chat. The agent uses Claude Vision to identify
the exact defect by comparing against known weld failure patterns:

| What Agent Sees | Defect | What To Change |
|---|---|---|
| Small holes or pits on surface | Porosity | Increase gas flow to 22-25 CFH |
| Metal droplets scattered around | Excessive spatter | Increase voltage by 1 step |
| Groove along edge of bead | Undercut | Slow travel speed |
| Weld not bonded to edges | Incomplete fusion | Increase amperage |
| Hole melted through material | Burn through | Reduce voltage, speed up |

After diagnosis the agent generates a troubleshooting flowchart
specifically for that defect with exact corrective settings.

---

### 3. 📊 Live Interactive Artifacts — Real Apps Not Images

When the agent generates a visual it is not a static image.
It is a working React application rendered live in the right panel.

**Duty Cycle Calculator**
User selects voltage, process, amperage. Instantly shows:
- Large color-coded percentage (green/yellow/red)
- Plain English: "Weld 2 min → Rest 8 min per 10 min cycle"
- Warning if approaching machine maximum rated amperage

**Settings Configurator**
Dropdowns: process, material, thickness, wire size, voltage.
Output updates instantly: voltage setting, wire speed, gas flow,
polarity required, duty cycle, special notes.
All values from actual manual specifications.

**Polarity Diagram**
SVG of the front panel with color-coded cables and socket labels.
Red = positive, Black = negative. Impossible to misread.

**Troubleshooting Flowchart**
Red symptom → yellow check diamonds → green fix nodes.
Real values in every fix. Scrollable if chart runs long.

---

### 4. ⚡ Zero Friction — Works The Second You Open It

Complete knowledge of the Vulcan OmniPro 220 is embedded directly
in the agent. No PDF to upload. No database to configure. No
extraction step. Open the app, ask a question, get a visual answer.
Immediately. First question, first second.

---

### 5. 📱 Welder Display Reading

User photographs the LCD display on their machine showing current
settings. Agent reads what is visible on screen and tells them
whether those settings are correct for what they want to weld
and exactly what to change if not. Like an expert looking over
your shoulder saying "turn that voltage up to 5."

---

### 6. 🧩 Smart Clarification Chips

Vague question detected. Agent does not guess. Does not answer
with a paragraph covering every possibility. Shows clickable
option chips that narrow the problem in one tap:

```
User: "My welder isn't working"

Agent shows:
┌──────────────────────────────────────────────┐
│  What exactly happens when you try?          │
│                                              │
│  [ No arc at all ]  [ Wire not feeding ]     │
│  [ Display error ]  [ Arc very weak ]        │
└──────────────────────────────────────────────┘
```

User taps one chip. Agent knows exactly what to diagnose.
Response is precise and generates the correct visual immediately.

---

### 7. ✅ Pre-Weld Safety Checklist

Personalized interactive checklist for any process and material
combination. Checkboxes grouped by category: Setup, Safety,
Machine Settings. Progress bar shows completion. Green Ready to
Weld banner appears only when every item is checked. Prevents
the most common mistakes that damage the machine or ruin welds.

---

## What The Agent Knows

**Polarity — most common setup mistake**
- MIG → DCEP: torch right (+), ground left (-)
- Flux-Cored → DCEN: torch left (-), ground right (+) — opposite of MIG
- TIG → DCEN: torch left (-), ground right (+)
- Stick → DCEP: electrode holder right (+), ground left (-)

**Duty Cycles — complete matrix**

| Amperage | 120V | 240V |
|---|---|---|
| 90A | 20% | — |
| 120A | 15% | 60% |
| 130A | 10% | — |
| 150A | — | 40% |
| 160A | — | 30% |
| 180A | — | 25% |
| 200A | — | 20% |
| 220A | — | 15% |

**MIG Settings by Material Thickness**

| Thickness | Voltage | Wire Speed | Wire Size |
|---|---|---|---|
| 24 gauge | 1 | 1-2 | 0.023" |
| 18 gauge | 1-2 | 2-3 | 0.023" |
| 1/8 inch | 3-4 | 3-4 | 0.030" |
| 3/16 inch | 4-5 | 4-5 | 0.030" |
| 1/4 inch | 5-6 | 5-6 | 0.035" |
| 3/8 inch | 6 | 6 | 0.035" |

**Troubleshooting — 8 problems, all causes, exact fixes**
Porosity, spatter, bird-nesting, no arc, burn through,
undercut, incomplete fusion, wire feeding issues.

**Stick electrode specs**
6010, 6011, 6013, 7018 — polarity, amperage range, best use cases.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────┐
│                    FRONTEND                        │
│                                                    │
│  Chat Panel (left 50%)  │  Artifact Panel (right)  │
│  ──────────────────────────────────────────────    │
│  Message history        │  Live React components   │
│  Quick question chips   │  Polarity SVG diagrams   │
│  Photo upload + preview │  Duty cycle calculator   │
│  Clarification chips    │  Settings configurator   │
│  Guided mode wizard     │  Troubleshoot flowchart  │
└──────────────┬─────────────────────────────────────┘
               │  POST /api/chat
               ▼
┌────────────────────────────────────────────────────┐
│           CLAUDE AGENT (claude-sonnet-4-20250514)             │
│                                                    │
│  Mandatory rendering rules in system prompt:       │
│  Polarity question    → always draw diagram        │
│  Duty cycle question  → always render calculator   │
│  Troubleshooting      → always render flowchart    │
│  Settings question    → always render configurator │
│  Photo uploaded       → Vision analysis first      │
│  Vague question       → generate option chips      │
│                                                    │
│  Tools:                                            │
│  1. search_knowledge    — query knowledge base     │
│  2. generate_artifact   — produce React component  │
│  3. surface_manual_image — show manual page        │
│  4. analyze_user_image  — Claude Vision diagnosis  │
│  5. needs_clarification — generate option chips    │
└──────────────┬─────────────────────────────────────┘
               ▼
┌────────────────────────────────────────────────────┐
│          KNOWLEDGE BASE (Embedded)                 │
│                                                    │
│  All polarity setups per process                   │
│  Complete duty cycle matrix 120V and 240V          │
│  MIG/FC/TIG/Stick settings by material thickness   │
│  8 troubleshooting problems with all fixes         │
│  Pre-weld checklists per process                   │
│  Full machine specifications                       │
└────────────────────────────────────────────────────┘
```

---

## Setup — Under 2 Minutes

```bash
# Clone your fork
git clone https://github.com/SimranShaikh20/prox-challenge
cd prox-challenge

# Add your API key
cp .env.example .env
# Add ANTHROPIC_API_KEY=your_key_here

# Install and run
npm install
npm run dev
```

Open `http://localhost:3000` and ask your first question.
No database. No extraction step. No configuration. Works immediately.

---

## Test Questions — What Prox Will Ask

```
"What polarity for TIG welding?"
→ SVG diagram of front panel with color-coded cables

"What is the duty cycle at 200A on 240V?"
→ Interactive calculator — 20%, weld 2 min rest 8 min

"I am getting porosity in my flux-cored welds"
→ Troubleshooting flowchart with exact corrective settings

"Settings for 3/16 inch steel MIG on 240V"
→ Configurator: voltage 4-5, wire speed 4-5, gas 22 CFH

"[Photo of bad weld uploaded]"
→ Visual defect diagnosis + specific flowchart for that defect
```

---

## Why This Beats Every Other Submission

| What Others Build | What This Does |
|---|---|
| Chatbot that answers in text | Rendering engine — best format per question |
| Requires PDF upload to work | Embedded knowledge — instant, zero setup |
| Static text or image responses | Live interactive React components |
| Waits for user questions | Guided Mode walks through entire setup |
| No image understanding | Weld bead and display photo diagnosis |
| Guesses at vague questions | Clickable chips to narrow the problem |
| Generic chat UI | Dark industrial design for a real use case |

---

## The Core Insight

The information in a 48-page welding manual is not primarily text.
It is spatial, visual, and physical — which cable connects where,
what the front panel looks like, what a bad weld looks like vs a
good one, how the numbers in a duty cycle matrix relate to real
time you can weld vs rest.

Text alone fails physical products. That is the entire reason Prox
exists. This submission is built on that insight from the ground up.
Every decision — the split panel layout, mandatory visual rules in
the system prompt, the guided wizard, the weld photo diagnosis —
is a direct response to the fact that welding cannot be taught
through paragraphs.

---

## Stack

| Layer | Technology |
|---|---|
| Agent | Anthropic Claude claude-sonnet-4-20250514 with Tool Use |
| Vision | Claude Vision API for photo analysis |
| Artifacts | Claude-generated React components in sandboxed iframes |
| Frontend | React 18 + Vite |
| Styling | CSS variables, Space Grotesk, JetBrains Mono |
| Hosting | Lovable |

---

*Built for the Prox Founding Engineer Challenge*
*Submission by Simran Shaikh*
