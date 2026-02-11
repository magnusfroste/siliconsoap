/**
 * Google Analytics event tracking utility
 * Centralizes all GA event tracking for SiliconSoap
 */

// Custom event categories
type EventCategory = 'debate' | 'engagement' | 'monetization' | 'navigation' | 'sharing';

interface TrackEventParams {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  customParams?: Record<string, string | number | boolean>;
}

/**
 * Track a custom event in Google Analytics
 */
export const trackEvent = ({ category, action, label, value, customParams }: TrackEventParams) => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...customParams,
  });
};

// ── Debate Events ──────────────────────────────────────────────

export const trackDebateStart = (params: {
  topic: string;
  numAgents: number;
  numRounds: number;
  models: string[];
  mode: string;
  tone?: string;
}) => {
  trackEvent({
    category: 'debate',
    action: 'debate_start',
    label: params.topic.slice(0, 100),
    value: params.numAgents,
    customParams: {
      num_agents: params.numAgents,
      num_rounds: params.numRounds,
      models_used: params.models.join(','),
      participation_mode: params.mode,
      conversation_tone: params.tone || 'default',
    },
  });
};

export const trackDebateComplete = (params: {
  chatId: string;
  totalMessages: number;
  durationSeconds: number;
}) => {
  trackEvent({
    category: 'debate',
    action: 'debate_complete',
    label: params.chatId,
    value: params.totalMessages,
    customParams: {
      duration_seconds: params.durationSeconds,
    },
  });
};

// ── Sharing Events ─────────────────────────────────────────────

export const trackShare = (params: {
  shareId: string;
  platform: 'twitter' | 'linkedin' | 'reddit' | 'copy_link' | 'quote';
}) => {
  trackEvent({
    category: 'sharing',
    action: 'share',
    label: params.platform,
    customParams: {
      share_id: params.shareId,
    },
  });
};

export const trackReaction = (params: {
  shareId: string;
  emoji: string;
}) => {
  trackEvent({
    category: 'engagement',
    action: 'reaction',
    label: params.emoji,
    customParams: {
      share_id: params.shareId,
    },
  });
};

// ── Monetization Events ────────────────────────────────────────

export const trackCreditsPurchaseStart = () => {
  trackEvent({
    category: 'monetization',
    action: 'credits_purchase_start',
  });
};

export const trackCreditsPurchaseComplete = (amount?: number) => {
  trackEvent({
    category: 'monetization',
    action: 'credits_purchase_complete',
    value: amount,
  });
};

export const trackCreditsExhausted = () => {
  trackEvent({
    category: 'monetization',
    action: 'credits_exhausted',
  });
};

// ── Navigation Events ──────────────────────────────────────────

export const trackExploreView = (tab: string) => {
  trackEvent({
    category: 'navigation',
    action: 'explore_tab_change',
    label: tab,
  });
};

export const trackSharedDebateView = (shareId: string) => {
  trackEvent({
    category: 'engagement',
    action: 'shared_debate_view',
    label: shareId,
  });
};

// ── Auth Events ────────────────────────────────────────────────

export const trackSignUp = () => {
  trackEvent({
    category: 'engagement',
    action: 'sign_up',
  });
};

export const trackLogin = () => {
  trackEvent({
    category: 'engagement',
    action: 'login',
  });
};

/**
 * Initialize or update the GA tracking ID dynamically.
 * Loads the gtag.js script if not already present, then configures the tracking ID.
 * Called when feature flags load with a custom GA ID from admin settings.
 */
export const initializeGA = (trackingId: string) => {
  if (!trackingId) return;

  // Load gtag.js script dynamically if not already present
  const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag timestamp after script element is added
    window.gtag('js', new Date());
  }

  // Configure the tracking ID
  window.gtag('config', trackingId, {
    send_page_view: false, // We handle page views via PageTracker
  });
};
