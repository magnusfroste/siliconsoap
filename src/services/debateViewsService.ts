import { incrementDisplayedDebateView, recordDebateView } from '@/repositories/debateViewsRepository';

export async function recordDisplayedDebateView(shareId: string): Promise<void> {
  try {
    await incrementDisplayedDebateView(shareId);
  } catch {
    // Preserve the independent, fire-and-forget displayed-view increment.
  }
}

export function shouldRecordDebateView(environment: { hostname: string; userAgent: string; webdriver: boolean }): boolean {
  return environment.hostname === 'siliconsoap.com'
    && !environment.webdriver
    && !/bot|crawler|spider|preview|headless|lighthouse/i.test(environment.userAgent);
}

export async function recordSharedDebateView(shareId: string): Promise<void> {
  try {
    if (!shouldRecordDebateView({ hostname: window.location.hostname, userAgent: navigator.userAgent, webdriver: navigator.webdriver })) return;
    let visitorKey = window.localStorage.getItem('ss_visitor_id');
    if (!visitorKey || !/^[A-Za-z0-9_-]{8,64}$/.test(visitorKey)) {
      visitorKey = crypto.randomUUID();
      window.localStorage.setItem('ss_visitor_id', visitorKey);
    }
    await recordDebateView(shareId, visitorKey);
  } catch {
    // Storage, network and RPC failures must never affect the shared page.
  }
}