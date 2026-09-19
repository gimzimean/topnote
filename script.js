const form = document.querySelector('#waitlist-form');
const status = document.querySelector('#form-status');
const config = window.NAEILDO_CONFIG || {};
const params = new URLSearchParams(location.search);
const campaignSource = params.get('utm_source') || 'direct';
const campaignName = params.get('utm_campaign') || 'organic-beta';
const campaignContent = params.get('utm_content') || 'landing';
const isLocalFilePreview = location.protocol === 'file:' && params.get('e2e') !== '1';
const sessionId = sessionStorage.getItem('topnote-marketing-session') || crypto.randomUUID();
sessionStorage.setItem('topnote-marketing-session', sessionId);

async function trackMarketingEvent(eventName, details = {}) {
  if (isLocalFilePreview || !config.supabaseUrl || !config.supabaseAnonKey) return;
  await fetch(`${config.supabaseUrl}/rest/v1/marketing_events`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ event_name: eventName, session_id: sessionId, utm_source: campaignSource, utm_campaign: campaignName, utm_content: campaignContent, path: location.pathname, ...details }),
  }).catch(() => undefined);
}

void trackMarketingEvent('page_view');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = data.get('email');
  const interest = String(data.get('interest') || 'unknown');
  const region = String(data.get('region') || 'unknown');
  const source = ['landing', campaignSource, campaignName, campaignContent, interest]
    .map((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'na')
    .join(':');
  const button = form.querySelector('button');
  button.disabled = true;
  button.textContent = '신청 중…';

  try {
    if (config.supabaseUrl && config.supabaseAnonKey) {
      const response = await fetch(`${config.supabaseUrl}/functions/v1/join-waitlist`, {
        method: 'POST',
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source, region, interest, consentVersion: '2026-09-19-v1' }),
      });
      if (!response.ok) throw new Error('request failed');
    } else {
      localStorage.setItem('topnote-waitlist', JSON.stringify({ email, interest, source, region }));
    }
    void trackMarketingEvent('waitlist_submitted', { interest, region });
    status.textContent = '신청됐어요. 첫 번째 초대 소식을 보내드릴게요.';
    form.reset();
  } catch {
    status.textContent = '잠시 연결이 불안정해요. 조금 뒤 다시 시도해주세요.';
  } finally {
    button.disabled = false;
    button.textContent = '베타 신청';
  }
});
