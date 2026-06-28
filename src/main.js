// ==========================================================================
// NovaSphere Interactive Logic — Main Module
// ==========================================================================
import { translations } from './translations.js';

let currentLang = localStorage.getItem('ns_lang') || 'ka';

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initMobileMenu();
  initHeaderScroll();
  initCounters();
  initRoiCalculator();
  initPricingToggle();
  initContactForm();
  initPlanSelectors();
});

// Mobile Menu Navigation Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}

// Sticky Header Glassmorphism Transition
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Animated Metric Counters
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  const observerOptions = { threshold: 0.5 };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const targetVal = parseFloat(counter.getAttribute('data-target'));
        animateCounter(counter, targetVal);
        obs.unobserve(counter);
      }
    });
  }, observerOptions);

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
  let start = 0;
  const duration = 2000;
  const startTime = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out expo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = start + (target - start) * easeProgress;

    el.textContent = isDecimal ? currentVal.toFixed(2) : Math.floor(currentVal);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// Interactive Cloud ROI Cost Savings Simulator
function initRoiCalculator() {
  const slider = document.getElementById('roi-slider');
  const spendDisplay = document.getElementById('spend-display');
  const monthlySavings = document.getElementById('monthly-savings');
  const annualSavings = document.getElementById('annual-savings');

  if (!slider) return;

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const calculate = () => {
    const spend = parseFloat(slider.value);
    spendDisplay.textContent = formatCurrency(spend);

    // NovaSphere autonomous routing saves ~42% on average
    const monthlySav = spend * 0.42;
    const annualSav = monthlySav * 12;

    monthlySavings.textContent = formatCurrency(monthlySav);
    annualSavings.textContent = formatCurrency(annualSav);
  };

  slider.addEventListener('input', calculate);
  calculate(); // Initial state
}

// Pricing Billing Cycle Toggle
function initPricingToggle() {
  const checkbox = document.getElementById('pricing-toggle-checkbox');
  const monthlyLabel = document.getElementById('monthly-label');
  const annualLabel = document.getElementById('annual-label');
  const priceElements = document.querySelectorAll('.price-val');

  if (!checkbox) return;

  checkbox.addEventListener('change', () => {
    const isAnnual = checkbox.checked;

    if (isAnnual) {
      annualLabel.classList.add('active');
      monthlyLabel.classList.remove('active');
    } else {
      monthlyLabel.classList.add('active');
      annualLabel.classList.remove('active');
    }

    priceElements.forEach(el => {
      const targetPrice = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
      el.textContent = targetPrice;
    });
  });
}

// Plan Selector Auto-fill Form
function initPlanSelectors() {
  const planBtns = document.querySelectorAll('.select-plan-btn');
  const tierSelect = document.getElementById('selected-tier');

  planBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan');
      if (tierSelect && plan) {
        for (let option of tierSelect.options) {
          if (option.text.includes(plan) || option.value.includes(plan)) {
            tierSelect.value = option.value;
            break;
          }
        }
      }
    });
  });
}

// Contact Form Submission & Toast Notification
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  if (!form || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn.innerHTML;

    btn.disabled = true;
    const loadingText = translations[currentLang]?.['form.btn.loading'] || `მუშავდება... ⏳`;
    btn.innerHTML = loadingText;

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = origText;
      form.reset();

      showToast();
    }, 1200);
  });
}

function showToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

// Language Switcher & Localization Logic
function initLanguageSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');
  
  // Apply saved or initial language
  setLanguage(currentLang);

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      if (selectedLang && selectedLang !== currentLang) {
        setLanguage(selectedLang);
      }
    });
  });
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('ns_lang', lang);
  document.documentElement.lang = lang;

  // Update active buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) {
      el.setAttribute('placeholder', translations[lang][key]);
    }
  });
}
