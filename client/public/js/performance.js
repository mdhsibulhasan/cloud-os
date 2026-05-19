// Performance Optimizations - MD.Hasibul Hasan Personal Cloud OS

// Lazy load images
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Optimize animations based on device performance
function optimizeAnimations() {
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  if (isMobile || isLowEnd) {
    // Reduce animation complexity
    document.documentElement.style.setProperty('--transition-fast', '0.1s');
    document.documentElement.style.setProperty('--transition-normal', '0.2s');
    
    // Disable heavy effects
    document.querySelectorAll('.holographic').forEach(el => {
      el.classList.remove('holographic');
    });
    
    // Reduce blur
    document.querySelectorAll('.glass-card').forEach(el => {
      el.style.backdropFilter = 'blur(5px)';
    });
  }
}

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Handle resize
    if (typeof onWindowResize === 'function') {
      onWindowResize();
    }
  }, 250);
});

// Throttle scroll events
let scrollTimeout;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      const currentScrollY = window.scrollY;
      
      // Only process if scroll changed significantly
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        lastScrollY = currentScrollY;
        
        // Add scroll-based effects here
        const header = document.querySelector('header');
        if (header) {
          if (currentScrollY > 100) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      }
      
      scrollTimeout = null;
    }, 100);
  }
}, { passive: true });

// Preload critical resources
function preloadResources() {
  const criticalResources = [
    '/css/global.css',
    '/css/animations.css',
    '/js/main.js'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    link.href = resource;
    document.head.appendChild(link);
  });
}

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    // Uncomment to enable service worker
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}

// Monitor performance
function monitorPerformance() {
  if ('PerformanceObserver' in window) {
    // Monitor long tasks
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
    
    // Monitor layout shifts
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput && entry.value > 0.1) {
            console.warn('Layout shift detected:', entry.value);
          }
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Layout shift API not supported
    }
  }
}

// Request idle callback polyfill
window.requestIdleCallback = window.requestIdleCallback || function(cb) {
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
};

window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
  clearTimeout(id);
};

// Initialize optimizations
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoading();
  optimizeAnimations();
  
  // Defer non-critical tasks
  requestIdleCallback(() => {
    monitorPerformance();
  });
});

// Reduce motion for accessibility
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition-fast', '0.01ms');
  document.documentElement.style.setProperty('--transition-normal', '0.01ms');
  document.documentElement.style.setProperty('--transition-slow', '0.01ms');
}

// Battery status optimization
if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {
    function updatePerformanceMode() {
      if (battery.level < 0.2 || !battery.charging) {
        // Low battery mode - reduce effects
        optimizeAnimations();
        
        // Pause 3D animations
        if (typeof isAnimating !== 'undefined') {
          isAnimating = false;
        }
      }
    }
    
    battery.addEventListener('levelchange', updatePerformanceMode);
    battery.addEventListener('chargingchange', updatePerformanceMode);
    updatePerformanceMode();
  });
}

// Network-aware loading
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  function updateForConnection() {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      // Slow connection - reduce quality
      document.querySelectorAll('img').forEach(img => {
        if (img.dataset.lowres) {
          img.src = img.dataset.lowres;
        }
      });
    }
  }
  
  connection.addEventListener('change', updateForConnection);
  updateForConnection();
}

// Memory management
function cleanupMemory() {
  // Clear old cache entries
  if (typeof pdfViewer !== 'undefined' && pdfViewer && pdfViewer.pageCache) {
    if (pdfViewer.pageCache.size > 20) {
      const keysToDelete = Array.from(pdfViewer.pageCache.keys()).slice(0, 10);
      keysToDelete.forEach(key => pdfViewer.pageCache.delete(key));
    }
  }
}

// Run cleanup periodically
setInterval(cleanupMemory, 60000); // Every minute

// Export utilities
window.performance = window.performance || {};
window.performance.optimizeAnimations = optimizeAnimations;
window.performance.initLazyLoading = initLazyLoading;
