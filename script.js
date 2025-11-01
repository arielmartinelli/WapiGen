// ===== Config EmailJS (reemplazar con tus datos) =====
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "TU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "TU_TEMPLATE_ID";
const DESTINO = "arielmartinelli2019@gmail.com";

// ===== Utils =====
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

// ===== Loader 1s =====
window.addEventListener('load', () => {
  setTimeout(()=> { $('#loader')?.classList.add('hide'); }, 1000);
});

// ===== Año footer =====
$('#year').textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const navToggle = $('#navtoggle');
const navLinks  = $('#navlinks');
navToggle?.addEventListener('click', ()=>{
  const shown = navLinks.classList.toggle('show');
  navToggle.setAttribute('aria-expanded', String(shown));
});

// ===== Theme: auto + toggle (persistencia) =====
(function themeBoot(){
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);
})();
$('#themeToggle')?.addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== Scroll progress =====
const progressBar = $('#scroll-progress');
window.addEventListener('scroll', ()=>{
  const scrolled = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.width = `${Math.min(100, scrolled*100)}%`;
});

// ===== Lenis smooth scroll =====
const lenis = new Lenis({ duration: 0.95, smoothWheel: true, smoothTouch: false });
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ===== Swipers =====
const chatSwiper = new Swiper('.chat-swiper', {
  direction: 'vertical',
  loop: true,
  allowTouchMove: false,
  autoplay: { delay: 2800, disableOnInteraction: false },
  speed: 700,
});
const casesSwiper = new Swiper('.cases-swiper', {
  slidesPerView: 'auto',
  spaceBetween: 12,
  freeMode: true,
  loop: true,
  autoplay: { delay: 1, disableOnInteraction:false },
  speed: 4500,
  grabCursor: true,
});
const reviewsSwiper = new Swiper('.reviews-swiper', {
  direction: 'horizontal',
  loop: true,
  centeredSlides: true,
  slidesPerView: 1.1,
  spaceBetween: 14,
  breakpoints: { 768:{ slidesPerView: 2.2 }, 1024:{ slidesPerView: 3 } },
  autoplay: { delay: 3200, disableOnInteraction:false },
  speed: 650,
});

// ===== Tabs Demo =====
$$('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    $$('.panel').forEach(p=>p.classList.remove('active'));
    $(target)?.classList.add('active');
  });
});

// ===== Toggle precios =====
const toggle = $('#billingToggle');
const values = $$('.price-amount .value');
const period = $$('.price-amount .period');
function updatePrices(yearly){
  values.forEach(v => {
    const m = parseFloat(v.getAttribute('data-monthly'));
    const y = parseFloat(v.getAttribute('data-yearly'));
    v.textContent = yearly ? y : m;
  });
  period.forEach(p => p.textContent = yearly ? '/mes (anual)' : '/mes');
}
toggle?.addEventListener('change', e => updatePrices(e.target.checked));

// ===== VanillaTilt (tilt 3D en cards/hero) =====
window.addEventListener('DOMContentLoaded', ()=>{
  if (window.VanillaTilt){
    VanillaTilt.init($$('.tilt'), { max: 10, speed: 400, glare: true, "max-glare": 0.15 });
  }
});

// ===== Typed.js (eslogans rotativos) =====
window.addEventListener('DOMContentLoaded', ()=>{
  const el = $('#typed');
  if (el && window.Typed){
    new Typed('#typed', {
      strings: ['pet shops', 'clínicas', 'cafeterías', 'tiendas online', 'negocios locales'],
      typeSpeed: 36,
      backSpeed: 18,
      backDelay: 1300,
      loop: true,
      smartBackspace: true
    });
  }
});

// ===== GSAP Animaciones (TextPlugin + ScrollTrigger) =====
window.addEventListener('DOMContentLoaded', ()=>{
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // Título hero animado
  gsap.from('.title-animated', { y: 18, opacity: 0, duration: .8, ease: 'power2.out' });
  // Aparición secuencial en cada sección
  $$('.section').forEach(sec=>{
    gsap.from(sec.querySelectorAll('.section-title, .section-subtitle, .card, .case, .review, .phone, .demo-tabs, .demo-panels'), {
      opacity: 0, y: 26, duration: .7, ease: 'power2.out', stagger: 0.05,
      scrollTrigger: { trigger: sec, start: 'top 80%' }
    });
  });
  // Sutil parallax de glows en hero
  const wrap = $('.hero .phone-wrap');
  if (wrap){
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to('.glow-a', { x: x*20, y: y*20, duration:.3, overwrite:true });
      gsap.to('.glow-b', { x: -x*20, y: -y*20, duration:.3, overwrite:true });
    });
  }
});

// ===== Formulario de contacto (EmailJS con fallback mailto) =====
const form = $('#contactForm');
const formMsg = $('#formMsg');

// Inicializar EmailJS si hay keys
try {
  if (EMAILJS_PUBLIC_KEY && window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
} catch (e){ /* noop */ }

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  // Anti-bot (honeypot)
  if (data.empresa) return;

  // Validaciones mínimas
  const ok = data.name && data.email && data.phone && data.message;
  if(!ok){
    formMsg.textContent = 'Completá todos los campos.';
    return;
  }

  formMsg.textContent = 'Enviando…';

  // INTENTO 1: EmailJS
  try {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) throw new Error('Faltan keys EmailJS');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: data.name,
      from_email: data.email,
      phone: data.phone,
      message: data.message,
      to_email: DESTINO
    });
    formMsg.textContent = '✅ Mensaje enviado. ¡Gracias! Te respondemos a la brevedad.';
    form.reset();
    return;
  } catch (err) {
    console.warn('EmailJS error:', err?.message || err);
  }

  // INTENTO 2: mailto fallback
  try {
    const subject = encodeURIComponent('Nuevo mensaje desde WAPIGEN');
    const body = encodeURIComponent(
      `Nombre: ${data.name}\nEmail: ${data.email}\nWhatsApp: ${data.phone}\n\nMensaje:\n${data.message}`
    );
    window.location.href = `mailto:${DESTINO}?subject=${subject}&body=${body}`;
    formMsg.textContent = 'Abrimos tu cliente de correo para completar el envío ✉️';
  } catch (e) {
    formMsg.textContent = 'No pudimos enviar el mensaje. Escribinos por WhatsApp, por favor.';
  }
});
