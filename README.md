
# PulseTalk | Cosmic Real-Time Platform

PulseTalk is a high-performance, enterprise-grade real-time messaging platform with a futuristic cosmic aesthetic. It features AI-driven smart replies, glassmorphism UI, and zero-friction entry via persistent guest identities.

## 🚀 Key Features

- **Real-Time Channels**: Scalable Firestore-backed messaging with instant delivery.
- **Persistent Guest Identity**: Automatic, persistent user profiles without the friction of a traditional login gate.
- **AI Smart Replies**: Context-aware suggestions powered by Google Gemini 2.5 Flash via Genkit.
- **In-Chat Message Search**: Quickly find past cosmic transmissions with instant filtering.
- **Channel Creation**: Dynamic room management allowing users to spin up new communication hubs.
- **Glassmorphism UI**: High-fidelity visual interface built with Tailwind CSS, Shadcn UI, and Framer Motion.
- **Hydration Safe**: Robust mounting strategies to handle SSR discrepancies gracefully.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend/Database**: Firebase Firestore, Firebase Authentication (scaffolded)
- **AI Logic**: Genkit v1.x with Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons
- **Components**: Shadcn UI (Radix UI primitives)

## 📁 Architecture

```text
src/
├── ai/              # Genkit AI flows (Smart Replies)
├── app/             # Next.js App Router (Pages & Layouts)
├── components/      # Modular UI (Chat, Sidebar, UI primitives)
├── firebase/        # Firebase initialization & SDK configuration
├── hooks/           # Custom React hooks (Auth, Presence)
├── lib/             # Utilities and shared assets
└── styles/          # Global CSS and Tailwind configs
```

## 🔒 Security & Performance

- **Optimistic Updates**: Local state reflects message sends instantly before server confirmation.
- **Real-Time Presence**: Online status indicators reflect live network activity.
- **Filtered Streams**: Efficient Firestore queries for low-latency communication.
- **Hydration Resilience**: Client components are guarded with mounting logic to prevent UI jumps.

---

*PulseTalk: Bridging the gap between cosmic inspiration and real-time connectivity.*
