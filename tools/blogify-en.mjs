// TopNote US blog (2026-11-21): same design as the Korean blog (tools/blogify.mjs, assets/blog.css), in English.
// Write new posts in the raw template (h1 · p.lead · h2 · <h2>FAQ</h2><dl> · div.cta) at us/guide/<slug>.html, then `node tools/blogify-en.mjs`.
// Raw sources live in _src/us/guide; every run rebuilds all pages. Photos: assets/blog/pool.json entries starting with "us-".
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://beet.my';
const pool = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/blog/pool.json'), 'utf8')).filter((p) => p.n.startsWith('us-'));
const OUT = path.join(ROOT, 'us', 'guide'), SRC = path.join(ROOT, '_src', 'us', 'guide');

const HUB = [
  ['voice-first-dating', 'Voice-first dating', 'Talk 3 minutes before photos'],
  ['phone-call-before-first-date', 'Call before the date', 'Skip the wasted evening'],
  ['first-call-tips', 'First call tips', 'What to say in 3 minutes'],
  ['avoid-catfishing', 'Avoid catfishing', 'Reviewed members, real voices'],
  ['dating-app-burnout', 'Dating app burnout', 'Less swiping, more talking'],
  ['busy-professional-dating', 'Busy professionals', 'Dating that fits your week'],
];
const TAGS = [['voicedating', 'voice-first-dating'], ['phonedate', 'phone-call-before-first-date'], ['firstcall', 'first-call-tips'], ['datingapps', 'dating-app-burnout'], ['catfish', 'avoid-catfishing'], ['busyprofessionals', 'busy-professional-dating']];
const CATS = [['voice', 'Voice-first dating'], ['call', 'First calls'], ['safe', 'Safety'], ['love', 'Dating advice']];
const catName = (k) => CATS.find(([c]) => c === k)[1];
function catOf(slug) {
  if (/voice-first|phone-call-before|ask-.*phone-call|video-call|burnout|texting|busy-professional|wont-get-on-a-call/.test(slug)) return 'voice';
  if (/catfish|scam|red-flag|safety|phone-number/.test(slug)) return 'safe';
  if (/call|nervous|chemistry|say-no|end-a|tell-me-about|group/.test(slug)) return 'call';
  return 'love';
}
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, k = 0) => arr[(h + k * 7919) % arr.length];
const by = (g, t) => pool.filter((p) => (!g || p.g === g) && (!t || p.t === t)).map((p) => p.n);
function photos(slug) {
  const h = hash(slug), xmas = /holiday|christmas|thanksgiving|new-year/.test(slug);
  const W = xmas ? by('w', 'usxmas') : by('w'), M = xmas ? by('m', 'usxmas') : by('m');
  const hero = [pick(W, h), pick(M, h)]; if (h % 2) hero.reverse();
  return { hero, mid: [pick(by('w'), h, 3), pick(by('m'), h, 3)] };
}
const img = (n) => `/assets/blog/${n}.webp`;
const ogImg = (n) => `${SITE}/assets/blog/og/${n}.jpg`;
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const attr = (s) => strip(s).replace(/"/g, '&quot;');
const fmt = (d) => (d ? new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
const thumb = (n, alt, eager) => `<img src="${img(n)}" alt="${attr(alt)}" width="720" height="900" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const IOS = 'https://apps.apple.com/us/app/id6813747102', PLAY = 'https://play.google.com/store/apps/details?id=com.topnote.app&hl=en_US&gl=US';
const HEADER = `<header class="tb"><div class="tb-in"><a class="logo" href="/us/guide/">T<i>.</i> TopNote <span>Journal</span></a><nav><a href="/us/guide/#voice">Voice dating</a><a href="/us/guide/#safe">Safety</a><a href="/us/guide/">All posts</a><a class="get" href="/us/">Get the app</a></nav></div></header>`;
const FOOTER = `<footer class="ft"><div class="ft-in"><p class="ft-logo">T<i>.</i> TopNote</p><p>Talk for 3 minutes before you meet. Photos after, only if you both say yes.</p><p class="ft-links"><a href="/us/">TopNote US</a><a href="/us/guide/">Journal</a><a href="/privacy-en.html">Privacy</a><a href="/terms-en.html">Terms</a><a href="/guide/" hreflang="ko">한국어</a></p><p class="biz">Montana CO.,Ltd · support@zzend.app</p></div></footer>`;
const HEADLINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"><link rel="stylesheet" href="/assets/blog.css?v=3"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#F7F1E8">`;
const APP = `<div class="app-btns"><a href="${IOS}">App Store</a><a href="${PLAY}">Google Play</a></div>`;
const CTA = `<aside class="cta-card"><div><p class="kicker">TOP NOTE</p><p class="cta-h">Talk first. Then decide.</p><p class="cta-s">Three minutes on the phone with a reviewed member. Photos only open if you both say yes.</p></div>${APP}</aside>`;
const tagsHtml = () => `<div class="tags">${TAGS.map(([t, s]) => `<a href="/us/guide/${s}.html">#${t}</a>`).join('')}</div>`;

function readSrc(file) {
  const html = fs.readFileSync(file, 'utf8');
  const slug = path.basename(file, '.html');
  const main = html.match(/<main>([\s\S]*?)<\/main>/)[1];
  const h1 = main.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const lead = (main.match(/<p class="lead">([\s\S]*?)<\/p>/) || [, ''])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  const p = (html.match(/"datePublished":"([\d-]+)"/) || [])[1];
  const m = (html.match(/"dateModified":"([\d-]+)"/) || [])[1] || p;
  const links = [...main.matchAll(/<a href="(\/us\/guide\/[\w-]+\.html)">([\s\S]*?)<\/a>/g)].map((x) => [x[1], strip(x[2])]);
  let content = main.replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<p class="lead">[\s\S]*?<\/p>/, '').replace(/<div class="cta">[\s\S]*?<\/div>/g, '')
    .replace(/<p>(Read next|More|Related)[^<]*<\/p>/gi, '').replace(/<div class="more">[\s\S]*?<\/div>/, '').trim();
  return { html, slug, h1, lead, desc, d: { p, m }, links, content };
}

function shapeContent(a, ph) {
  let c = a.content, faq = [];
  c = c.replace(/<h2>(FAQ|Frequently asked questions)<\/h2>\s*<dl>([\s\S]*?)<\/dl>/i, (_, __, dl) => { faq = [...dl.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map((x) => [x[1], x[2]]); return ''; });
  const toc = []; let i = 0;
  c = c.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, x) => { i += 1; toc.push([`s${i}`, strip(x)]); return `<h2 id="s${i}"><span class="no">${String(i).padStart(2, '0')}</span>${x}</h2>`; });
  c = c.replace(/<ol>/g, '<ol class="steps">').replace(/<ul>/g, '<ul class="checks">').replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');
  const cap = 'Voice first. Photos after.';
  const fig = `<figure class="ph mid"><div class="ph-row">${ph.mid.map((n, k) => thumb(n, `${strip(a.h1)} ${k + 1}`)).join('')}</div><figcaption>${cap}</figcaption></figure>`;
  c = toc.length >= 2 ? c.replace('<h2 id="s2">', `${fig}<h2 id="s2">`) : c + fig;
  return { c, toc, faq };
}

function article(a) {
  const ph = photos(a.slug), cat = catOf(a.slug);
  const { c, toc, faq } = shapeContent(a, ph);
  const min = Math.max(2, Math.ceil(strip(c + a.lead).split(' ').length / 220));
  let head = a.html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<style>[\s\S]*?<\/style>/, '').replace(/<link rel="stylesheet"[^>]*>|<link rel="preconnect"[^>]*>|<meta name="(twitter:card|theme-color)"[^>]*>/g, '');
  head = head.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogImg(ph.hero[0])}$2`).replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${ogImg(ph.hero[0])}$2`)
    .replace(/("@type":"Article"[\s\S]*?"image":)("[^"]*"|\{[^}]*\})/, `$1{"@type":"ImageObject","url":"${ogImg(ph.hero[0])}","width":1200,"height":630}`);
  if (faq.length && !/FAQPage/.test(head)) head += `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, x]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(x) } })) })}</script>`;
  head += HEADLINKS;
  const rel = a.links.filter(([h]) => !h.includes(`/${a.slug}.html`));
  for (const [s, t] of HUB) if (rel.length < 3 && s !== a.slug && !rel.some(([h]) => h.includes(`/${s}.html`))) rel.push([`/us/guide/${s}.html`, t]);
  const relHtml = rel.slice(0, 3).map(([href, t]) => { const s = href.match(/\/([\w-]+)\.html/)[1]; return `<a class="rel-card" href="${href}">${thumb(photos(s).hero[0], t)}<span><small>${catName(catOf(s))}</small><b>${t}</b></span></a>`; }).join('');
  const tocHtml = toc.length ? `<ol>${toc.map(([id, x]) => `<li><a href="#${id}">${x}</a></li>`).join('')}${faq.length ? '<li><a href="#faq">FAQ</a></li>' : ''}</ol>` : '';
  const body = `<body data-blog="2" class="en">${HEADER}
<div class="wrap">
<article class="post">
<nav class="crumb" aria-label="Breadcrumb"><a href="/us/guide/">Journal</a><span>›</span><a href="/us/guide/#${cat}">${catName(cat)}</a></nav>
<h1>${a.h1}</h1>
<div class="meta"><span class="av">T.</span><span><b>TopNote Editors</b><small>${a.d.p ? `<time datetime="${a.d.p}">${fmt(a.d.p)}</time>` : ''}${a.d.m && a.d.m !== a.d.p ? ` · Updated <time datetime="${a.d.m}">${fmt(a.d.m)}</time>` : ''} · ${min} min read</small></span></div>
<figure class="ph hero"><div class="ph-row">${ph.hero.map((n, k) => thumb(n, `${strip(a.h1)} ${k + 1}`, true)).join('')}</div></figure>
<section class="summary" aria-label="Summary"><p class="sum-l">30-SECOND SUMMARY</p><p class="sum-t">${a.lead || a.desc}</p>${toc.length > 1 ? `<details class="toc-m"><summary>In this post · ${toc.length + (faq.length ? 1 : 0)}</summary>${tocHtml}</details>` : ''}</section>
<div class="content">
${c}
</div>
${faq.length ? `<section class="faq" id="faq"><h2 class="faq-h"><span class="no">Q&amp;A</span>FAQ</h2>${faq.map(([q, x], k) => `<details${k === 0 ? ' open' : ''}><summary>${q}</summary><p>${x}</p></details>`).join('')}</section>` : ''}
${CTA}
${tagsHtml()}
<section class="rel"><h2 class="sec-h">Keep reading</h2><div class="rel-grid">${relHtml}</div></section>
</article>
<aside class="side"><div class="side-in">${toc.length > 1 ? `<nav class="toc" aria-label="Contents"><p class="side-l">CONTENTS</p>${tocHtml}</nav>` : ''}<div class="side-app"><p class="side-l">TOP NOTE</p><p class="side-h">Talk first.<br>Then decide.</p>${APP}</div></div></aside>
</div>
${FOOTER}</body></html>
`;
  return `<!doctype html>\n<html lang="en-US"><head>${head.trim()}</head>${body}`;
}

function indexPage(items) {
  const card = (x) => `<a class="list-card" href="/us/guide/${x.slug}.html" data-cat="${x.cat}">${thumb(x.p, x.t)}<span><small>${catName(x.cat)}</small><b>${x.t}</b><em>${x.desc}</em><i>${fmt(x.dp)}</i></span></a>`;
  const counts = Object.fromEntries(CATS.map(([c]) => [c, items.filter((x) => x.cat === c).length]));
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: 'TopNote Journal', url: `${SITE}/us/guide/`, inLanguage: 'en-US', publisher: { '@type': 'Organization', name: 'Montana CO.,Ltd' }, blogPost: items.map((x) => ({ '@type': 'BlogPosting', headline: x.t, url: `${SITE}/us/guide/${x.slug}.html`, datePublished: x.dp || undefined, image: ogImg(x.p) })) };
  return `<!doctype html>
<html lang="en-US"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TopNote Journal · Voice-First Dating Advice</title><meta name="description" content="Voice-first dating, first-call tips, avoiding catfish and dating app burnout. Short, honest guides from TopNote, the app where you talk for 3 minutes before you see photos."><link rel="canonical" href="${SITE}/us/guide/">
<link rel="alternate" hreflang="en-us" href="${SITE}/us/guide/"><link rel="alternate" hreflang="ko-kr" href="${SITE}/guide/">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}/us/guide/"><meta property="og:title" content="TopNote Journal"><meta property="og:description" content="Voice-first dating advice from TopNote."><meta property="og:image" content="${ogImg(items[0].p)}"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="TopNote">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${HEADLINKS}</head><body data-blog="2" class="en">${HEADER}
<main class="home">
<section class="home-hero"><p class="kicker">TOP NOTE JOURNAL</p><h1>Talk first. Then decide.</h1><p>Honest, short guides on voice-first dating, first calls, and meeting people without wasting your evening.</p></section>
<section class="feat" aria-label="Start here"><h2 class="sec-h">Start here</h2><div class="feat-grid">${HUB.map(([s, t, d]) => { const x = items.find((y) => y.slug === s); return x ? `<a class="feat-card" href="/us/guide/${s}.html">${thumb(x.p, t)}<span><b>${t}</b><small>${d}</small></span></a>` : ''; }).join('')}</div></section>
<section class="all" aria-label="All posts"><div class="tabs" role="tablist"><button class="on" data-f="all">All <i>${items.length}</i></button>${CATS.filter(([c]) => counts[c]).map(([c, n]) => `<button data-f="${c}" id="${c}">${n} <i>${counts[c]}</i></button>`).join('')}</div>
<div class="list-grid">${items.map(card).join('')}</div></section>
${CTA}
${tagsHtml()}
</main>${FOOTER}
<script>(function(){var b=document.querySelectorAll('.tabs button'),c=document.querySelectorAll('.list-card');function f(k){b.forEach(function(x){x.classList.toggle('on',x.dataset.f===k)});c.forEach(function(x){x.hidden=!(k==='all'||x.dataset.cat===k)})}b.forEach(function(x){x.addEventListener('click',function(){f(x.dataset.f);history.replaceState(null,'',x.dataset.f==='all'?location.pathname:'#'+x.dataset.f)})});var h=location.hash.slice(1);if(h&&document.querySelector('[data-f="'+h+'"]'))f(h)})();</script>
</body></html>
`;
}

fs.mkdirSync(SRC, { recursive: true });
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith('.html') && f !== 'index.html')) {
  const h = fs.readFileSync(path.join(OUT, f), 'utf8');
  if (!/data-blog=/.test(h)) fs.writeFileSync(path.join(SRC, f), h);
}
const items = [];
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.html'))) {
  const a = readSrc(path.join(SRC, f));
  fs.writeFileSync(path.join(OUT, f), article(a));
  items.push({ slug: a.slug, t: strip(a.h1), desc: a.desc || strip(a.lead), dp: a.d.p, cat: catOf(a.slug), p: photos(a.slug).hero[0] });
}
items.sort((x, y) => (y.dp || '').localeCompare(x.dp || '') || x.slug.localeCompare(y.slug));
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage(items));
console.log(`US posts ${items.length} rebuilt · journal index updated`);
