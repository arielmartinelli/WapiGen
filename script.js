// ===== WAPIGEN Script =====

// Mobile nav toggle
const navToggle = document.getElementById('navtoggle');
const navLinks  = document.getElementById('navlinks');
navToggle?.addEventListener('click', ()=> navLinks.classList.toggle('show'));

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Pricing toggle (monthly vs yearly -20%)
const toggle = document.getElementById('billingToggle');
const values = document.querySelectorAll('.price-amount .value');
const period = document.querySelectorAll('.price-amount .period');
function updatePrices(yearly){
  values.forEach(v => {
    const m = parseFloat(v.getAttribute('data-monthly'));
    const y = parseFloat(v.getAttribute('data-yearly'));
    v.textContent = yearly ? y : m;
  });
  period.forEach(p => p.textContent = yearly ? '/mes (anual)' : '/mes');
}
toggle?.addEventListener('change', e => updatePrices(e.target.checked));

// Contact form (no backend): validate & open WhatsApp prefill as demo
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');
form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  // Basic validation
  if(!data.name || !data.email || !data.phone || !data.message){
    formMsg.textContent = 'Completá todos los campos.';
    return;
  }
  formMsg.textContent = '¡Gracias! Te contactaremos a la brevedad.';
  const text = encodeURIComponent(`Hola WAPIGEN! Soy ${data.name}. Mi WhatsApp es ${data.phone}. Consulta: ${data.message}`);
  window.open(`https://wa.me/5491112345678?text=${text}`, '_blank');
  form.reset();
  updatePrices(toggle?.checked);
});

// Lightweight particles background
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, points = [];
function resize(){
  W = canvas.width = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  points = Array.from({length: Math.max(40, Math.floor(W*H/22000))}, ()=> ({
    x: Math.random()*W,
    y: Math.random()*H,
    vx: (Math.random()-.5)*0.6,
    vy: (Math.random()-.5)*0.6
  }));
}
function step(){
  ctx.clearRect(0,0,W,H);
  for(const p of points){
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>W) p.vx*=-1;
    if(p.y<0||p.y>H) p.vy*=-1;
  }
  // draw
  for(let i=0;i<points.length;i++){
    const a = points[i];
    ctx.beginPath();
    ctx.arc(a.x, a.y, 1.2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,176,255,0.7)';
    ctx.fill();
    for(let j=i+1;j<points.length;j++){
      const b = points[j];
      const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
      if(d<110){
        ctx.strokeStyle = `rgba(59,245,168,${1-d/110})`;
        ctx.lineWidth = .4;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(step);
}
addEventListener('resize', resize);
resize();
step();
