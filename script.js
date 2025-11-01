// ===== Config EmailJS (reemplazar con tus datos) =====
const EMAILJS_PUBLIC_KEY = "TU_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "TU_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "TU_TEMPLATE_ID";
const DESTINO = "arielmartinelli2019@gmail.com";

// ===== Utilidades =====
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

// ===== Mobile nav toggle =====
const navToggle = $('#navtoggle');
const navLinks  = $('#navlinks');
navToggle?.addEventListener('click', ()=>{
  const shown = navLinks.classList.toggle('show');
  navToggle.setAttribute('aria-expanded', String(shown));
});

// ===== Año footer =====
$('#year').textContent = new Date().getFullYear();

// ===== Partículas ligeras =====
const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let W, H, points = [];
function resize(){
  canvas.width = W = canvas.offsetWidth;
  canvas.height= H = canvas.offsetHeight;
  points = Array.from({length: Math.max(40, Math.floor(W*H/22000))}, ()=> ({
    x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*0.6, vy:(Math.random()-.5)*0.6
  }));
}
function step(){
  ctx.clearRect(0,0,W,H);
  for(const p of points){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>W) p.vx*=-1;
    if(p.y<0||p.y>H) p.vy*=-1;
  }
  for(let i=0;i<points.length;i++){
    const a = points[i];
    ctx.beginPath();
    ctx.arc(a.x, a.y, 1.2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,176,255,0.7)';
    ctx.fill();
    for(let j=i+1;j<points.length;j++){
      const b = points[j];
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if(d<110){
        ctx.strokeStyle = `rgba(59,245,168,${1-d/110})`;
        ctx.lineWidth = .4;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(step);
}
addEventListener('resize', resize);
resize(); step();

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
  speed: 4500,  // efecto cinta continua
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

// ===== Scroll suave (Lenis) =====
const lenis = new Lenis({
  duration: 0.95,
  smoothWheel: true,
  smoothTouch: false
});
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// ===== Animaciones de entrada (GSAP + ScrollTrigger) =====
gsap.registerPlugin(ScrollTrigger);
$$('.section').forEach(sec=>{
  gsap.from(sec.querySelectorAll('.section-title, .section-subtitle, .card, .case, .review, .phone, .demo-tabs, .demo-panels'), {
    opacity: 0, y: 24, duration: .7, ease: 'power2.out', stagger: 0.04,
    scrollTrigger: { trigger: sec, start: 'top 80%' }
  });
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
