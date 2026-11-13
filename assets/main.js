/* ЭксТехСервис — Concept 03 «Friendly». Анимации: Motion (motion.dev) + CSS, с запасным вариантом без библиотеки. */

/* Контакты клиента: впишите, когда будут известны. */
const CONTACTS = { phone: '', email: '', max: '' };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Toast + контакты ---------- */
const toastEl = $('.toast');
let tt;
const toast = m => { toastEl.textContent = m; toastEl.hidden = false; clearTimeout(tt); tt = setTimeout(() => (toastEl.hidden = true), 3800); };
$$('[data-contact]').forEach(el => {
  const k = el.dataset.contact, v = CONTACTS[k];
  if (!v) return;
  el.innerHTML = k === 'phone' ? `<a href="tel:${v.replace(/[^\d+]/g, '')}">${v}</a>` : k === 'email' ? `<a href="mailto:${v}">${v}</a>` : `<a href="${v}" target="_blank" rel="noopener">Открыть чат</a>`;
});
document.addEventListener('click', e => {
  if (e.target.closest('[data-call]')) {
    CONTACTS.phone ? (location.href = 'tel:' + CONTACTS.phone.replace(/[^\d+]/g, ''))
      : toast('Номер телефона добавим после согласования с клиентом. А расчёт можно запросить уже сейчас!');
  }
  if (e.target.closest('[data-max]')) {
    CONTACTS.max ? window.open(CONTACTS.max, '_blank', 'noopener') : toast('Ссылку на MAX добавим после согласования с клиентом.');
  }
  const pick = e.target.closest('[data-pick]');
  if (pick) pickTech(pick.dataset.pick);
});

/* ---------- Навигация и мобильная панель ---------- */
const burger = $('[data-burger]'), drop = $('#drop');
const setDrop = open => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  drop.hidden = !open;
  if (open && window.__m && !reduce) window.__m.animate(drop, { opacity: [0, 1], y: [-12, 0], scale: [0.97, 1] }, { type: 'spring', bounce: 0.35, duration: 0.5 });
};
burger.addEventListener('click', () => setDrop(drop.hidden));
drop.addEventListener('click', e => { if (e.target.closest('a')) setDrop(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !drop.hidden) { setDrop(false); burger.focus(); } });
addEventListener('resize', () => { if (innerWidth > 1080 && !drop.hidden) setDrop(false); });
const navLinks = $$('.nav__links a');
const secObs = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['tech', 'services', 'how', 'faq', 'contacts'].forEach(id => secObs.observe(document.getElementById(id)));

const dock = $('[data-dock]');
const road = $('[data-road]');
function onScroll() {
  const calc = $('#calc').getBoundingClientRect();
  const inCalc = calc.top < innerHeight * .7 && calc.bottom > innerHeight * .3;
  dock.classList.toggle('is-on', scrollY > innerHeight * .6 && !inCalc);
  // экскаватор едет по дороге «Как работаем»
  const r = road.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (innerHeight * .85 - innerHeight * .25 + r.height * .3)));
  road.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- FAQ ---------- */
const qaBtns = $$('.qa__item button');
const setQa = (b, open) => { b.setAttribute('aria-expanded', String(open)); b.closest('.qa__item').classList.toggle('is-open', open); };
qaBtns.forEach(b => {
  setQa(b, b.getAttribute('aria-expanded') === 'true');
  b.addEventListener('click', () => setQa(b, b.getAttribute('aria-expanded') !== 'true'));
});

/* ---------- Калькулятор-визард ---------- */
const wiz = $('[data-wiz]');
const steps = $$('[data-step]', wiz);
const prev = $('[data-prev]', wiz), next = $('[data-next]', wiz), submit = $('[data-submit]', wiz);
const dots = $$('.wiz__dots li', wiz), stepNum = $('[data-step-num]', wiz);
let step = 1;
const err = (k, m) => { $(`[data-err="${k}"]`, wiz).textContent = m || ''; };
function pickTech(key) {
  const r = $(`input[name="tech"][data-key="${key}"]`, wiz);
  if (r) { r.checked = true; err('tech'); if (step !== 1) go(1, true); }
}
function go(n, silent) {
  step = n;
  steps.forEach(s => (s.hidden = +s.dataset.step !== n));
  prev.hidden = n === 1; next.hidden = n === 3; submit.hidden = n !== 3;
  dots.forEach((d, i) => { d.classList.toggle('is-on', i === n - 1); d.classList.toggle('is-done', i < n - 1); });
  stepNum.textContent = 'Шаг ' + n;
  const cur = steps[n - 1];
  if (window.__m && !reduce && !silent) window.__m.animate(cur, { opacity: [0, 1], x: [30, 0] }, { type: 'spring', bounce: 0.3, duration: 0.55 });
  const first = $('input, textarea', cur);
  if (first && !silent) first.focus({ preventScroll: true });
}
function check(n) {
  const f = wiz.elements;
  if (n === 1) {
    const ok = !!$('input[name="tech"]:checked', wiz);
    err('tech', ok ? '' : 'Выберите вариант — так мы быстрее сориентируемся');
    return ok;
  }
  if (n === 2) {
    const ok = $$('input[name="issue"]:checked', wiz).length > 0 || f.message.value.trim().length >= 5;
    err('issue', ok ? '' : 'Отметьте, что сломалось, или опишите в паре слов');
    return ok;
  }
  const nameOk = f.name.value.trim().length >= 2;
  f.name.classList.toggle('is-bad', !nameOk); f.name.setAttribute('aria-invalid', String(!nameOk));
  err('name', nameOk ? '' : 'Как к вам обращаться?');
  const phOk = f.phone.value.replace(/\D/g, '').length === 11;
  f.phone.classList.toggle('is-bad', !phOk); f.phone.setAttribute('aria-invalid', String(!phOk));
  err('phone', phOk ? '' : 'Номер целиком: +7 и 10 цифр');
  const agOk = f.agree.checked;
  err('agree', agOk ? '' : 'Нужно согласие на обработку данных');
  const ok = nameOk && phOk && agOk;
  if (!ok) (!nameOk ? f.name : !phOk ? f.phone : f.agree).focus();
  return ok;
}
next.addEventListener('click', () => {
  if (check(step)) go(step + 1);
  else if (window.__m && !reduce) window.__m.animate(wiz, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
});
prev.addEventListener('click', () => go(step - 1));
wiz.addEventListener('change', e => {
  if (e.target.name === 'tech') err('tech');
  if (e.target.name === 'issue') err('issue');
  if (e.target.name === 'agree' && e.target.checked) err('agree');
});
wiz.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && step < 3) { e.preventDefault(); next.click(); } });
const phone = $('[data-phone]', wiz);
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (!d) { phone.value = ''; return; }
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  let o = '+7';
  if (d.length > 1) o += ' (' + d.slice(1, 4);
  if (d.length >= 4) o += ')';
  if (d.length > 4) o += ' ' + d.slice(4, 7);
  if (d.length > 7) o += '-' + d.slice(7, 9);
  if (d.length > 9) o += '-' + d.slice(9, 11);
  phone.value = o;
  if (phone.classList.contains('is-bad') && d.length === 11) { phone.classList.remove('is-bad'); err('phone'); }
});
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
wiz.addEventListener('submit', e => {
  e.preventDefault();
  if (!check(3)) return;
  const f = wiz.elements;
  const issues = $$('input[name="issue"]:checked', wiz).map(i => i.value).join(', ');
  const rows = [
    ['Техника', $('input[name="tech"]:checked', wiz).value + (f.brand.value.trim() ? ' · ' + f.brand.value.trim() : '')],
    ['Что случилось', [issues, f.message.value.trim()].filter(Boolean).join(' — ')],
    ['Формат', $('input[name="place"]:checked', wiz).value],
    ['Связь', $('input[name="via"]:checked', wiz).value + ' · ' + f.name.value.trim() + ', ' + f.phone.value]
  ];
  submit.disabled = true;
  const html = submit.innerHTML;
  submit.innerHTML = '<span class="spinner" aria-hidden="true"></span> Отправляем…';
  setTimeout(() => {
    submit.disabled = false; submit.innerHTML = html;
    $('[data-summary]', wiz).innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
    const done = $('.wiz__done', wiz); done.hidden = false; done.focus();
    dots.forEach(d => { d.classList.remove('is-on'); d.classList.add('is-done'); });
    if (window.__m && !reduce) {
      window.__m.animate(done, { opacity: [0, 1], scale: [0.95, 1] }, { type: 'spring', bounce: 0.35, duration: 0.6 });
      window.__m.animate('.wiz__ok', { scale: [0, 1], rotate: [-90, 0] }, { type: 'spring', bounce: 0.5, duration: 0.8, delay: 0.1 });
    }
  }, 900);
});
$('[data-restart]', wiz).addEventListener('click', () => {
  wiz.reset(); $$('.is-bad', wiz).forEach(i => i.classList.remove('is-bad')); $$('.err', wiz).forEach(x => (x.textContent = ''));
  $('.wiz__done', wiz).hidden = true; go(1);
});
go(1, true);
$('[data-year]').textContent = new Date().getFullYear();

/* ---------- Заголовок: разбивка на слова (с сохранением выделения) ---------- */
const title = $('[data-pop]');
(function split(node) {
  [...node.childNodes].forEach(ch => {
    if (ch.nodeType === 3) {
      const frag = document.createDocumentFragment();
      ch.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
      });
      node.replaceChild(frag, ch);
    } else if (ch.classList && ch.classList.contains('mark')) {
      ch.classList.add('w');
    }
  });
})(title);
const words = $$('.w', title);
const mark = $('.mark', title);
const reveals = $$('[data-reveal]');
const art = $('[data-art]');

function fallback() {
  words.forEach((w, i) => setTimeout(() => w.classList.add('revealed'), 70 * i));
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
}
function withMotion({ animate, inView, stagger }) {
  animate(words, { opacity: [0, 1], y: [30, 0] }, { delay: stagger(0.06, { startDelay: 0.1 }), type: 'spring', bounce: 0.4, duration: 0.8 });
  animate(0, 1, { delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1], onUpdate: v => mark.style.setProperty('--mk', v) });
  mark.style.setProperty('--mk', 0);
  animate(art, { opacity: [0, 1], scale: [0.8, 1], rotate: [-4, 0] }, { type: 'spring', bounce: 0.45, duration: 1, delay: 0.2 });
  animate('.float', { opacity: [0, 1], scale: [0.4, 1] }, { delay: stagger(0.15, { startDelay: 0.9 }), type: 'spring', bounce: 0.55, duration: 0.7 });
  reveals.forEach(el => inView(el, () => {
    const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    const i = Math.max(0, sibs.indexOf(el));
    const delay = (i % 6) * 0.07 + (el.closest('.hero') ? 0.5 : 0);
    animate(el, { opacity: [0, 1], y: [30, 0] }, { delay, type: 'spring', bounce: 0.35, duration: 0.8 })
      .then(() => el.classList.add('revealed'));
  }, { margin: '0px 0px -8% 0px' }));
}
if (reduce) {
  [...words, ...reveals].forEach(el => el.classList.add('revealed'));
} else {
  Promise.race([import('https://cdn.jsdelivr.net/npm/motion@12/+esm'), new Promise((_, r) => setTimeout(r, 4000))])
    .then(m => { window.__m = m; withMotion(m); })
    .catch(fallback);
}
