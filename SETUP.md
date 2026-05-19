# Setup Instructions - MD.Hasibul Hasan Personal Cloud OS

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Required Images

Create or add the following images to `client/public/assets/images/`:

- **profile.png** - Admin profile picture (150x150px recommended)
- **favicon.png** - Site favicon (32x32px or 64x64px)
- **default-avatar.png** - Default user avatar (100x100px)
- **default-thumb.jpg** - Default file thumbnail (300x400px)
- **default-pdf-thumb.jpg** - Default PDF thumbnail (300x400px)

You can use placeholder images or create simple colored rectangles for testing.

### 3. Environment Configuration

The `.env` file is already configured with default values. You can modify:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Start the Server

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Default Admin Account

- **Email:** `hasibulhasan0210@admin.com`
- **Password:** `EverySoulWillTasteDeath,Surah-Al-Anbiya_Verse35`

## Project Structure

```
md-hasibul-cloud/
├── client/
│   ├── public/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # Client-side JavaScript
│   │   └── assets/        # Images and uploads
│   └── views/             # EJS templates
├── server/
│   ├── config/            # Database and auth config
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── utils/             # Utility functions
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
├── data/                  # NeDB database files (auto-created)
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # Documentation
```

## Features

### For Admin
- Complete user management (approve, suspend, delete)
- Subject and chapter organization
- File approval system
- Broadcast announcements
- Site settings management
- Upload academic results
- Real-time dashboard statistics

### For Users
- Browse subjects and chapters
- View and download files (if permitted)
- Upload personal files (requires approval)
- Share files with other approved users
- Real-time notifications
- Advanced PDF viewer with optimizations
- Messaging system

## Database

The application uses NeDB (embedded database) which creates `.db` files in the `data/` directory automatically. No external database setup required.

## Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Rate limiting on authentication endpoints
- Input validation with Joi
- Helmet.js security headers
- Role-based access control

## Performance Optimizations

- Lazy loading for images
- Virtualized PDF rendering
- GPU-accelerated animations
- Response compression
- Efficient 3D model rendering
- Mobile-optimized animations
- Battery-aware performance mode

## Mobile Support

- Fully responsive design
- Touch-friendly interface (44px minimum tap targets)
- Swipe gestures for PDF navigation
- Pinch-to-zoom support
- Collapsible mobile sidebar
- Optimized animations for mobile devices

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the PORT in `.env` file.

### Images Not Loading
Ensure all required images are placed in `client/public/assets/images/`.

### Database Errors
Delete the `data/` directory and restart the server to recreate the database.

### PDF Viewer Not Working
Ensure you have a stable internet connection as PDF.js is loaded from CDN.

## Development

### Adding New Features
1. Create controller in `server/controllers/`
2. Add routes in `server/routes/`
3. Update frontend JavaScript in `client/public/js/`
4. Add views in `client/views/` if needed

### Modifying Styles
- Global styles: `client/public/css/global.css`
- Animations: `client/public/css/animations.css`
- Mobile: `client/public/css/mobile.css`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` to a strong random string
3. Configure proper CORS origins in `server/app.js`
4. Set up HTTPS (required for service workers and secure cookies)
5. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "cloud-os"
   ```

## Support

For issues or questions, contact the administrator at:
hasibulhasan0210@admin.com

---

Built with ❤️ by MD.Hasibul Hasan
