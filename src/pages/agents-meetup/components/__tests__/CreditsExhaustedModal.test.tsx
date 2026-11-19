import { describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreditsExhaustedModal } from '../CreditsExhaustedModal';

vi.mock('@/integrations/supabase/client', () => {
  const query = {
    select: () => query,
    in: () => query,
    eq: () => Promise.resolve({ data: [] }),
  };
  return {
    supabase: {
      from: () => query,
      functions: { invoke: async () => ({ data: {} }) },
    },
  };
});

vi.mock('@/utils/analytics', () => ({
  trackCreditsExhausted: vi.fn(),
  trackCreditsPurchaseStart: vi.fn(),
}));

const renderModal = (props: Partial<ComponentProps<typeof CreditsExhaustedModal>> = {}) =>
  render(
    <MemoryRouter>
      <CreditsExhaustedModal open onOpenChange={() => {}} isGuest={false} {...props} />
    </MemoryRouter>,
  );

describe('CreditsExhaustedModal copy', () => {
  it('shows the out-of-credits wording by default', () => {
    renderModal();
    expect(screen.getByText('Out of Credits')).toBeTruthy();
    expect(screen.getByText(/You've used all your token budget/)).toBeTruthy();
    expect(screen.queryByText('Buy credits')).toBeNull();
  });

  it('shows neutral top-up wording when reason is "purchase"', () => {
    renderModal({ reason: 'purchase' });
    expect(screen.getByText('Buy credits')).toBeTruthy();
    expect(
      screen.getByText('Top up your balance to keep running debates and second-opinion panels.'),
    ).toBeTruthy();
    expect(screen.queryByText('Out of Credits')).toBeNull();
    expect(screen.queryByText(/You've used all your token budget/)).toBeNull();
  });

  it('keeps the guest signup wording regardless of reason', () => {
    renderModal({ isGuest: true, reason: 'purchase' });
    expect(screen.getByText(/free chats!/)).toBeTruthy();
    expect(screen.getByText('Sign Up for More Credits')).toBeTruthy();
    expect(screen.queryByText('Buy credits')).toBeNull();
  });
});
