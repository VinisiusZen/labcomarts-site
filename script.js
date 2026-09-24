(() => {
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  const onHeader = () => {
    const y = window.scrollY;
    header?.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * .75);
    lastY = y;
  };

  // Opening film — identical scroll scrub behavior to V2: plain position:sticky
  // in CSS, JS only scrubs currentTime. No JS-driven pin/position toggling.
  const film = document.querySelector('.scroll-film');
  const video = document.getElementById('heroVideo');
  let duration = 6.016;
  let videoTicking = false;

  const setDuration = () => {
    if (!video) return;
    if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    video.pause();
    try { video.currentTime = 0; } catch(e) {}
  };

  const updateVideo = () => {
    if (!film || !video) { videoTicking = false; return; }
    const rect = film.getBoundingClientRect();
    const scrollable = Math.max(1, film.offsetHeight - window.innerHeight);
    const passed = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = passed / scrollable;
    const target = Math.min(duration - 0.025, Math.max(0, progress * duration));
    if (video.readyState >= 2 && Math.abs(video.currentTime - target) > 0.012) {
      try { video.currentTime = target; } catch(e) {}
    }
    film.classList.toggle('has-scrolled', progress > .035);
    videoTicking = false;
  };

  if (video) {
    video.addEventListener('loadedmetadata', setDuration);
    video.addEventListener('canplay', updateVideo);
  }

  // Text, cards and icons reveal with stagger. Images are intentionally excluded.
  document.querySelectorAll('.reveal').forEach(section => {
    const targets = section.querySelectorAll('.eyebrow,h1,h2,.lead,.chapter-number,.chapter-copy>p,.journey-copy>p,.card,.capability-list article,.person-meta,.metric,.expertise-card,.contact-cta,.button,.contact-form>*,.icon-chip,.card-icon,.cap-icon,.profile-role img,.product-link,.product-rail,.study-contact-person');
    targets.forEach((el,i)=>el.style.setProperty('--delay',`${Math.min(i*80,720)}ms`));
  });
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  }), {threshold:.07, rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  // Finale: at least 3x the entire site height before it. The drop disappears early,
  // leaving a very long white scroll before the final easter egg.
  const finale = document.querySelector('.finale');
  const finaleDrop = document.querySelector('.finale-drop');
  const finaleEgg = document.querySelector('.finale-egg');
  const sizeFinale = () => {
    if (!finale) return;
    const preFinaleHeight = Math.max(finale.offsetTop, window.innerHeight * 5);
    const longBlank = Math.max(preFinaleHeight * 3, window.innerHeight * 18);
    finale.style.height = `${Math.round(longBlank)}px`;
  };
  const updateFinale = () => {
    if (!finale || !finaleDrop || !finaleEgg) return;
    const r = finale.getBoundingClientRect();
    const span = Math.max(1, finale.offsetHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / span));
    // Fade the drop during the first part, then leave mostly pure white.
    const vanish = Math.min(1, Math.max(0, (p - .015) / .075));
    // Easter egg only at the very, very end.
    const egg = Math.min(1, Math.max(0, (p - .965) / .025));
    finaleDrop.style.opacity = `${1 - vanish}`;
    finaleDrop.style.transform = `scale(${1 - vanish*.04}) translateY(${vanish*-10}px)`;
    finaleDrop.style.filter = `blur(${vanish*6}px)`;
    finaleEgg.style.opacity = `${egg}`;
    finaleEgg.style.transform = `translateY(${18*(1-egg)}px)`;
    finaleEgg.setAttribute('aria-hidden', egg < .2 ? 'true' : 'false');
  };

  let ticking=false;
  const onScroll = () => {
    if (!videoTicking) {
      requestAnimationFrame(updateVideo);
      videoTicking = true;
    }
    if (ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{ updateFinale(); onHeader(); ticking=false; });
  };
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',()=>{sizeFinale();onScroll();},{passive:true});
  sizeFinale();
  updateVideo();
  updateFinale();

  const form = document.querySelector('[data-mail-form]');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const subject = encodeURIComponent('Participação — Índice de Maturidade e Valor da IA');
    const body = encodeURIComponent(`Nome: ${fd.get('nome') || ''}\nEmpresa: ${fd.get('empresa') || ''}\nE-mail: ${fd.get('email') || ''}\n\n${fd.get('mensagem') || 'Quero participar da pesquisa.'}`);
    location.href = `mailto:contato@labcomarts.com?subject=${subject}&body=${body}`;
  });
})();
