# Migration Guide: HTML/JS to Next.js

## Overview
This document explains the migration from the original HTML/JavaScript implementation to Next.js with TypeScript.

## Key Changes

### 1. Architecture
- **Before**: Static HTML with client-side JavaScript
- **After**: Next.js with server-side rendering, API routes, and React components

### 2. Timetable Fix
**Problem**: In the original version, all class-sections shared the same timetable
**Solution**: 
- Each class-section now has a unique timetable stored with key `{class}-{section}`
- Example: "5-A", "5-B", "11-A", "11-B" each have different timetables
- Admin can edit each timetable independently

### 3. Data Storage
- **Before**: Global variables in JavaScript
- **After**: In-memory database with proper TypeScript interfaces
- **Future**: Easy to replace with PostgreSQL, MongoDB, etc.

### 4. Authentication
- **Before**: Simple client-side validation
- **After**: API-based authentication with role-based access
- **Future**: Add JWT tokens and secure sessions

## File Mapping

| Old File | New File | Purpose |
|----------|----------|---------|
| `index.html` | `src/app/dashboard/page.tsx` | Main dashboard |
| `js/main.js` | Multiple components + API routes | Split into logical pieces |
| `js/data/sampleData.js` | `src/lib/database.ts` | Centralized data management |
| `css/styles.css` | `src/app/globals.css` | Global styling with Tailwind |

## API Routes Created

1. **Authentication**: `/api/auth/login`
2. **Timetable**: `/api/timetable` (GET, POST, PUT)
3. **Students**: `/api/students` (GET, POST)
4. **Teachers**: `/api/teachers` (GET, POST)
5. **Announcements**: `/api/announcements` (GET, POST)

## Database Structure

### Timetable Schema
```typescript
interface Timetable {
  id: string;              // Format: "{class}-{section}"
  class: string;           // "5", "11", etc.
  section: string;         // "A", "B", "C", "D"
  schedule: {
    [day: string]: {       // "Monday", "Tuesday", etc.
      [period: string]: string;  // "1", "2", ... "7"
    };
  };
  lastUpdated: string;     // ISO timestamp
  updatedBy: string;       // User who last edited
}
```

## Running the Application

### Development
```bash
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Testing the Timetable Fix

1. Login as **Admin** (admin@123 / admin)
2. Navigate to **Timetable** from sidebar
3. Select **Class 5**, **Section A** → See unique timetable
4. Click **Edit Timetable** button
5. Modify any subject
6. Click **Save Changes**
7. Change to **Class 5**, **Section B** → See different timetable
8. Verify the timetables are separate and independently editable

## Adding a Real Database

### Option 1: PostgreSQL with Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

Edit `prisma/schema.prisma`:
```prisma
model Timetable {
  id          String   @id
  class       String
  section     String
  schedule    Json
  lastUpdated DateTime @default(now())
  updatedBy   String

  @@unique([class, section])
}
```

Update `src/lib/database.ts` to use Prisma:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTimetable(classId: string, section: string) {
  return await prisma.timetable.findUnique({
    where: {
      class_section: {
        class: classId,
        section: section
      }
    }
  });
}
```

### Option 2: MongoDB with Mongoose

```bash
npm install mongoose
```

Create `src/lib/models/Timetable.ts`:
```typescript
import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  class: String,
  section: String,
  schedule: Object,
  lastUpdated: Date,
  updatedBy: String
});

export default mongoose.models.Timetable || 
  mongoose.model('Timetable', TimetableSchema);
```

## Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/school_db"

# Or for MongoDB
MONGODB_URI="mongodb://localhost:27017/school_db"

# JWT Secret (for future auth)
JWT_SECRET="your-secret-key-here"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Features to Implement Next

1. **Attendance Module**: Mark and track attendance
2. **Marks Entry**: Enter exam marks with validation
3. **Report Generation**: PDF reports for students
4. **Bus Tracking**: Real-time GPS tracking
5. **Notifications**: Email/SMS for important updates
6. **File Uploads**: Student photos, documents
7. **Advanced Analytics**: Charts and graphs

## Troubleshooting

### Issue: "Cannot find module 'next'"
Solution: Run `npm install`

### Issue: Port 3000 already in use
Solution: Use different port: `PORT=3001 npm run dev`

### Issue: TypeScript errors
Solution: Run `npm run build` to see all errors

## Support

For questions or issues:
1. Check the README_NEXTJS.md
2. Review API documentation in code comments
3. Open an issue on GitHub

---

Migration completed on: November 5, 2025
