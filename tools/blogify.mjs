// 탑노트 블로그 꾸미기: guide/*.html · tips/*.html 을 사진 넣은 블로그 글로 바꾼다.
// 새 글을 예전 틀(h1 · p.lead · h2 · FAQ dl · div.cta · div.more)로 쓰고 `node tools/blogify.mjs` 를 돌리면 된다.
// 이미 바꾼 글(data-blog)은 건너뛴다. 사진은 assets/blog/pool.json (모두 사람 나오는 장면).
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://topnote.app';
const pool = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/blog/pool.json'), 'utf8'));

export const HUB = [
  ['phone-dating', '전화 소개팅', '사진 없이 목소리로 3분 먼저'],
  ['phone-rotation-dating', '전화 로테이션 소개팅', '하루 한 사람씩, 3분씩'],
  ['phone-meeting', '전화 미팅', '술집 말고 2:2, 넷이 10분'],
  ['phone-group-meeting', '전화 단체 미팅', '셋 이상 원하면 다 같이'],
  ['phone-solo-party', '전화 솔로파티', '매일 저녁 정각, 집에서'],
  ['solkeu-escape', '솔크 탈출', '크리스마스 전에 새 사람'],
];
const TAGS = [
  ['전화소개팅', 'phone-dating'], ['전화로테이션소개팅', 'phone-rotation-dating'], ['전화미팅', 'phone-meeting'],
  ['전화단체미팅', 'phone-group-meeting'], ['전화솔로파티', 'phone-solo-party'], ['솔크', 'solkeu-escape'],
  ['솔크탈출', 'solkeu-escape'], ['크리스마스', 'christmas-dating'], ['검증된소개팅', 'verified-dating-app'],
];
const KEYWORDS = '전화 소개팅, 전화 로테이션 소개팅, 전화 미팅, 전화 단체 미팅, 전화 솔로파티, 솔크, 솔크탈출, 크리스마스, 보이스 소개팅, 검증된 소개팅, 전문직 소개팅, 탑노트';
const CAPTIONS = {
  call: ['집에서 편한 옷으로, 목소리로 먼저 만나요', '사진보다 대화가 통하는지 먼저', '퇴근하고 3분, 새 사람과 이야기해요'],
  xmas: ['크리스마스 전에, 솔크 탈출', '올해 크리스마스는 둘이서', '연말에는 새 사람과 이야기해요'],
  group: ['넷이 목소리로 10분, 전화 미팅', '전화 단체 미팅처럼 가볍게', '집에서 하는 전화 솔로파티'],
  rot: ['로테이션 소개팅을 전화로', '하루 한 사람씩, 3분씩', '짧게 여러 사람을 만나 봐요'],
  prep: ['준비 2시간 대신 통화 3분', '꾸미고 나가기 전에 목소리로 먼저', '시간 낭비 없는 소개팅'],
};

const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export function theme(slug, title = '') {
  const s = slug + ' ' + title;
  if (/christmas|solkeu|pepero|크리스마스|솔크|빼빼로|연말/.test(s)) return 'xmas';
  if (/rotation|로테이션/.test(s)) return 'rot';
  if (/group|meeting|party|meetup|friends|미팅|파티|모임|4인|수다/.test(s)) return 'group';
  if (/time-cost|busy|준비|시간/.test(s)) return 'prep';
  return 'call';
}
const pick = (arr, h, k = 0) => arr[(h + k * 7919) % arr.length];
const by = (t, g) => pool.filter((p) => p.t === t && (!g || p.g === g)).map((p) => p.n);
export function photos(slug, title = '') {
  const t = theme(slug, title), h = hash(slug);
  const callW = by('call', 'w'), callM = by('call', 'm');
  let hero;
  if (t === 'xmas') hero = [pick(by('xmas', 'w'), h), pick(by('xmas', 'm'), h)];
  else if (t === 'group') hero = [pick(by('group'), h), pick(by('group'), h, 1)];
  else if (t === 'rot') hero = [pick(by('rot'), h), pick(callW, h)];
  else if (t === 'prep') hero = [pick(by('prep'), h), pick(callM, h)];
  else hero = [pick(callW, h), pick(callM, h)];
  if (hero[0] === hero[1]) hero[1] = pick(t === 'group' ? by('group') : callM, h, 2);
  const inline = [
    [pick(callW, h, 3), pick(callM, h, 3)],
    [t === 'xmas' ? pick(by('xmas'), h, 4) : t === 'group' || t === 'rot' ? pick(by('group'), h, 4) : pick(callW, h, 5)],
  ];
  return { t, hero, inline };
}
const img = (n) => `/assets/blog/${n}.webp`;
const ogImg = (n) => `${SITE}/assets/blog/og/${n}.jpg`;
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const attr = (s) => strip(s).replace(/"/g, '&quot;');

function fig(names, cap, alt, cls = '') {
  return `<figure class="ph ${cls} n${names.length}"><div class="ph-row">${names.map((n, i) => `<img src="${img(n)}" alt="${attr(alt)}${names.length > 1 ? ` ${i + 1}` : ''}" width="720" height="900" loading="lazy" decoding="async">`).join('')}</div><figcaption>${cap}</figcaption></figure>`;
}
function hub(cur) {
  return `<section class="hub" aria-label="전화로 만나는 방법"><p class="kicker">TOP NOTE PICK</p><h2 class="hub-h">전화로 만나는 6가지 방법</h2><div class="hub-grid">${HUB.filter(([s]) => s !== cur).slice(0, 6).map(([s, t, d]) => {
    const p = photos(s, t).hero[0];
    return `<a class="hub-card" href="/guide/${s}.html"><img src="${img(p)}" alt="${t}" loading="lazy" width="720" height="900"><span><b>${t}</b><small>${d}</small></span></a>`;
  }).join('')}</div></section>`;
}
const tags = () => `<div class="tags">${TAGS.map(([t, s]) => `<a href="/guide/${s}.html">#${t}</a>`).join('')}</div>`;
const cta = () => `<aside class="cta-card"><p class="kicker">TOP NOTE</p><p class="cta-h">만나기 전에, 3분 먼저.</p><p class="cta-s">검증된 전문직·사업가·대기업 재직자와<br>사진 말고 목소리로 먼저 이야기해요.</p><div class="cta-btn"><a href="https://apps.apple.com/kr/app/id6813747102">App Store</a><a href="https://play.google.com/store/apps/details?id=com.topnote.app">Google Play</a></div></aside>`;
function related(links) {
  if (!links.length) return '';
  return `<section class="rel"><h2 class="rel-h">함께 보면 좋은 글</h2><div class="rel-grid">${links.slice(0, 6).map(([href, t]) => {
    const m = href.match(/\/guide\/([\w-]+)\.html/);
    const p = m ? photos(m[1], t).hero[0] : pick(by('call'), hash(href));
    return `<a class="rel-card" href="${href}"><img src="${img(p)}" alt="${attr(t)}" loading="lazy" width="720" height="900"><span>${t}</span></a>`;
  }).join('')}</div></section>`;
}
const HEADER = `<header class="tb"><div class="tb-in"><a class="logo" href="/guide/">T<i>.</i> 탑노트 <span>블로그</span></a><nav><a href="/guide/">가이드</a><a href="/tips/">연애 팁</a><a class="get" href="https://topnote.app/">앱 받기</a></nav></div></header>`;
const FOOTER = `<footer class="ft"><div class="ft-in"><p class="ft-logo">T<i>.</i> 탑노트</p><p>만나기 전에 검증된 사람과 목소리로 3분 먼저.</p><p><a href="/">탑노트 홈</a> · <a href="/guide/">블로그</a> · <a href="/tips/">연애 팁</a> · <a href="/faq.html">자주 묻는 질문</a> · <a href="/community-guidelines.html">안전 수칙</a> · <a href="/privacy.html">개인정보처리방침</a></p><p class="biz">몬타나 주식회사 (Montana CO.,Ltd) · 대표자 김석 · 사업자등록번호 148-87-01772 · 통신판매업 제2026-부산동래-0486호 · support@zzend.app</p></div></footer>`;
const HEADLINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=Noto+Serif+KR:wght@600;700&display=swap"><link rel="stylesheet" href="/assets/blog.css?v=1"><meta name="keywords" content="${KEYWORDS}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#F7F1E8">`;

function fixHead(html, heroName) {
  html = html.replace(/<style>[\s\S]*?<\/style>/, HEADLINKS);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogImg(heroName)}$2`);
  html = html.replace(/("@type":"Article"[\s\S]*?"image":)"[^"]*"/, `$1{"@type":"ImageObject","url":"${ogImg(heroName)}","width":1200,"height":630}`);
  return html;
}
function dates(html) {
  const p = (html.match(/"datePublished":"([\d-]+)"/) || [])[1];
  const m = (html.match(/"dateModified":"([\d-]+)"/) || [])[1] || p;
  return { p, m };
}
const fmt = (d) => (d ? d.replace(/-/g, '.') : '');

function body({ cat, crumbHref, crumbName, h1, lead, content, hero, inline, slug, links, d, t, extraFig }) {
  // h2 에 id, 목차
  let i = 0; const toc = [];
  content = content.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, x) => { i += 1; const id = `s${i}`; toc.push([id, strip(x)]); return `<h2 id="${id}"><span class="no">${String(i).padStart(2, '0')}</span>${x}</h2>`; });
  // 사진: 2번째 · 4번째 소제목 앞 (자주 묻는 질문 앞이면 그 전)
  const caps = CAPTIONS[t];
  const h = hash(slug);
  const spots = [2, 4];
  spots.forEach((n, k) => {
    const id = `s${n}`;
    if (!toc[n - 1] || /자주 묻는 질문/.test(toc[n - 1][1])) return;
    const names = inline[k];
    content = content.replace(`<h2 id="${id}">`, `${fig(names, caps[(h + k + 1) % caps.length], `${strip(h1)} - ${caps[(h + k + 1) % caps.length]}`, k ? 'one' : '')}<h2 id="${id}">`);
  });
  if (extraFig) content = content.replace(/(<h2 id="s2">)/, `${extraFig}$1`);
  content = content.replace(/<h2 id="(s\d+)"><span class="no">\d+<\/span>자주 묻는 질문<\/h2>\s*<dl>/, '<h2 id="$1" class="faq-h"><span class="no">Q&amp;A</span>자주 묻는 질문</h2><dl class="faq">');
  const words = strip(content).length + strip(lead).length;
  const min = Math.max(2, Math.ceil(words / 550));
  return `<body data-blog="1">${HEADER}<main class="post">
<nav class="crumb" aria-label="위치"><a href="/">탑노트</a><span>›</span><a href="${crumbHref}">${crumbName}</a></nav>
<p class="cat">${cat}</p><h1>${h1}</h1>
<div class="meta"><span class="av">T.</span><span><b>탑노트 에디터</b><small>${d.p ? `<time datetime="${d.p}">${fmt(d.p)}</time>` : ''}${d.m && d.m !== d.p ? ` · 업데이트 <time datetime="${d.m}">${fmt(d.m)}</time>` : ''} · ${min}분 읽기</small></span></div>
${fig(hero, caps[h % caps.length], `${strip(h1)} - ${caps[h % caps.length]}`, 'hero')}
<div class="answer"><p class="answer-l">한 줄 답</p><p>${lead}</p></div>
${toc.length > 2 ? `<nav class="toc" aria-label="목차"><p class="toc-l">이 글의 순서</p><ol>${toc.map(([id, x]) => `<li><a href="#${id}">${x}</a></li>`).join('')}</ol></nav>` : ''}
<div class="content">
${content.trim()}
</div>
${tags()}
${cta()}
${hub(slug)}
${related(links)}
</main>${FOOTER}</body></html>
`;
}

function doGuide(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-blog="1"')) return false;
  const slug = path.basename(file, '.html');
  const main = html.match(/<main>([\s\S]*?)<\/main>/)[1];
  const h1 = main.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const lead = (main.match(/<p class="lead">([\s\S]*?)<\/p>/) || [, ''])[1];
  const links = [...((main.match(/<div class="more">([\s\S]*?)<\/div>/) || [, ''])[1].matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g))].map((m) => [m[1], m[2]]).filter(([h]) => h.startsWith('/guide/'));
  let content = main.replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<p class="lead">[\s\S]*?<\/p>/, '')
    .replace(/<div class="cta">[\s\S]*?<\/div>/, '').replace(/<p>함께 보면 좋은 글<\/p>/, '').replace(/<div class="more">[\s\S]*?<\/div>/, '');
  const ph = photos(slug, strip(h1));
  html = fixHead(html, ph.hero[0]);
  const d = dates(html);
  const cat = ph.t === 'xmas' ? '시즌 가이드' : /phone|voice|rotation|meeting|party|group/.test(slug) ? '전화로 만나기' : '연애 가이드';
  html = html.replace(/<body>[\s\S]*$/, body({ cat, crumbHref: '/guide/', crumbName: '블로그', h1, lead, content, hero: ph.hero, inline: ph.inline, slug, links, d, t: ph.t }));
  fs.writeFileSync(file, html);
  return true;
}

function doTip(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-blog="1"')) return false;
  const slug = 'tip-' + path.basename(file, '.html');
  const main = html.match(/<main>([\s\S]*?)<\/main>/)[1];
  const h1 = main.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const lead = (main.match(/<p class="lead">([\s\S]*?)<\/p>/) || [, ''])[1];
  const cover = main.match(/<img class="cover" src="([^"]+)"[^>]*>/);
  let content = main.replace(/<p><a href="\/tips\/">[\s\S]*?<\/a><\/p>/, '').replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<p class="lead">[\s\S]*?<\/p>/, '')
    .replace(/<img class="cover"[^>]*>/, '').replace(/<div class="box">[\s\S]*<\/div>\s*$/, '');
  const ph = photos(slug, strip(h1) + ' ' + strip(lead));
  html = fixHead(html, ph.hero[0]);
  const d = dates(html);
  const extraFig = cover ? `<figure class="ph card"><div class="ph-row"><img src="${cover[1]}" alt="${attr(h1)}" loading="lazy"></div><figcaption>탑노트 카드</figcaption></figure>` : '';
  const links = [['/guide/phone-dating.html', '전화 소개팅이란?'], ['/guide/phone-meeting.html', '전화 미팅이란?'], ['/guide/solkeu-escape.html', '솔크 탈출 방법 7가지'], ['/guide/voice-dating.html', '보이스 소개팅이란?']];
  html = html.replace(/<body>[\s\S]*$/, body({ cat: '연애 팁', crumbHref: '/tips/', crumbName: '연애 팁', h1, lead: lead || strip(h1), content, hero: ph.hero, inline: ph.inline, slug, links, d, t: ph.t, extraFig }));
  fs.writeFileSync(file, html);
  return true;
}

function guideIndex() {
  const files = fs.readdirSync(path.join(ROOT, 'guide')).filter((f) => f.endsWith('.html') && f !== 'index.html');
  const items = files.map((f) => {
    const h = fs.readFileSync(path.join(ROOT, 'guide', f), 'utf8');
    const t = strip((h.match(/<h1>([\s\S]*?)<\/h1>/) || [, ''])[1]);
    const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
    const dp = (h.match(/"datePublished":"([\d-]+)"/) || [, ''])[1];
    const s = f.replace('.html', '');
    return { s, t, desc, dp, p: photos(s, t).hero[0] };
  }).sort((a, b) => (b.dp || '').localeCompare(a.dp || '') || a.s.localeCompare(b.s));
  const card = (x) => `<a class="list-card" href="/guide/${x.s}.html"><img src="${img(x.p)}" alt="${attr(x.t)}" loading="lazy" width="720" height="900"><span><b>${x.t}</b><small>${x.desc}</small><em>${fmt(x.dp)}</em></span></a>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: '탑노트 블로그', url: `${SITE}/guide/`, inLanguage: 'ko', publisher: { '@type': 'Organization', name: '몬타나 주식회사' }, blogPost: items.map((x) => ({ '@type': 'BlogPosting', headline: x.t, url: `${SITE}/guide/${x.s}.html`, datePublished: x.dp || undefined, image: ogImg(x.p) })) };
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>탑노트 블로그 · 전화 소개팅·전화 미팅·솔크 탈출 가이드</title><meta name="description" content="전화 소개팅, 전화 로테이션 소개팅, 전화 미팅, 전화 단체 미팅, 전화 솔로파티, 크리스마스 솔크 탈출까지. 검증된 사람과 목소리로 먼저 만나는 탑노트 블로그예요."><link rel="canonical" href="${SITE}/guide/">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}/guide/"><meta property="og:title" content="탑노트 블로그"><meta property="og:description" content="전화 소개팅·전화 미팅·전화 솔로파티·솔크 탈출 가이드"><meta property="og:image" content="${ogImg(items[0].p)}"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="탑노트">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${HEADLINKS}</head><body data-blog="1">${HEADER}<main class="post list">
<p class="cat">TOP NOTE BLOG</p><h1>목소리로 먼저 만나는 법</h1>
<p class="list-lead">전화 소개팅부터 전화 미팅, 전화 솔로파티, 크리스마스 솔크 탈출까지. 검증된 사람과 시간 낭비 없이 만나는 이야기를 모았어요.</p>
${tags()}
${hub('')}
<h2 class="rel-h">모든 글 <small>${items.length}</small></h2>
<div class="list-grid">${items.map(card).join('')}</div>
${cta()}
</main>${FOOTER}</body></html>
`;
  fs.writeFileSync(path.join(ROOT, 'guide', 'index.html'), html);
  return items.length;
}

let n = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'guide'))) if (f.endsWith('.html') && f !== 'index.html') n += doGuide(path.join(ROOT, 'guide', f)) ? 1 : 0;
let m = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'tips'))) if (/^\d+\.html$/.test(f)) m += doTip(path.join(ROOT, 'tips', f)) ? 1 : 0;
const total = guideIndex();
console.log(`guide ${n} · tips ${m} 바꿈 · 블로그 목록 ${total}개`);
