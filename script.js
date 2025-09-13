/* script.js
   Responsible for:
   1) Typing effect in the hero
   2) Mobile nav toggle
   3) Smooth scroll and active nav on scroll
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Typing effect ---------- */
  const typedEl = document.querySelector('.typed');
  const cursorEl = document.querySelector('.typing-cursor');

  // Words to show — keep these the same as your previous list
  const words = [
    'Junior Developer',
    'Web Developer',
    'Backend Developer',
    'Frontend Developer'
  ];

  const typingSpeed = 80;    // ms per character
  const backspaceSpeed = 40; // ms per character when deleting
  const delayBetween = 1200; // ms before deleting / after typing

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeLoop() {
    const current = words[wordIndex];
    if (!isDeleting) {
      // typing
      typedEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        // done typing, pause then delete
        isDeleting = true;
        setTimeout(typeLoop, delayBetween);
        return;
      }
    } else {
      // deleting
      typedEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    }
    const timeout = isDeleting ? backspaceSpeed : typingSpeed;
    setTimeout(typeLoop, timeout);
  }

  // start after small delay
  setTimeout(typeLoop, 400);

  /* ---------- Mobile menu toggle ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('active');
      // Do NOT lock body scroll on mobile — allow the user to scroll while the nav is open
    });

    // close nav when a link is clicked (mobile)
    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
          nav.classList.remove('active');
          menuBtn.setAttribute('aria-expanded', 'false');
          // allow normal scrolling (no-op since we don't lock it)
        }
      });
    });

    // Close mobile nav when user scrolls or touches (useful on mobile where you may want to scroll while nav is open)
    const closeNavIfOpen = () => {
      if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    // Close on wheel/scroll/touchmove — passive listeners for smoothness
    window.addEventListener('scroll', closeNavIfOpen, { passive: true });
    window.addEventListener('wheel', closeNavIfOpen, { passive: true });
    window.addEventListener('touchmove', closeNavIfOpen, { passive: true });
  }

  /* ---------- Smooth scroll & active nav ---------- */
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const sections = navLinks.map(link => {
    const id = link.getAttribute('href').slice(1);
    return document.getElementById(id);
  });

  // Smooth scroll behavior for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        const yOffset = -80; // adjust for fixed header height if needed
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // Active nav link on scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + (window.innerHeight * 0.2);
    sections.forEach((sec, idx) => {
      if (!sec) return;
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks[idx].classList.add('active');
      }
    });
  });

}); // DOMContentLoaded

/* ===== Contact form handling ===== */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-status');

  // update this to your real email address (used in mailto fallback)
  const RECEIVER_EMAIL = 'jeffrey_autentico@sjp2cd.edu.ph';

  if (!contactForm) return;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showStatus = (message, type = 'info') => {
    statusEl.textContent = message;
    statusEl.style.color = (type === 'error') ? '#ff6b6b' : '#b74b4b';
  };

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // honeypot - bots will fill this, humans won't
    const hp = contactForm.querySelector('.hp-field');
    if (hp && hp.value.trim() !== '') {
      // silently ignore
      return;
    }

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const subject = contactForm.subject.value.trim() || 'New message from portfolio';
    const message = contactForm.message.value.trim();

    // basic validation
    if (!name) { showStatus('Please enter your name.', 'error'); contactForm.name.focus(); return; }
    if (!email || !validateEmail(email)) { showStatus('Please enter a valid email address.', 'error'); contactForm.email.focus(); return; }
    if (!message || message.length < 10) { showStatus('Please enter a message (10+ characters).', 'error'); contactForm.message.focus(); return; }

    // disable button & show sending...
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';

    // simulate async send (no backend).
    setTimeout(() => {
      // show success
      showStatus('Message ready — opening your mail app to send. If nothing happens, copy-paste your message into email.', 'success');

      // Prepare mailto fallback (open user's mail client with the message prefilled)
      const mailBody = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const mailto = `mailto:${RECEIVER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${mailBody}`;

      // open mail client in new window/tab (some browsers block, so it's a fallback)
      window.location.href = mailto;

      // reset form after short delay
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        contactForm.reset();
        showStatus('Message cleared — thanks! If you used your mail app, your email should be queued.','info');
      }, 900);
    }, 750);
  });
});

/* ===== Back to Top + Hire Me response behaviors ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Back to top button
  const backBtn = document.getElementById('backToTop');
  const showAfter = 300; // px scrolled down before showing

  function checkBackButton() {
    if (!backBtn) return;
    if (window.scrollY > showAfter) backBtn.classList.add('visible');
    else backBtn.classList.remove('visible');
  }
  // show/hide on scroll
  window.addEventListener('scroll', checkBackButton);
  // initial check
  checkBackButton();

  // click behavior: smooth scroll to top
  backBtn && backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    backBtn.blur();
  });

/* ---------- Hire panel behavior (single, robust handler) ---------- */
  (function hirePanel(){
    // selectors - might not exist on every page, so guard them
    const heroHireBtn = document.querySelector('.home .btn[href]') ||
                        document.querySelector('a[href*="hire"]') ||
                        document.querySelector('.btn.hire') ||
                        document.querySelector('.btn'); // fallback
    const hireSection = document.querySelector('.hire-response');
    const hireClose = document.getElementById('hire-close');
    const hireProceed = document.getElementById('hire-proceed');

    // show / hide helpers — check element exists before use
    function showHirePanel() {
      if (!hireSection) return;
      hireSection.setAttribute('aria-hidden', 'false');
      // attempt to focus the close button for accessibility
      const btn = document.getElementById('hire-close');
      if (btn) btn.focus();
      // scroll into view if single-page
      try { hireSection.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
    function hideHirePanel() {
      if (!hireSection) return;
      hireSection.setAttribute('aria-hidden', 'true');
    }

    // If no heroHireBtn, nothing to attach
    if (!heroHireBtn) return;

    // Single click handler:
    heroHireBtn.addEventListener('click', (e) => {
      const href = heroHireBtn.getAttribute('href') || '';
      // If it's an internal anchor (starts with '#'), intercept and open the in-page panel
      if (href === '#' || href.startsWith('#')) {
        e.preventDefault();
        showHirePanel();
        return;
      }
      // Otherwise let the browser follow the link (e.g., hire-response.html)
      // do not call e.preventDefault() here
    });

    // Close button
    if (hireClose) {
      hireClose.addEventListener('click', (e) => {
        e.preventDefault();
        hideHirePanel();
      });
    }

    // Proceed button (scroll to contact form) — optional
    if (hireProceed) {
      hireProceed.addEventListener('click', (e) => {
        e.preventDefault();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // focus name input if present
          setTimeout(() => {
            const nameInput = document.querySelector('#contact-form input[name="name"]');
            if (nameInput) nameInput.focus({ preventScroll: true });
          }, 700);
        }
      });
    }

    // Close on Esc key if panel visible
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && hireSection && hireSection.getAttribute('aria-hidden') === 'false') {
        hideHirePanel();
      }
    });
  })();

}); // DOMContentLoaded
