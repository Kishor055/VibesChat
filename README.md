# VibeChat | High-Performance Cosmic Communication Engine

VibeChat is an enterprise-grade real-time social and communication platform designed with a futuristic cosmic aesthetic. It merges high-speed messaging with AI-driven social interaction features.

## 🚀 Technological Foundation

- **Framework**: Next.js 15 (App Router) with React 19.
- **Real-Time Engine**: Firestore with persistent `onSnapshot` listeners for seamless offline/online state management.
- **Generative AI**: Google Genkit integrated with Gemini 2.5 Flash and Imagen 3.0 for visual manifestation and smart contextual replies.
- **Identity**: Persistent Guest Identity system with Firestore synchronization and local persistence.
- **Styling**: Tailwind CSS with custom Glassmorphism primitives and specialized HSL themes.

## ✨ Core Feature Set

### 1. Cosmic Social Graph
- **Stories**: Ephemeral 24-hour visual transmissions.
- **Global Pulse (Feed)**: AI-generated visual posts where explorers share cosmic moments.
- **AI Avatar Forge**: Manifest unique identities using high-fidelity Imagen 3 generation.
- **Social Interactions**: Real-time reactions, likes, and sector-wide broadcasting.

### 2. Deep-Space Messaging
- **Dynamic Sectors**: Create and manage scalable communication hubs via Firestore.
- **Smart Replies**: Context-aware AI response suggestions powered by Gemini.
- **Encrypted Channels**: High-integrity data synchronization with optimistic UI mutations.

### 3. Identity & Presence
- **Zero-Friction Access**: Automatic guest profile creation with persistence.
- **Global Presence**: Real-time status indicators across the entire social graph.

## 🛠 Engineering Specifications

### Hydration Safety
VibeChat implements a strict `mounted` state pattern across all client-side components to resolve SSR challenges in Next.js 15, ensuring browser-injected attributes (like those from extensions) and locale-specific data do not trigger mismatches.

### AI Integration (Genkit)
- `generateCosmicMedia`: Transforms text prompts into ethereal space art.
- `generateAiAvatar`: Forges high-quality profile identities.
- `suggestSmartReplies`: Analyzes channel context for rapid communication.

---

*VibeChat: Bridging the cosmic gap through AI-driven connectivity.*
