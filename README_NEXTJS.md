# Amrita Vidyalayam - School Management System (Next.js)

A modern, comprehensive school management system built with Next.js 14, TypeScript, and Tailwind CSS. This system includes separate editable timetables for each class-section combination with role-based access control.

## 🚀 Features

### Core Features
- **Role-Based Authentication**: Separate interfaces for Admin, Teacher, Student, and Driver
- **Timetable Management**: 
  - ✅ Separate timetables for each class-section combination
  - ✅ Admin can edit timetables with real-time updates
  - ✅ View-only mode for teachers and students
  - ✅ Last updated timestamp and user tracking
- **Student Management**: Track student information, attendance, and performance
- **Teacher Management**: Manage teacher assignments and class responsibilities
- **Attendance Tracking**: Mark and monitor attendance by class and section
- **Marks Management**: Enter and track student marks across subjects
- **Announcements**: Broadcast important information to specific user groups

### Technical Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **In-Memory Database** (easily replaceable with real database)
- **RESTful API Routes** for all CRUD operations
- **Responsive Design** - works on desktop, tablet, and mobile

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sms1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

Use these credentials to login:

| Role    | Email         | Password |
|---------|---------------|----------|
| Admin   | admin@123     | admin    |
| Teacher | teacher@123   | teacher  |
| Student | student@123   | student  |
| Driver  | driver@123    | driver   |

## 📁 Project Structure

```
Sms1/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── timetable/    # Timetable CRUD operations
│   │   │   ├── students/     # Student management
│   │   │   ├── teachers/     # Teacher management
│   │   │   └── announcements/
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/            # Login page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page (redirects to login)
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── TimetableComponent.tsx  # Editable timetable component
│   └── lib/
│       └── database.ts       # In-memory database (fake backend)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Timetable
- `GET /api/timetable?class=5&section=A` - Get timetable for specific class-section
- `GET /api/timetable` - Get all timetables
- `POST /api/timetable` - Create new timetable
- `PUT /api/timetable` - Update existing timetable

### Students
- `GET /api/students` - Get all students
- `GET /api/students?class=5&section=A` - Get students by class-section
- `POST /api/students` - Add new student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Add new teacher

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create new announcement

## 🎯 Key Features Explained

### Timetable Management

The timetable system has been completely redesigned to fix the issues in the original HTML version:

1. **Separate Timetables**: Each class-section combination (e.g., Class 5-A, Class 5-B) has its own unique timetable
2. **Admin Editing**: Only admins can edit timetables through an intuitive inline editing interface
3. **Real-time Updates**: Changes are saved immediately and reflected across the system
4. **Audit Trail**: Track who last updated the timetable and when

### In-Memory Database

The current implementation uses an in-memory database (`src/lib/database.ts`) which:
- Stores all data in JavaScript Maps
- Persists data only during the server runtime
- Is easily replaceable with a real database

### Adding a Real Database

To integrate a real database (PostgreSQL, MySQL, MongoDB, etc.):

1. **Install database client**
   ```bash
   npm install prisma @prisma/client  # For Prisma ORM
   # OR
   npm install mongoose  # For MongoDB
   ```

2. **Update `src/lib/database.ts`**
   - Replace Map operations with actual database queries
   - Keep the same interface for seamless integration

3. **Add environment variables**
   ```
   DATABASE_URL=your_database_connection_string
   ```

4. **Update API routes** (no changes needed if you maintain the same interface)

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🎨 Customization

### Styling
- Edit `src/app/globals.css` for global styles
- Modify `tailwind.config.js` for theme customization
- Update color variables in the CSS for brand colors

### Adding New Features
1. Create new API route in `src/app/api/[feature]/route.ts`
2. Add corresponding component in `src/components/`
3. Update dashboard menu items
4. Add database methods in `src/lib/database.ts`

## 📝 Migration from HTML Version

This Next.js version replaces the original HTML/JavaScript implementation with:
- ✅ Server-side rendering and API routes
- ✅ TypeScript for better code quality
- ✅ Modern React components
- ✅ Proper state management
- ✅ Fixed timetable issues (separate per class-section)
- ✅ Admin-editable interface
- ✅ Ready for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions, please open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] JWT-based authentication
- [ ] File upload for student photos
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced analytics and reports
- [ ] Mobile app (React Native)
- [ ] PWA support
- [ ] Export to PDF/Excel
- [ ] Multi-language support

---

Built with ❤️ for Amrita Vidyalayam Ettimadai
