# Document Chat AI Application

## Overview

This is a full-stack document analysis and chat application that allows users to upload PDF and text documents, extract their content, and have AI-powered conversations about the documents using Google's Gemini AI. The application features Firebase authentication, file storage, and a modern React frontend with a Node.js/Express backend.

## System Architecture

The application follows a client-server architecture with the following key components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS styling (shadcn/ui)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Authentication**: Firebase Auth integration
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Admin SDK for token verification
- **File Storage**: Firebase Storage for document uploads
- **AI Integration**: Google Gemini AI for document analysis and chat responses

## Key Components

### Database Schema (PostgreSQL + Drizzle)
- **users**: Stores user information linked to Firebase authentication
- **documents**: Tracks uploaded documents with processing status
- **documentChunks**: Stores text chunks from processed documents for AI context
- **chatSessions**: Manages chat sessions between users and documents
- **chatMessages**: Stores individual chat messages with roles (user/assistant)

### Authentication System
- Firebase Authentication for user management
- JWT token-based API authentication
- Automatic user creation on first login
- Session management with secure token verification

### File Processing Pipeline
1. **Upload**: Files uploaded to Firebase Storage via multipart forms
2. **Text Extraction**: PDF parsing using pdf-parse library
3. **Chunking**: Documents split into manageable chunks for AI processing
4. **Storage**: Extracted text and chunks stored in PostgreSQL
5. **Status Tracking**: Processing status updates (pending → processing → completed/failed)

### AI Chat System
- **Context-Aware Responses**: Uses document chunks as context for AI responses
- **Chat History**: Maintains conversation history for better context
- **Multiple Document Support**: Users can chat with different documents
- **Real-time Updates**: Live chat interface with message streaming

## Data Flow

1. **User Authentication**: Firebase Auth → Backend verification → User session
2. **Document Upload**: Frontend → Firebase Storage → Backend processing → Database storage
3. **Text Processing**: PDF extraction → Text chunking → Database storage
4. **Chat Interaction**: User message → Context retrieval → Gemini AI → Response storage → Frontend update

## External Dependencies

### Core Dependencies
- **@google/genai**: Google Gemini AI integration
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database ORM and query builder
- **firebase-admin**: Server-side Firebase services
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development Environment
- **Dev Server**: `npm run dev` runs both frontend (Vite) and backend (tsx)
- **Database**: PostgreSQL via Replit's built-in database
- **Port Configuration**: Backend on port 5000, proxied through Vite

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Database Migration**: Drizzle handles schema migrations

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_CLIENT_EMAIL`: Service account email
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `GEMINI_API_KEY`: Google Gemini AI API key
- `VITE_FIREBASE_API_KEY`: Frontend Firebase configuration
- `VITE_FIREBASE_APP_ID`: Frontend Firebase app ID

## Changelog
```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```