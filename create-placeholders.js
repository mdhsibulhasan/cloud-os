// Script to create placeholder images as proper SVG files
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'client/public/assets/images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const uploadsDir = path.join(__dirname, 'client/public/assets/uploads');
const thumbDir = path.join(uploadsDir, 'thumbnails');
const profileDir = path.join(uploadsDir, 'profiles');
[uploadsDir, thumbDir, profileDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// SVG profile placeholder
const profileSVG = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#064e3b"/>
      <stop offset="100%" stop-color="#022c22"/>
    </radialGradient>
  </defs>
  <circle cx="100" cy="100" r="100" fill="url(#bg)"/>
  <circle cx="100" cy="100" r="98" fill="none" stroke="#00ff88" stroke-width="2" opacity="0.6"/>
  <circle cx="100" cy="80" r="30" fill="#00ff88" opacity="0.9"/>
  <ellipse cx="100" cy="145" rx="45" ry="30" fill="#00ff88" opacity="0.7"/>
  <text x="50%" y="50%" font-family="Arial,sans-serif" font-size="48" font-weight="bold"
    fill="#00ff88" text-anchor="middle" dominant-baseline="middle" opacity="0.3">MH</text>
</svg>`;

// SVG favicon
const faviconSVG = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="12" fill="#022c22"/>
  <text x="50%" y="54%" font-family="Arial,sans-serif" font-size="32" font-weight="bold"
    fill="#00ff88" text-anchor="middle" dominant-baseline="middle">C</text>
</svg>`;

// Default avatar
const avatarSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#0a1a12"/>
  <circle cx="50" cy="50" r="49" fill="none" stroke="#00ff88" stroke-width="1.5" opacity="0.4"/>
  <circle cx="50" cy="40" r="16" fill="#00ff88" opacity="0.7"/>
  <ellipse cx="50" cy="72" rx="22" ry="14" fill="#00ff88" opacity="0.5"/>
</svg>`;

// Default PDF thumb
const pdfThumbSVG = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#0a1a12"/>
  <rect x="1" y="1" width="298" height="398" fill="none" stroke="#00ff88" stroke-width="1" opacity="0.3"/>
  <rect x="40" y="60" width="220" height="8" rx="4" fill="#00ff88" opacity="0.3"/>
  <rect x="40" y="80" width="180" height="6" rx="3" fill="#00ff88" opacity="0.2"/>
  <rect x="40" y="100" width="200" height="6" rx="3" fill="#00ff88" opacity="0.2"/>
  <rect x="40" y="120" width="160" height="6" rx="3" fill="#00ff88" opacity="0.2"/>
  <rect x="40" y="160" width="220" height="100" rx="6" fill="#00ff88" opacity="0.08"/>
  <text x="150" y="220" font-family="Arial" font-size="36" fill="#00ff88" text-anchor="middle" opacity="0.5">PDF</text>
  <rect x="40" y="280" width="220" height="6" rx="3" fill="#00ff88" opacity="0.15"/>
  <rect x="40" y="298" width="180" height="6" rx="3" fill="#00ff88" opacity="0.1"/>
  <rect x="40" y="316" width="200" height="6" rx="3" fill="#00ff88" opacity="0.1"/>
</svg>`;

// Default thumb
const defaultThumbSVG = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#0a1a12"/>
  <rect x="1" y="1" width="298" height="198" fill="none" stroke="#00ff88" stroke-width="1" opacity="0.3"/>
  <text x="150" y="105" font-family="Arial" font-size="48" fill="#00ff88" text-anchor="middle" opacity="0.4">📄</text>
</svg>`;

const files = {
  'profile.png': profileSVG,
  'favicon.png': faviconSVG,
  'default-avatar.png': avatarSVG,
  'default-pdf-thumb.jpg': pdfThumbSVG,
  'default-thumb.jpg': defaultThumbSVG,
};

Object.entries(files).forEach(([name, content]) => {
  const p = path.join(imagesDir, name);
  fs.writeFileSync(p, content);
  console.log('✓ Created', name);
});

console.log('\n✅ All placeholder images created!');
console.log('📁', imagesDir);
