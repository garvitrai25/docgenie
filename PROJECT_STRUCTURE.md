# AI Document Analysis Platform - Project Structure

## Complete File Structure

```
AI-Document-Analysis-Platform/
├── 📁 client/                          # Frontend React Application
│   ├── index.html                      # Main HTML template
│   └── src/
│       ├── App.tsx                     # Main app component with routing
│       ├── main.tsx                    # React app entry point
│       ├── index.css                   # Global styles and Tailwind
│       ├── 📁 components/              # React components
│       │   ├── AuthModal.tsx           # Authentication modal
│       │   ├── ChatPanel.tsx           # AI chat interface
│       │   ├── DocumentList.tsx        # Document management
│       │   ├── DocumentUpload.tsx      # File upload component
│       │   ├── FileUploadModal.tsx     # Upload dialog
│       │   ├── Sidebar.tsx             # Navigation sidebar
│       │   └── 📁 ui/                  # shadcn/ui components (50+ files)
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── form.tsx
│       │       ├── input.tsx
│       │       ├── select.tsx
│       │       ├── toast.tsx
│       │       └── ... (40+ more UI components)
│       ├── 📁 hooks/                   # Custom React hooks
│       │   ├── useAuth.tsx             # Firebase authentication
│       │   ├── useChat.tsx             # Chat functionality
│       │   ├── useDocuments.tsx        # Document operations
│       │   ├── use-mobile.tsx          # Mobile detection
│       │   └── use-toast.ts            # Toast notifications
│       ├── 📁 lib/                     # Utilities and configuration
│       │   ├── firebase.ts             # Firebase client setup
│       │   ├── queryClient.ts          # TanStack Query setup
│       │   └── utils.ts                # Helper functions
│       └── 📁 pages/                   # Page components
│           ├── Dashboard.tsx           # Main dashboard
│           └── not-found.tsx           # 404 page
├── 📁 server/                          # Backend Express Application
│   ├── index.ts                        # Server entry point
│   ├── routes.ts                       # API routes definition
│   ├── storage.ts                      # Database operations
│   ├── db.ts                           # Database connection
│   ├── vite.ts                         # Vite integration
│   └── 📁 services/                    # Business logic services
│       ├── firebase.ts                 # Firebase admin operations
│       ├── gemini.ts                   # Google Gemini AI integration
│       └── pdf-parser.ts               # PDF text extraction
├── 📁 shared/                          # Shared types and schemas
│   └── schema.ts                       # Database schema & TypeScript types
├── 📁 Configuration Files
│   ├── package.json                    # Dependencies and scripts
│   ├── package-lock.json               # Dependency lock file
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vite.config.ts                  # Vite build configuration
│   ├── tailwind.config.ts              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   ├── drizzle.config.ts               # Database ORM configuration
│   └── components.json                 # shadcn/ui configuration
├── 📁 Documentation
│   ├── replit.md                       # Project overview and architecture
│   ├── PDF_EXTRACTION_GUIDE.md         # PDF processing guide
│   ├── download-instructions.md        # Local setup instructions
│   └── PROJECT_STRUCTURE.md            # This file
└── 📁 Environment
    ├── .env (configured)               # Environment variables
    ├── .env.example                    # Environment template
    ├── .gitignore                      # Git ignore rules
    └── .replit                         # Replit configuration
```

## Key Architecture Components

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Firebase Auth integration

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Admin SDK
- **File Storage**: Firebase Storage
- **AI Integration**: Google Gemini AI

### Database Schema (PostgreSQL)
- **users**: User accounts linked to Firebase
- **documents**: Uploaded files and processing status
- **documentChunks**: Text chunks for AI context
- **chatSessions**: Conversation sessions
- **chatMessages**: Individual chat messages

### External Services
- **Firebase**: Authentication and file storage
- **Google Gemini AI**: Document analysis and chat responses
- **PostgreSQL**: Persistent data storage
- **Replit**: Development and hosting platform

## Development Workflow
1. **Development**: `npm run dev` - runs both frontend and backend
2. **Database**: `npm run db:push` - deploys schema changes
3. **Build**: Frontend builds to `dist/public`, backend to `dist/index.js`
4. **Deployment**: Ready for Replit deployment or local hosting

## File Counts
- **Total TypeScript/JavaScript files**: 85+
- **React components**: 60+ (including UI library)
- **Server files**: 8
- **Configuration files**: 8
- **Documentation files**: 4

Your AI document analysis platform is a comprehensive full-stack application with professional architecture and modern development practices.