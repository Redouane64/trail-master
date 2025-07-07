# Trail Creator Application

## Overview

This is a full-stack web application for creating and managing hiking trails. The application features an interactive map interface where users can draw trail routes by clicking points, and a comprehensive form system for capturing trail metadata. Built with React, Express, TypeScript, and PostgreSQL, it uses modern UI components and real-time map interactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Map Integration**: React Leaflet for interactive mapping
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript (minimal server)
- **API Design**: Simple health check endpoint only
- **GraphQL Submission**: Direct client-side submission to external GraphQL service
- **Authentication**: JWT token validation for GraphQL requests
- **Development**: Vite for development server and HMR
- **Storage**: No database - single trail workflow only

### Build System
- **Build Tool**: Vite for frontend bundling
- **Backend Build**: esbuild for server compilation
- **TypeScript**: Strict mode with path mapping
- **Package Management**: npm with lock file

## Key Components

### Interactive Map System
- **Map Library**: Leaflet with React Leaflet bindings
- **Drawing Mode**: Click-to-add points functionality
- **Trail Visualization**: Polyline rendering with start/end markers
- **Real-time Stats**: Distance, elevation, and time calculations
- **Point Management**: Individual point removal and trail clearing

### Trail Creation Form
- **Validation**: Zod schema validation with error handling
- **Form Management**: React Hook Form for controlled inputs
- **Data Structure**: Name, description, location, and metadata fields
- **Real-time Feedback**: Live validation and submission states

### UI Components
- **Design System**: shadcn/ui with consistent theming
- **Responsive Design**: Mobile-first approach with breakpoint handling
- **Accessibility**: ARIA compliant components
- **Notifications**: Toast system for user feedback

## Data Flow

### Single Trail Creation Process
1. User interacts with map to place points
2. Points are stored in local React state only
3. Form captures trail information with client-side validation
4. On submission, GraphQL mutation query is generated and displayed in popup
5. No database storage - trail exists only during creation session
6. Users can copy GraphQL query for use with external services

### Data Structure
- **Trail Points**: Latitude/longitude coordinates stored in browser state
- **Metadata**: Distance, time calculations done client-side
- **Location Data**: Country, city, and geographic coordinates for GraphQL generation
- **GraphQL Output**: Generated mutation queries ready for external service use

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Database Migrations**: Drizzle Kit for schema management

### Map Services
- **Leaflet**: Open-source mapping library
- **Tile Servers**: OpenStreetMap tile providers
- **Marker Icons**: Custom colored markers for trail points

### UI & Styling
- **Radix UI**: Headless component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: SVG icon library

### Development Tools
- **Replit Integration**: Development environment support
- **Runtime Error Overlay**: Development error handling
- **Cartographer**: Development tooling (Replit-specific)

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Served directly by Express in production

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Development Mode**: NODE_ENV detection for development features
- **Session Configuration**: PostgreSQL session storage setup

### Database Management
- **Schema Migrations**: `npm run db:push` for schema deployment
- **Connection Pooling**: Neon serverless handles connection management

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Added JWT authentication system with manual token input UI for secure GraphQL trail submissions
- July 07, 2025. Removed database/storage logic, implemented single-trail workflow with direct GraphQL submission
- July 07, 2025. Removed JWT authentication, implemented GraphQL query generation popup display instead of API submission

## Recent Changes
✓ Single-trail workflow implemented (no database storage)
✓ Removed all in-memory database and PostgreSQL dependencies
✓ Removed JWT authentication UI and logic completely
✓ GraphQL query generation popup instead of API submission
✓ Fixed time input validation to handle minute values correctly
✓ Simplified schema to focus on trail creation and query generation
✓ Updated backend to minimal health check endpoint only
✓ Users can create one trail at a time: generate GraphQL query or start fresh

## User Preferences

Preferred communication style: Simple, everyday language.
Requirements: Backend requires JWT authentication for trail submissions via GraphQL