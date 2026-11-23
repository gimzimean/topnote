// 비트(옛 탑노트) 블로그 만들기 (2판, 2026-11-21 대표 「더 정리 잘된, 보기 쉬운 블로그」)
// 새 글은 예전 틀(h1 · p.lead · h2 · FAQ dl · div.cta · div.more)로 guide/<slug>.html 에 쓰고 `node tools/blogify.mjs`.
// 원본은 _src/guide · _src/tips 에 보관하고, 매번 원본에서 모든 글을 다시 만든다(디자인을 바꾸면 전체에 반영).
// 사진은 assets/blog/pool.json (모두 사람 나오는 장면). 디자인은 assets/blog.css.
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const SITE = 'https://beet.my';
const pool = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/blog/pool.json'), 'utf8'));

const HUB = [
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
  ['솔크탈출', 'solkeu-escape'], ['크리스마스', 'christmas-dating'],
];
const KEYWORDS = '비트, 비트 앱, 전화 소개팅, 전화 로테이션 소개팅, 전화 미팅, 2:2 미팅, 전화 단체 미팅, 전화 솔로파티, 솔크, 솔크탈출, 크리스마스, 보이스 소개팅, 검증된 소개팅, 전문직 소개팅';
const CATS = [
  ['phone', '전화로 만나기'], ['season', '시즌·크리스마스'], ['talk', '첫 통화·대화'], ['safe', '안전·검증'], ['love', '연애 고민'], ['tip', '연애 팁'],
];
const catName = (k) => CATS.find(([c]) => c === k)[1];
function catOf(slug, title = '') {
  const s = slug + ' ' + title;
  if (/^tip-/.test(slug)) return 'tip';
  if (/christmas|solkeu|pepero|크리스마스|솔크|빼빼로/.test(s)) return 'season';
  if (/phone-|voice-dating|rotation|group-talk|no-photo|matchmaker|verified-dating|professional|office-dating|first-time-dating|dating-app|one-on-one/.test(slug)) return 'phone';
  if (/safe|scam|marital|acquaint|meetup-safety|verify|photo-vs-real/.test(slug)) return 'safe';
  if (/call|talk|conversation|opening|silence|reaction|speech|humor|compliment|self-intro|nervous|voice|interview/.test(slug)) return 'talk';
  return 'love';
}

const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function theme(slug, title = '') {
  const s = slug + ' ' + title;
  if (/christmas|solkeu|pepero|크리스마스|솔크|빼빼로|연말/.test(s)) return 'xmas';
  if (/rotation|로테이션/.test(s)) return 'rot';
  if (/group|meeting|party|meetup|friends|미팅|파티|모임|4인|수다/.test(s)) return 'group';
  if (/time-cost|busy|준비/.test(s)) return 'prep';
  return 'call';
}
const pick = (arr, h, k = 0) => arr[(h + k * 7919) % arr.length];
const by = (t, g) => pool.filter((p) => p.t === t && (!g || p.g === g)).map((p) => p.n);
function photos(slug, title = '') {
  const t = theme(slug, title), h = hash(slug);
  const W = by('call', 'w'), M = by('call', 'm');
  let hero;
  if (t === 'xmas') hero = [pick(by('xmas', 'w'), h), pick(by('xmas', 'm'), h)];
  else if (t === 'group') hero = [pick(by('group'), h), pick(by('group'), h, 1)];
  else if (t === 'rot') hero = [pick(by('rot'), h), pick(W, h)];
  else if (t === 'prep') hero = [pick(by('prep'), h), pick(M, h)];
  else hero = [pick(W, h), pick(M, h)];
  if (hero[0] === hero[1]) hero[1] = pick(t === 'group' ? by('group') : M, h, 2);
  if (h % 2) hero.reverse();
  const mid = [pick(W, h, 3), pick(M, h, 3)];
  return { t, hero, mid };
}
const CAPTIONS = {
  call: '집에서 편한 옷으로, 목소리로 먼저 만나요', xmas: '크리스마스 전에, 솔크 탈출', group: '넷이 목소리로 10분, 전화 미팅',
  rot: '로테이션 소개팅을 전화로', prep: '준비 2시간 대신 통화 3분',
};
const img = (n) => `/assets/blog/${n}.webp`;
const ogImg = (n) => `${SITE}/assets/blog/og/${n}.jpg`;
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const attr = (s) => strip(s).replace(/"/g, '&quot;');
const fmt = (d) => (d ? d.replace(/-/g, '.') : '');
const thumb = (n, alt, eager) => `<img src="${img(n)}" alt="${attr(alt)}" width="720" height="900" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

const HEADER = `<header class="tb"><div class="tb-in"><a class="logo" href="/guide/"><svg class="bm" viewBox="8 2 48 58" aria-hidden="true"><path d="M32 22 L28 6 M32 22 L36 4 M32 22 L42 8" stroke="#5E9B3C" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M32 58 C10 42 8 26 18 20 C25 16 30 20 32 25 C34 20 39 16 46 20 C56 26 54 42 32 58Z" fill="#9B2C4B"/></svg>비트 <span>블로그</span></a><nav><a href="/guide/#phone">전화로 만나기</a><a href="/guide/#season">크리스마스</a><a href="/guide/">전체 글</a><a class="get" href="https://beet.my/">앱 받기</a></nav></div></header>`;
const FOOTER = `<footer class="ft"><div class="ft-in"><p class="ft-logo"><svg class="bm" viewBox="8 2 48 58" aria-hidden="true"><path d="M32 22 L28 6 M32 22 L36 4 M32 22 L42 8" stroke="#5E9B3C" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M32 58 C10 42 8 26 18 20 C25 16 30 20 32 25 C34 20 39 16 46 20 C56 26 54 42 32 58Z" fill="#9B2C4B"/></svg>비트</p><p>검증된 사람과 3분 통화 소개팅부터.</p><p class="ft-links"><a href="/">비트 홈</a><a href="/guide/">블로그</a><a href="/faq.html">자주 묻는 질문</a><a href="/community-guidelines.html">안전 수칙</a><a href="/privacy.html">개인정보처리방침</a></p><p class="biz">몬타나 주식회사 (Montana CO.,Ltd) · 대표자 김석 · 사업자등록번호 148-87-01772 · 통신판매업 제2026-부산동래-0486호 · support@zzend.app</p></div></footer>`;
const HEADLINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&family=Noto+Serif+KR:wght@600;700&display=swap"><link rel="stylesheet" href="/assets/blog.css?v=3"><meta name="keywords" content="${KEYWORDS}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#F7F1E8">`;
const APP = `<div class="app-btns"><a href="https://apps.apple.com/kr/app/id6813747102">App Store</a><a href="https://play.google.com/store/apps/details?id=com.topnote.app">Google Play</a></div>`;
const CTA = `<aside class="cta-card"><div><p class="kicker">BEET</p><p class="cta-h">검증된 사람과 3분 통화 소개팅부터.</p><p class="cta-s">검증된 전문직·사업가·대기업 재직자와 사진 말고 목소리로 먼저 이야기해요.</p></div>${APP}</aside>`;
const tagsHtml = () => `<div class="tags">${TAGS.map(([t, s]) => `<a href="/guide/${s}.html">#${t}</a>`).join('')}</div>`;

// ── 원본 읽기
// 이름 바꿈(2026-11-21 탑노트 → 비트, 4인 수다 → 2:2 미팅): 원본에 옛 이름이 남아 있어도 글은 새 이름으로 만든다.
const RENAME = [['탑노트 에디터', '비트 에디터'], ['탑노트', '비트'], ['4인 수다는', '2:2 미팅은'], ['4인 수다를', '2:2 미팅을'], ['4인 수다가', '2:2 미팅이'], ['4인 수다와', '2:2 미팅과'], ['4인 수다로', '2:2 미팅으로'], ['4인 수다', '2:2 미팅'], ['처음 만난 검증된 넷이', '처음 만난 검증된 남녀 2:2가'], ['처음 만난 넷이', '처음 만난 남녀 2:2가'], ['2:2 미팅」가', '2:2 미팅」이'], ['2:2 미팅」를', '2:2 미팅」을'], ['2:2 미팅」는', '2:2 미팅」은']];
const renamed = (t) => RENAME.reduce((x, [a, b]) => x.split(a).join(b), t);
function readSrc(file, kind) {
  const html = renamed(fs.readFileSync(file, 'utf8'));
  const base = path.basename(file, '.html');
  const slug = kind === 'tip' ? `tip-${base}` : base;
  const main = html.match(/<main>([\s\S]*?)<\/main>/)[1];
  const h1 = main.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const lead = (main.match(/<p class="lead">([\s\S]*?)<\/p>/) || [, ''])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1];
  const p = (html.match(/"datePublished":"([\d-]+)"/) || [])[1];
  const m = (html.match(/"dateModified":"([\d-]+)"/) || [])[1] || p;
  let links = [...((main.match(/<div class="more">([\s\S]*?)<\/div>/) || [, ''])[1].matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g))].map((x) => [x[1], x[2]]).filter(([h]) => h.startsWith('/guide/'));
  const cover = main.match(/<img class="cover" src="([^"]+)"/);
  let content = main.replace(/<p><a href="\/tips\/">[\s\S]*?<\/a><\/p>/, '').replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<p class="lead">[\s\S]*?<\/p>/, '')
    .replace(/<img class="cover"[^>]*>/, '').replace(/<div class="cta">[\s\S]*?<\/div>/, '').replace(/<p>함께 보면 좋은 글<\/p>/, '')
    .replace(/<div class="more">[\s\S]*?<\/div>/, '').replace(/<div class="box">[\s\S]*<\/div>\s*$/, '').trim();
  return { html, kind, base, slug, h1, lead, desc, d: { p, m }, links, cover: cover && cover[1], content };
}

// ── 본문 다듬기
function shapeContent(a, ph) {
  let c = a.content;
  // FAQ 떼어 내기
  let faq = [];
  c = c.replace(/<h2>자주 묻는 질문<\/h2>\s*<dl>([\s\S]*?)<\/dl>/, (_, dl) => { faq = [...dl.matchAll(/<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)].map((x) => [x[1], x[2]]); return ''; });
  // 소제목 번호·id
  const toc = []; let i = 0;
  c = c.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, x) => { i += 1; toc.push([`s${i}`, strip(x)]); return `<h2 id="s${i}"><span class="no">${String(i).padStart(2, '0')}</span>${x}</h2>`; });
  // 단계 목록·체크 목록·표
  c = c.replace(/<ol>/g, '<ol class="steps">').replace(/<ul>/g, '<ul class="checks">').replace(/<table>/g, '<div class="tbl"><table>').replace(/<\/table>/g, '</table></div>');
  // 사진: 두 번째 소제목 앞 한 곳(카드 이미지가 있으면 세 번째 앞에 하나 더)
  const cap = CAPTIONS[ph.t];
  const fig = `<figure class="ph mid"><div class="ph-row">${ph.mid.map((n, k) => thumb(n, `${strip(a.h1)} - ${cap} ${k + 1}`)).join('')}</div><figcaption>${cap}</figcaption></figure>`;
  if (toc.length >= 2) c = c.replace('<h2 id="s2">', `${fig}<h2 id="s2">`); else c += fig;
  if (a.cover) {
    const card = `<figure class="ph card"><div class="ph-row"><img src="${a.cover}" alt="${attr(a.h1)}" loading="lazy"></div><figcaption>비트 카드</figcaption></figure>`;
    c = toc.length >= 3 ? c.replace('<h2 id="s3">', `${card}<h2 id="s3">`) : c + card;
  }
  return { c, toc, faq };
}

function article(a) {
  const ph = photos(a.slug, strip(a.h1) + ' ' + strip(a.lead));
  const cat = catOf(a.slug, strip(a.h1));
  const { c, toc, faq } = shapeContent(a, ph);
  const min = Math.max(2, Math.ceil((strip(c).length + strip(a.lead).length) / 550));
  const lead = a.lead || a.desc || strip(a.h1);
  // head
  let head = a.html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<style>[\s\S]*?<\/style>/, '').replace(/<link rel="stylesheet"[^>]*>|<link rel="preconnect"[^>]*>|<meta name="(keywords|twitter:card|theme-color)"[^>]*>/g, '');
  head = head.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${ogImg(ph.hero[0])}$2`)
    .replace(/("@type":"Article"[\s\S]*?"image":)("[^"]*"|\{[^}]*\})/, `$1{"@type":"ImageObject","url":"${ogImg(ph.hero[0])}","width":1200,"height":630}`);
  if (faq.length && !/FAQPage/.test(head)) head += `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, x]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(x) } })) })}</script>`;
  head += HEADLINKS;
  // 관련 글
  const rel = [...a.links];
  for (const [s, t] of HUB) if (rel.length < 3 && s !== a.slug && !rel.some(([h]) => h.includes(s))) rel.push([`/guide/${s}.html`, t]);
  const relHtml = rel.slice(0, 3).map(([href, t]) => {
    const m = href.match(/\/guide\/([\w-]+)\.html/);
    const p = m ? photos(m[1], t).hero[0] : pick(by('call'), hash(href));
    return `<a class="rel-card" href="${href}">${thumb(p, t)}<span><small>${m ? catName(catOf(m[1], t)) : ''}</small><b>${t}</b></span></a>`;
  }).join('');
  const tocHtml = toc.length ? `<ol>${toc.map(([id, x]) => `<li><a href="#${id}">${x}</a></li>`).join('')}${faq.length ? '<li><a href="#faq">자주 묻는 질문</a></li>' : ''}</ol>` : '';
  const listHref = cat === 'tip' ? '/guide/#tip' : `/guide/#${cat}`;
  const body = `<body data-blog="2">${HEADER}
<div class="wrap">
<article class="post">
<nav class="crumb" aria-label="위치"><a href="/guide/">블로그</a><span>›</span><a href="${listHref}">${catName(cat)}</a></nav>
<h1>${a.h1}</h1>
<div class="meta"><span class="av"><svg class="bm" viewBox="8 2 48 58" aria-hidden="true"><path d="M32 22 L28 6 M32 22 L36 4 M32 22 L42 8" stroke="#5E9B3C" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M32 58 C10 42 8 26 18 20 C25 16 30 20 32 25 C34 20 39 16 46 20 C56 26 54 42 32 58Z" fill="#9B2C4B"/></svg></span><span><b>비트 에디터</b><small>${a.d.p ? `<time datetime="${a.d.p}">${fmt(a.d.p)}</time>` : ''}${a.d.m && a.d.m !== a.d.p ? ` · 업데이트 <time datetime="${a.d.m}">${fmt(a.d.m)}</time>` : ''} · ${min}분 읽기</small></span></div>
<figure class="ph hero"><div class="ph-row">${ph.hero.map((n, k) => thumb(n, `${strip(a.h1)} ${k + 1}`, true)).join('')}</div></figure>
<section class="summary" aria-label="요약"><p class="sum-l">30초 요약</p><p class="sum-t">${lead}</p>${toc.length > 1 ? `<details class="toc-m"><summary>이 글의 순서 ${toc.length + (faq.length ? 1 : 0)}</summary>${tocHtml}</details>` : ''}</section>
<div class="content">
${c}
</div>
${faq.length ? `<section class="faq" id="faq"><h2 class="faq-h"><span class="no">Q&amp;A</span>자주 묻는 질문</h2>${faq.map(([q, x], k) => `<details${k === 0 ? ' open' : ''}><summary>${q}</summary><p>${x}</p></details>`).join('')}</section>` : ''}
${CTA}
${tagsHtml()}
<section class="rel"><h2 class="sec-h">이어서 읽기</h2><div class="rel-grid">${relHtml}</div></section>
</article>
<aside class="side"><div class="side-in">${toc.length > 1 ? `<nav class="toc" aria-label="목차"><p class="side-l">목차</p>${tocHtml}</nav>` : ''}<div class="side-app"><p class="side-l">BEET</p><p class="side-h">검증된 사람과<br>3분 통화 소개팅부터.</p>${APP}</div></div></aside>
</div>
${FOOTER}</body></html>
`;
  return `<!doctype html>\n<html lang="ko"><head>${head.trim()}</head>${body}`;
}

// ── 목록
function indexPage(items) {
  const featured = items.filter((x) => HUB.some(([s]) => s === x.slug));
  const card = (x) => `<a class="list-card" href="${x.href}" data-cat="${x.cat}">${thumb(x.p, x.t)}<span><small>${catName(x.cat)}</small><b>${x.t}</b><em>${x.desc}</em><i>${fmt(x.dp)}</i></span></a>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: '비트 블로그', url: `${SITE}/guide/`, inLanguage: 'ko', publisher: { '@type': 'Organization', name: '몬타나 주식회사' }, blogPost: items.map((x) => ({ '@type': 'BlogPosting', headline: x.t, url: SITE + x.href, datePublished: x.dp || undefined, image: ogImg(x.p) })) };
  const counts = Object.fromEntries(CATS.map(([c]) => [c, items.filter((x) => x.cat === c).length]));
  return `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>비트 블로그 · 전화 소개팅·2:2 전화 미팅 가이드</title><meta name="description" content="전화 소개팅, 전화 로테이션 소개팅, 전화 미팅, 전화 단체 미팅, 전화 솔로파티, 크리스마스 솔크 탈출까지. 검증된 사람과 목소리로 먼저 만나는 비트 블로그예요."><link rel="canonical" href="${SITE}/guide/">
<meta property="og:type" content="website"><meta property="og:url" content="${SITE}/guide/"><meta property="og:title" content="비트 블로그"><meta property="og:description" content="전화 소개팅·전화 미팅·전화 솔로파티·솔크 탈출 가이드"><meta property="og:image" content="${ogImg(featured[0]?.p || items[0].p)}"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="비트">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
${HEADLINKS}</head><body data-blog="2">${HEADER}
<main class="home">
<section class="home-hero"><p class="kicker">BEET BLOG</p><h1>목소리로 먼저 만나는 법</h1><p>전화 소개팅부터 전화 미팅, 전화 솔로파티, 크리스마스 솔크 탈출까지.<br>검증된 사람과 시간 낭비 없이 만나는 이야기를 모았어요.</p></section>
<section class="ways" aria-label="비트에서 만나는 방법"><h2 class="sec-h">비트에서 만나는 방법은 딱 두 가지예요</h2><p class="ways-lead">이름은 여러 가지로 불리지만, 실제로 하는 건 이 두 가지예요. 둘 다 카카오톡 승인으로 전자서명으로 검증해 검증된 사람만 들어와요.</p><div class="ways-grid">
${(() => { const one = items.find((y) => y.slug === 'phone-dating'); const two = items.find((y) => y.slug === 'phone-meeting'); return [
  [one, '01', '1:1 전화 · 3분', '검증된 한 사람과 사진 없이 목소리로 3분 이야기해요. 둘 다 원하면 사진과 인증이 함께 열리고, 다시 둘 다 원하면 번호를 주고받아요.', [['phone-dating', '전화 소개팅'], ['phone-rotation-dating', '전화 로테이션 소개팅'], ['voice-dating', '보이스 소개팅']]],
  [two, '02', '2:2 미팅 · 10분', '처음 만난 남녀 2:2가 목소리로 10분 이야기해요. 매일 저녁 5시부터 밤 11시까지 매시 정각에 방이 열리고, 끝나면 마음에 든 사람을 몰래 골라요. 서로 고르면 바로 사진이 열려요.', [['phone-meeting', '전화 미팅'], ['phone-group-meeting', '전화 단체 미팅'], ['phone-solo-party', '전화 솔로파티']]],
].filter(([x]) => x).map(([x, no, t, d, names]) => `<a class="way" href="${x.href}">${thumb(x.p, t)}<span class="way-in"><i class="way-no">${no}</i><b>${t}</b><em>${d}</em><span class="way-names">이렇게도 불러요 · ${names.map(([, n]) => n).join(' · ')}</span><span class="way-go">자세히 보기 →</span></span></a>`).join(''); })()}
</div><p class="ways-note">크리스마스 전에 새 사람을 만나고 싶다면 <a href="/guide/solkeu-escape.html">솔크 탈출 가이드</a>부터 읽어 보세요.</p></section>
<section class="all" aria-label="모든 글"><div class="tabs" role="tablist"><button class="on" data-f="all">전체 <i>${items.length}</i></button>${CATS.filter(([c]) => counts[c]).map(([c, n]) => `<button data-f="${c}" id="${c}">${n} <i>${counts[c]}</i></button>`).join('')}</div>
<div class="list-grid">${items.map(card).join('')}</div></section>
${CTA}
${tagsHtml()}
</main>${FOOTER}
<script>(function(){var b=document.querySelectorAll('.tabs button'),c=document.querySelectorAll('.list-card');function f(k){b.forEach(function(x){x.classList.toggle('on',x.dataset.f===k)});c.forEach(function(x){x.hidden=!(k==='all'||x.dataset.cat===k)})}b.forEach(function(x){x.addEventListener('click',function(){f(x.dataset.f);history.replaceState(null,'',x.dataset.f==='all'?location.pathname:'#'+x.dataset.f)})});var h=location.hash.slice(1);if(h&&document.querySelector('[data-f="'+h+'"]'))f(h)})();</script>
</body></html>
`;
}

// ── 실행: 새 원본을 _src 로 옮기고, 원본에서 전부 다시 만든다
const items = [];
for (const [dir, kind, test] of [['guide', 'guide', (f) => f.endsWith('.html') && f !== 'index.html'], ['tips', 'tip', (f) => /^\d+\.html$/.test(f)]]) {
  const out = path.join(ROOT, dir), src = path.join(ROOT, '_src', dir);
  fs.mkdirSync(src, { recursive: true });
  for (const f of fs.readdirSync(out).filter(test)) {
    const h = fs.readFileSync(path.join(out, f), 'utf8');
    if (!/data-blog=/.test(h)) fs.writeFileSync(path.join(src, f), h); // 새로 쓴 원본
  }
  for (const f of fs.readdirSync(src).filter(test)) {
    const a = readSrc(path.join(src, f), kind);
    fs.writeFileSync(path.join(out, f), article(a));
    const t = strip(a.h1);
    items.push({ slug: a.slug, href: `/${dir}/${f}`, t, desc: a.desc || strip(a.lead), dp: a.d.p, cat: catOf(a.slug, t), p: photos(a.slug, t + ' ' + strip(a.lead)).hero[0] });
  }
}
items.sort((x, y) => (y.dp || '').localeCompare(x.dp || '') || x.slug.localeCompare(y.slug));
fs.writeFileSync(path.join(ROOT, 'guide', 'index.html'), indexPage(items));
console.log(`글 ${items.length}개 다시 만듦 · 블로그 목록 갱신`);
