# 🚀 Quick Start Guide - MD.Hasibul Hasan Personal Cloud OS

## ⚡ Fast Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Placeholder Images
```bash
node create-placeholders.js
```

### Step 3: Start the Server
```bash
npm start
```

That's it! Open http://localhost:3000 in your browser.

---

## 🔐 Login Credentials

**Admin Account:**
- Email: `hasibulhasan0210@admin.com`
- Password: `EverySoulWillTasteDeath,Surah-Al-Anbiya_Verse35`

---

## 📋 What You Get

### ✨ Features
- ✅ Futuristic cyberpunk UI with glassmorphism
- ✅ Unique 3D crystalline dodecahedron hero model
- ✅ Advanced PDF viewer with performance optimizations
- ✅ Real-time updates via Socket.IO
- ✅ Hierarchical subject/chapter organization
- ✅ Selective file sharing with checkbox interface
- ✅ Mobile-responsive with hamburger menu
- ✅ User approval system
- ✅ Broadcast announcements
- ✅ Messaging system
- ✅ Role-based access control

### 🎨 Design
- Emerald green and cyan color scheme
- Holographic effects and neon glows
- Smooth GPU-accelerated animations
- Mobile-first responsive design
- Touch-friendly interface

### 🔒 Security
- JWT authentication with httpOnly cookies
- bcrypt password hashing
- Rate limiting
- Input validation
- Helmet.js security headers

---

## 🎯 First Steps After Login

### As Admin:
1. Go to Admin Panel (shield icon in sidebar)
2. Create subjects (e.g., Physics, Chemistry)
3. Add chapters to subjects
4. Upload files to chapters
5. Approve pending user registrations
6. Create broadcast announcements

### As User:
1. Sign up and wait for admin approval
2. Browse subjects and chapters
3. View and download files
4. Upload personal files
5. Share files with other users
6. Check notifications

---

## 📁 Project Structure

```
md-hasibul-cloud/
├── client/
│   ├── public/
│   │   ├── css/              # Stylesheets
│   │   │   ├── global.css    # Main styles
│   │   │   ├── animations.css # Animations
│   │   │   └── mobile.css    # Mobile styles
│   │   ├── js/               # Client scripts
│   │   │   ├── main.js       # Core functions
│   │   │   ├── 3d-model.js   # Three.js 3D model
│   │   │   ├── dashboard.js  # Dashboard logic
│   │   │   ├── admin.js      # Admin panel
│   │   │   ├── explorer.js   # File explorer
│   │   │   ├── pdf-viewer.js # PDF viewer
│   │   │   └── performance.js # Optimizations
│   │   └── assets/
│   │       ├── images/       # Images (auto-created)
│   │       └── uploads/      # User uploads (auto-created)
│   └── views/                # EJS templates
│       ├── index.ejs         # Home page
│       ├── auth.ejs          # Login/Signup
│       ├── dashboard.ejs     # User dashboard
│       ├── admin.ejs         # Admin panel
│       ├── explorer.ejs      # Subject explorer
│       ├── about.ejs         # About page
│       ├── contact.ejs       # Contact page
│       └── 404.ejs           # Error page
├── server/
│   ├── config/
│   │   ├── db.js             # NeDB setup
│   │   └── auth.js           # JWT config
│   ├── middleware/
│   │   ├── auth.js           # Auth middleware
│   │   └── upload.js         # Multer config
│   ├── controllers/          # Business logic
│   ├── routes/               # API routes
│   ├── utils/                # Utilities
│   ├── app.js                # Express app
│   └── server.js             # Server entry
├── data/                     # Database (auto-created)
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                 # Documentation
```

---

## 🛠️ Development Commands

```bash
# Start with auto-reload
npm run dev

# Start production server
npm start

# Create placeholder images
node create-placeholders.js
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get files
- `GET /api/files/preview/:id` - Stream file
- `POST /api/files/share` - Share file
- `DELETE /api/files/:id` - Delete file

### Subjects & Chapters
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (admin)
- `GET /api/subjects/:id/chapters` - Get chapters
- `POST /api/subjects/:id/chapters` - Create chapter (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/settings` - Site settings
- `PUT /api/admin/settings` - Update settings

---

## 🎨 Customization

### Change Colors
Edit `client/public/css/global.css`:
```css
:root {
  --primary: #10b981;      /* Main color */
  --secondary: #06b6d4;    /* Secondary color */
  --accent: #8b5cf6;       /* Accent color */
}
```

### Change Site Info
Login as admin → Admin Panel → Settings

### Add Your Images
Replace files in `client/public/assets/images/`:
- `profile.png` - Your profile picture
- `favicon.png` - Your favicon

---

## 📱 Mobile Features

- ✅ Hamburger menu for navigation
- ✅ Touch-friendly 44px tap targets
- ✅ Swipe gestures for PDF pages
- ✅ Pinch-to-zoom support
- ✅ Optimized animations
- ✅ Responsive grid layouts

---

## 🐛 Troubleshooting

### Port 3000 already in use?
Change PORT in `.env` file:
```env
PORT=3001
```

### Images not showing?
Run: `node create-placeholders.js`

### Database errors?
Delete `data/` folder and restart server.

### PDF viewer not working?
Check internet connection (PDF.js loads from CDN).

---

## 🚀 Production Deployment

1. Update `.env`:
```env
NODE_ENV=production
JWT_SECRET=your-very-secure-random-string-here
```

2. Install PM2:
```bash
npm install -g pm2
pm2 start server/server.js --name cloud-os
pm2 save
pm2 startup
```

3. Set up HTTPS (required for production)

---

## 📚 Key Technologies

- **Backend:** Node.js, Express.js
- **Database:** NeDB (embedded, zero-config)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Real-time:** Socket.IO
- **3D Graphics:** Three.js
- **Authentication:** JWT, bcrypt
- **File Upload:** Multer
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate Limiting

---

## 💡 Tips

1. **First Time?** Create a test user account to see the user experience
2. **Testing?** Use the admin account to approve your test user
3. **Organizing?** Create subjects like "Physics", "Math", then add chapters
4. **Sharing?** Upload a file, click share, select users with checkboxes
5. **Mobile?** Test on your phone - it's fully responsive!

---

## 📞 Support

Need help? Check:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- Code comments - Inline documentation

---

## ✅ Checklist

- [ ] Ran `npm install`
- [ ] Created placeholder images
- [ ] Started server
- [ ] Logged in as admin
- [ ] Created a subject
- [ ] Uploaded a file
- [ ] Created a test user
- [ ] Approved test user
- [ ] Tested file sharing
- [ ] Checked mobile view

---

**🎉 Enjoy your Personal Cloud OS!**

Built with ❤️ by MD.Hasibul Hasan
