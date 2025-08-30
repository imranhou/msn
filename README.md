# MyShareNow - Commission Tracking System

A real-time commission tracking system for car dealership sales teams.

## Project Structure

This is a monorepo containing both frontend and backend applications:

- `apps/portal`: React frontend with TypeScript and Tailwind CSS
- `apps/backend`: NestJS backend with Drizzle ORM and PostgreSQL

## Features

- Admin dashboard for uploading deal information via Excel spreadsheets
- Real-time commission calculations based on configurable rules
- Sales agent dashboard to view commission data
- Mobile-responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Mobile-responsive design

### Backend
- NestJS framework
- PostgreSQL database
- Drizzle ORM for database operations
- File upload handling for Excel spreadsheets

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Database Setup
1. Create a PostgreSQL database named `mysharenow`
2. Update the database connection details in `apps/backend/.env` if needed

### Backend Setup
```bash
cd apps/backend
npm install
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run start:dev    # Start the development server on port 4001
```

### Frontend Setup
```bash
cd apps/portal
npm install
npm start            # Start the development server on port 4000
```

## Usage

### Admin Role
- Upload Excel spreadsheets containing deal information
- Configure commission rules for sales agents
- View overall sales performance

### Sales Agent Role
- View real-time commission data
- Track deals and associated commissions
- Monitor performance metrics

## License
This project is licensed under the MIT License.
