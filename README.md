# Tamer Akdeniz - Personal Portfolio (React & Next.js)

**Demo:** [https://tamerakdeniz.com](https://tamerakdeniz.com)

A personal portfolio project developed using modern web technologies, featuring a dynamic, multi-language supported, and manageable (with Admin Panel) setup. This project aims to provide a seamless user experience for visitors while allowing real-time content updates via a management panel.

## 🚀 About the Project

This application is built on the Next.js (App Router) architecture. It offers a user-friendly interface powered by high-performance server-side rendering (SSR/SSG), modern state management, and fluid animations. Concurrently, through Firebase integration, content such as projects, experiences, and messages are dynamically fetched and managed from a realtime database.

### Key Features

- **Dynamic Content Management:** Real-time data flow with Firebase Realtime Database.
- **Admin Panel:** Content addition, editing, and deletion via a comprehensive admin panel.
- **Drag & Drop:** Easily reorder items in the admin panel with `@dnd-kit` integration.
- **Multi-language Support:** Turkish and English language options using `i18next` and `react-i18next`.
- **Animated Interface:** Transitions and interactions enriched with `framer-motion`.
- **AI Integration:** AI-supported modules or assistant capabilities via `@google/generative-ai`.
- **Secure Authentication:** Admin routes protected by Firebase Authentication.
- **Responsive Design:** Fully responsive layout for all mobile/desktop devices using Tailwind CSS.

## 🛠 Tech Stack

The following technologies and libraries form the foundation of the project:

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling & Design:** Tailwind CSS v4
- **State Management:** Zustand
- **Database & Backend:** Firebase (Realtime Database)
- **Authentication:** Firebase Authentication
- **Animation:** Framer Motion
- **Form Management:** React Hook Form
- **Internationalization (i18n):** i18next
- **Artificial Intelligence:** Google Generative AI (Gemini)

## 📊 Detailed Analysis and Architecture

The project utilizes a modular and scalable React architecture on the frontend, while relying on Firebase, a serverless architecture, on the backend.

### Directory Structure and Roles

- `/src/app/` : General and admin routes conforming to the Next.js App Router structure.
- `/src/admin/` : Management UI components and sub-architecture specific to the admin panel.
- `/src/components/` : Reusable UI components.
- `/src/store/` : Global state slices created with Zustand.
- `/src/lib/` : Firebase configurations, i18n settings, and utility functions.
- `/src/locales/` : Local JSON/TR-EN texts for in-app translation keywords.
- `/src/hooks/` : Custom database or state logic hooks.
- `/src/types/` : TypeScript interfaces and type definitions.

## 🔄 Data Flow & Architecture Diagram

The fundamental data flow and connection diagram of the system are as follows.

```mermaid
graph TD
    %% Visitor Flow
    subgraph "Client (Visitor)"
        UI[User Interface / Browser]
        Z[Zustand Store]
        I18[i18next - Language Selection]
    end

    %% Admin Flow
    subgraph "Client (Admin)"
        AdminUI[Admin Panel]
        DND[Drag & Drop Architecture]
    end

    %% Application Core
    subgraph "Next.js (Frontend & SSR/SSG)"
        AppRouter[App Router / Pages]
        Components[UI Components]
    end

    %% Backend Services
    subgraph "Backend Services"
        FB_Auth[Firebase Authentication]
        FB_RTDB[(Firebase Realtime DB)]
        Gemini[Google Generative AI]
    end

    %% Visitor Interactions
    UI <--> |Interactions| Z
    UI <--> |Fetch Translations| I18
    UI --> |Render Pages| AppRouter
    AppRouter --> Components

    %% Data Fetching (Read)
    AppRouter -.-> |Read Data (Client/SSR)| FB_RTDB
    Z -.-> |Data Sync| FB_RTDB

    %% Admin Interactions
    AdminUI --> |Login Request| FB_Auth
    FB_Auth --> |Authorization Confirmed| AdminUI
    AdminUI <--> |CRUD Operations, Update| FB_RTDB
    AdminUI <--> |Reordering| DND

    %% AI Integration
    AppRouter -.-> |AI Requests| Gemini
```

### Flowchart Analysis:
1. **Visitor Flow:** When a user visits the site, the `Next.js App Router` delivers optimized pages. Interface animations (`Framer Motion`) and global states (`Zustand`) are managed on the client side. Portfolio content is fetched from the `Firebase Realtime DB`. The `i18next` module securely manages instant language switching.
2. **Admin Flow:** When an administrator accesses their route, the `Firebase Authentication` security layer is activated. The admin can reorder items via drag-and-drop using `dnd-kit` and perform direct read-write (CRUD) operations on the `Firebase Realtime DB`.
3. **AI Flow:** The integrated Google AI service communicates directly with the `Next.js` server via API for any AI-powered integrations within the site.

## 💻 Installation and Running

### Requirements
- Node.js (v18+)
- npm / yarn
- Firebase Account

### Steps

1. **Clone the repository and install dependencies:**
```bash
git clone <repository_url>
cd tamerakdeniz-react
npm install
```

2. **Configure Environment Variables (.env.local):**
Fill in the necessary API Keys to link the project with `Firebase` and `Google AI`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
# If required:
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

3. **Start the development server:**
```bash
npm run dev
```

You can view the project by navigating to [http://localhost:3000](http://localhost:3000).

## 🔒 Firebase Security (Rules)

To safeguard manipulations within the admin panel, all database read/write rules are configured in `database.rules.json`. Only (*Authenticated*) users can perform CRUD operations on the data, whereas guest visitors can only access corresponding data in a (*Read-Only*) manner.
