# MD.Hasibul Hasan - Personal Cloud OS

A futuristic, production-ready personal cloud operating system for storing, organizing, and sharing academic resources, PDFs, notes, and personal files.

## Features

- 🔐 Secure JWT authentication with role-based access
- 📁 Hierarchical subject/chapter file organization
- 🚀 Real-time updates via Socket.IO
- 📱 Fully responsive mobile-first design
- 🎨 Cyberpunk-themed UI with glassmorphism
- 🔍 Advanced PDF viewer with performance optimizations
- 💬 User-to-user messaging system
- 📢 Broadcast announcements
- 🎯 Selective file sharing with checkbox interface
- 🌐 3D interactive hero model

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** NeDB (embedded, zero-config)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Real-time:** Socket.IO
- **3D Graphics:** Three.js
- **Animations:** GSAP
- **Security:** JWT, bcrypt, helmet

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Default Admin Account

- **Email:** `hasibulhasan0210@admin.com`
- **Password:** `EverySoulWillTasteDeath,Surah-Al-Anbiya_Verse35`

## Project Structure

```
md-hasibul-cloud/
├── client/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── assets/
│   └── views/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .env
└── package.json
```

## Usage

1. **Admin:** Log in with the default admin account to manage users, subjects, chapters, and files
2. **Users:** Sign up and wait for admin approval to access the system
3. **File Management:** Upload files to subjects/chapters or personal storage
4. **Sharing:** Use the checkbox interface to share files with specific users
5. **Messaging:** Communicate with other approved users in real-time

## Security

- All passwords are hashed with bcrypt
- JWT tokens stored in httpOnly cookies
- Rate limiting on authentication endpoints
- Input validation on all API endpoints
- Helmet.js for security headers

## Performance

- Lazy loading for images and assets
- Virtualized PDF rendering
- GPU-accelerated animations
- Response compression
- Efficient 3D model rendering

## License

MIT License - Personal Project

---

Built with ❤️ by MD.Hasibul Hasan
