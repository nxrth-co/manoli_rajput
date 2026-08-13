/* --------------------------------------------------------------------------
   MANOLI FRAME ARTIST - CORE INTERACTION SCRIPTS
   -------------------------------------------------------------------------- */

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initGSAPReveal();
  initImageFallbacks();
  initVideoInteractions();
});

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

/* --------------------------------------------------------------------------
   NAVBAR & SCROLL OBSERVATION
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  // Shrink/Blur navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-ivory/85', 'backdrop-blur-xl', 'py-4', 'border-b', 'border-text/5');
      navbar.classList.remove('bg-transparent', 'py-6');
    } else {
      navbar.classList.add('bg-transparent', 'py-6');
      navbar.classList.remove('bg-ivory/85', 'backdrop-blur-xl', 'py-4', 'border-b', 'border-text/5');
    }
  });

  // Active section tracking via IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', // Triggers when section occupies the mid-viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.substring(1) === activeId) {
            link.classList.add('active-section');
          } else {
            link.classList.remove('active-section');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* --------------------------------------------------------------------------
   MOBILE NAV MENU TOGGLE
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('#mobile-menu a');
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) {
      // Open overlay menu
      mobileMenu.classList.remove('pointer-events-none');
      gsap.to(mobileMenu, { opacity: 1, duration: 0.5, ease: 'power2.out' });
      
      // Transform hamburger to "X"
      gsap.to(menuBtn.children[0], { rotate: 45, y: 5, duration: 0.3 });
      gsap.to(menuBtn.children[1], { opacity: 0, duration: 0.2 });
      gsap.to(menuBtn.children[2], { rotate: -45, y: -5, duration: 0.3 });
      
      // Stagger animate links entrance
      gsap.fromTo(mobileLinks, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.15, ease: 'power3.out' }
      );
    } else {
      // Close overlay menu
      mobileMenu.classList.add('pointer-events-none');
      gsap.to(mobileMenu, { opacity: 0, duration: 0.4, ease: 'power2.inOut' });
      
      // Transform "X" back to hamburger
      gsap.to(menuBtn.children[0], { rotate: 0, y: 0, duration: 0.3 });
      gsap.to(menuBtn.children[1], { opacity: 1, duration: 0.2 });
      gsap.to(menuBtn.children[2], { rotate: 0, y: 0, duration: 0.3 });
    }
  }

  menuBtn.addEventListener('click', toggleMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuOpen) toggleMenu();
    });
  });
}

/* --------------------------------------------------------------------------
   GSAP SCROLL REVEAL ANIMATIONS
   -------------------------------------------------------------------------- */
function initGSAPReveal() {
  // Reveal individual elements dynamically on scroll
  const revealElements = document.querySelectorAll('.gsap-reveal');
  
  revealElements.forEach(element => {
    const direction = element.getAttribute('data-direction');
    let startX = 0;
    let startY = 0;
    
    // Choose start position based on data-direction attribute
    if (direction === 'left') {
      startX = -60;
    } else if (direction === 'right') {
      startX = 60;
    } else {
      startY = 50;
    }

    gsap.fromTo(element, 
      { 
        opacity: 0, 
        x: startX, 
        y: startY 
      }, 
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      }
    );
  });



  // Staggered reveal for Frame Artist Video Cards
  gsap.fromTo('#content .video-card-container', 
    { y: 60, opacity: 0 },
    {
      scrollTrigger: {
        trigger: '#content',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 0,
      opacity: 1,
      duration: 1.4,
      stagger: 0.2,
      ease: 'power3.out'
    }
  );
}

/* --------------------------------------------------------------------------
   FRAME ARTIST VIDEO INTERACTIONS & FALLBACKS
   -------------------------------------------------------------------------- */
function initVideoInteractions() {
  const videoContainers = document.querySelectorAll('.video-card-container');

  videoContainers.forEach(container => {
    const video = container.querySelector('video');
    const fallback = container.querySelector('.placeholder-fallback');

    if (!video) return;

    // Load HLS source if available
    let hlsInstance = null;
    let hlsLoadStarted = false;
    const dataSrc = video.getAttribute('data-src');
    if (dataSrc) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({
          startLevel: -1, // Auto-quality
          autoStartLoad: false // Don't download chunks until needed
        });
        hlsInstance.loadSource(dataSrc);
        hlsInstance.attachMedia(video);
        
        // Start loading chunks when play is requested
        video.addEventListener('play', () => {
          if (!hlsLoadStarted) {
            hlsInstance.startLoad(-1);
            hlsLoadStarted = true;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari) - Safari natively handles lazy loading when preload="metadata"
        video.src = dataSrc;
      }
    }

    // Dynamically retrieve controls elements
    const playPauseBtn = container.querySelector('.play-pause-btn');
    const playIcon = container.querySelector('.play-icon');
    const pauseIcon = container.querySelector('.pause-icon');
    const muteBtn = container.querySelector('.mute-btn');
    const muteIcon = container.querySelector('.mute-icon');
    const unmuteIcon = container.querySelector('.unmute-icon');
    const progressContainer = container.querySelector('.progress-container');
    const progressBar = container.querySelector('.progress-bar');
    
    // Attempt to resolve controls overlay container
    const controlsOverlay = playPauseBtn ? playPauseBtn.parentElement : null;

    // Helper to toggle play/pause state
    function togglePlay() {
      if (video.paused || video.ended) {
        video.play().catch(err => {
          console.warn('Playback block occurred:', err);
        });
      } else {
        video.pause();
      }
    }

    // Update play/pause UI state on video events
    video.addEventListener('play', () => {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      
      // If playing, hide the fallback placeholder immediately
      if (fallback) {
        gsap.to(fallback, {
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            fallback.style.display = 'none';
          }
        });
      }
    });

    video.addEventListener('pause', () => {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // Toggle play state on clicking the mockup container itself (outside other controls)
    container.addEventListener('click', (e) => {
      if (e.target.closest('.play-pause-btn') || e.target.closest('.mute-btn') || e.target.closest('.progress-container')) {
        return;
      }
      togglePlay();
    });

    // Mute/Unmute logic
    if (muteBtn) {
      // Initialize mute icon states
      if (video.muted) {
        if (muteIcon) muteIcon.classList.remove('hidden');
        if (unmuteIcon) unmuteIcon.classList.add('hidden');
      } else {
        if (muteIcon) muteIcon.classList.add('hidden');
        if (unmuteIcon) unmuteIcon.classList.remove('hidden');
      }

      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (video.muted) {
          if (muteIcon) muteIcon.classList.remove('hidden');
          if (unmuteIcon) unmuteIcon.classList.add('hidden');
        } else {
          if (muteIcon) muteIcon.classList.add('hidden');
          if (unmuteIcon) unmuteIcon.classList.remove('hidden');
        }
      });
    }

    // Progress updates
    video.addEventListener('timeupdate', () => {
      if (video.duration && progressBar) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = percent + '%';
      }
    });

    // Progress bar seeking interaction
    if (progressContainer) {
      progressContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.duration) {
          const rect = progressContainer.getBoundingClientRect();
          const clickPercent = (e.clientX - rect.left) / rect.width;
          video.currentTime = Math.max(0, Math.min(1, clickPercent)) * video.duration;
        }
      });
    }

    // Fade out placeholder when first video frame is loaded
    video.addEventListener('loadeddata', () => {
      video.classList.remove('opacity-0');
      if (fallback) {
        gsap.to(fallback, {
          opacity: 0,
          duration: 0.6,
          onComplete: () => {
            fallback.style.display = 'none';
          }
        });
      }
    });

    // Hover autoplay interactions as secondary activation
    container.addEventListener('mouseenter', () => {
      // If HLS hasn't started loading chunks yet, start it
      if (hlsInstance && !hlsLoadStarted) {
        hlsInstance.startLoad(-1);
        hlsLoadStarted = true;
      }
      
      video.play().catch(err => {
        console.warn('Hover playback blocked:', err);
      });
    });

    container.addEventListener('mouseleave', () => {
      video.pause();
    });

    // Hide video and show fallback if file is missing or failed to load
    const handleVideoError = () => {
      console.info(`Video source missing, rendering placeholder cover: ${video.querySelector('source')?.src}`);
      video.style.display = 'none';
      if (controlsOverlay) {
        controlsOverlay.style.display = 'none';
      }
      if (fallback) {
        fallback.style.display = 'flex';
        fallback.style.opacity = '1';
      }
    };

    video.addEventListener('error', handleVideoError);
  });
}

/* --------------------------------------------------------------------------
   IMAGE WORKFLOWS & FALLBACKS
   -------------------------------------------------------------------------- */
function initImageFallbacks() {
  const containers = document.querySelectorAll('.hover-zoom-container');

  containers.forEach(container => {
    const img = container.querySelector('img');
    const fallback = container.querySelector('.placeholder-fallback');

    if (!img) return;

    // Helper to fade out the placeholder and make image visible
    function showImage() {
      img.classList.remove('opacity-0');
      if (fallback) {
        gsap.to(fallback, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => fallback.remove()
        });
      }
    }

    // Check if the image has already loaded (cached hits)
    if (img.complete && img.naturalWidth > 0) {
      showImage();
    } else {
      img.addEventListener('load', showImage);
      img.addEventListener('error', () => {
        console.info(`Image failed to load, keeping placeholder: ${img.src}`);
        img.remove();
      });
    }
  });
}
