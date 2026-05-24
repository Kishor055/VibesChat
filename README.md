# VibeChat | Cosmic Real-Time Communication Platform

VibeChat is an enterprise-grade, high-performance real-time messaging and social hybrid platform built with a futuristic cosmic aesthetic. It combines the immediacy of real-time chat with a visual "Cosmic Feed" powered by generative AI.

## 🚀 Architectural Overview

VibeChat leverages a cutting-edge serverless architecture optimized for low latency and high scalability.

- **Frontend**: React 19 / Next.js 15 (App Router)
- **Real-Time Engine**: Firebase Firestore with persistent listeners for messages and social interactions.
- **AI Integration**: Google Genkit + Gemini 2.5 Flash + Imagen 3 for visual manifestations and smart reply suggestions.
- **Identity**: Persistent Guest Identity system with local persistence and Firestore synchronization.
- **Styling**: Tailwind CSS with custom Glassmorphism primitives and a specialized HSL theme.
- **Animations**: Framer Motion for interactive feedback and smooth state transitions.

## ✨ Core Features

### 1. Cosmic Social Feed
- **Manifest Moments**: Create visual posts using AI. Input a prompt, and Google's Imagen model generates a high-fidelity cosmic illustration.
- **Social Interaction**: Like and react to transmissions from other explorers across the network.
- **Visual-First UI**: High-resolution media presentation with dynamic gradients and blur effects.

### 2. High-Performance Chat
- **Real-Time Channels**: Scalable messaging via Firestore, supporting instant delivery and global presence.
- **Smart Replies**: Context-aware AI suggestions powered by Gemini 2.5.
- **In-Chat Search**: Instant filtering of transmissions using local search primitives.

### 3. Identity & Presence
- **Zero-Friction Entry**: Persistent guest identities allow immediate network access.
- **Live Indicators**: Real-time online/offline status reflecting network activity.

## 🛠 Technical Specifications

### Offline Resilience
The platform utilizes **Firestore Persistent Listeners** (`onSnapshot`) for all critical data paths, ensuring functionality during network interruptions.

### Hydration Resilience
VibeChat implements a strict `mounted` state pattern across all client components to resolve SSR challenges in Next.js, ensuring browser-specific attributes do not trigger hydration mismatches.

### AI Flows (Genkit)
- `suggestSmartReplies`: Analyzes conversation context for rapid communication.
- `generateCosmicMedia`: Transforms text prompts into ethereal space art using Imagen 3.

---

*VibeChat: Bridging the gap between cosmic inspiration and real-time connectivity.*
