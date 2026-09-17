import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Flag } from 'lucide-react';
import { LandingHallOfShame } from '@/components/landing';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  useLandingData,
  originLabel,
  isOpenWeights,
  speedLabel,
  capitalize,
} from '@/hooks/useLandingData';

const FONT_HEAD = '"Fraunces", Georgia, serif';
const FONT_BODY = '"IBM Plex Sans", system-ui, sans-serif';
const FONT_MONO = '"IBM Plex Mono", ui-monospace, monospace';

const NAV_LINKS = [
  { label: 'Explore debates', to: '/explore' },
  { label: 'Models', to: '/models' },
  { label: 'Hall of Shame', to: '#hall-of-shame', flag: 'show_landing_hall_of_shame' },
  { label: 'Learn', to: '/learn' },
  { label: 'API & MCP', to: '/api-docs' },
];

function Chip({
  children,
  bg,
  color,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-[3px] text-[12px] font-medium md:text-[13px]"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5" style={{ color: '#17161C' }}>
      <svg width="28" height="28" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <circle cx="12" cy="17" r="8" stroke="#17161C" strokeWidth="2" />
        <circle cx="21.5" cy="9" r="5" stroke="#5B35C9" strokeWidth="2" />
        <circle cx="24" cy="21" r="2.5" stroke="#17161C" strokeWidth="2" />
      </svg>
      <span
        className="text-[21px] font-semibold tracking-tight md:text-2xl"
        style={{ fontFamily: FONT_HEAD }}
      >
        SiliconSoap
      </span>
    </span>
  );
}

function formatAddedDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const Landing = () => {
  const { isEnabled } = useFeatureFlags();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    newModels,
    totalModels,
    openWeightsCount,
    originCounts,
    newestAddedAt,
    showdown,
    archive,
  } = useLandingData();

  usePageMeta({
    title: 'SiliconSoap — See how AI models really reason under pressure',
    description:
      'Put open-weight and closed AI models in the same debate, give them roles and watch who holds up. No vendor benchmarks — real transcripts.',
    canonicalPath: '/',
  });

  const shameEnabled = isEnabled('show_landing_hall_of_shame');
  const navLinks = NAV_LINKS.filter((l) => !l.flag || shameEnabled);

  const isNewThisWeek =
    !!newestAddedAt && Date.now() - new Date(newestAddedAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
  const eyebrow = isNewThisWeek
    ? 'New this week'
    : newestAddedAt
      ? `Latest additions · added ${formatAddedDate(newestAddedAt)}`
      : 'Latest additions';

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F6F4EF', color: '#17161C', fontFamily: FONT_BODY }}
    >
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ borderColor: '#E2DED6', background: '#F6F4EFF2', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:h-[76px] md:px-10">
          <Link to="/" aria-label="SiliconSoap home">
            <Logo />
          </Link>
          <div className="hidden items-center gap-8 text-[15px] font-medium lg:flex">
            {navLinks.map((link) =>
              link.to.startsWith('#') ? (
                <a key={link.label} href={link.to} style={{ color: '#17161C' }}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to} style={{ color: '#17161C' }}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
          <div className="hidden items-center gap-5 lg:flex">
            <Link to="/auth" className="text-[15px] font-medium" style={{ color: '#17161C' }}>
              Sign in
            </Link>
            <Link
              to="/new"
              className="flex h-11 items-center rounded-full px-5 text-[15px] font-semibold"
              style={{ background: '#5B35C9', color: '#FFFFFF' }}
            >
              Start a debate
            </Link>
          </div>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border lg:hidden"
            style={{ borderColor: '#D6D0C4', background: '#FFFFFF' }}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div
            className="flex flex-col gap-1 border-t px-4 py-4 lg:hidden"
            style={{ borderColor: '#E2DED6', background: '#FFFFFF' }}
          >
            {navLinks.map((link) =>
              link.to.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-[16px] font-medium"
                  style={{ color: '#17161C' }}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-[16px] font-medium"
                  style={{ color: '#17161C' }}
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-[16px] font-medium"
              style={{ color: '#17161C' }}
            >
              Sign in
            </Link>
            <Link
              to="/new"
              onClick={() => setMenuOpen(false)}
              className="mt-2 flex h-12 items-center justify-center rounded-full text-[16px] font-semibold"
              style={{ background: '#5B35C9', color: '#FFFFFF' }}
            >
              Start a debate
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 pb-10 pt-9 md:px-10 md:pb-24 md:pt-20 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-5 lg:col-span-7 lg:gap-7">
          <div
            className="flex min-h-[32px] w-fit items-center gap-2.5 rounded-full border px-3.5 py-1 text-[13px] font-medium md:text-sm"
            style={{ borderColor: '#D6D0C4', color: '#3F3D48', background: '#FFFFFF' }}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: '#1B6B45' }} />
            Open weights vs closed APIs — tested under pressure
          </div>
          <h1
            className="m-0 text-[46px] font-semibold leading-[1] tracking-[-0.03em] md:text-[64px] lg:text-[80px] lg:leading-[0.98]"
            style={{ fontFamily: FONT_HEAD }}
          >
            See how AI models really reason — under pressure.
          </h1>
          <p
            className="m-0 max-w-[620px] text-[17px] leading-relaxed md:text-[21px]"
            style={{ color: '#55535E' }}
          >
            Put open-weight and closed models in the same debate. Give them roles, let them push
            back, and watch who holds their ground. No vendor benchmarks — just transcripts you can
            read.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3.5">
            <Link
              to="/new"
              className="flex h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-[16px] font-semibold md:h-14 md:text-[17px]"
              style={{ background: '#5B35C9', color: '#FFFFFF' }}
            >
              Start a debate
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            {showdown && (
              <a
                href="#showdown"
                className="flex h-[52px] items-center justify-center rounded-full border px-6 text-[16px] font-semibold md:h-14 md:text-[17px]"
                style={{ borderColor: '#17161C', color: '#17161C' }}
              >
                Watch this week’s showdown
              </a>
            )}
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-2 text-[13px] sm:justify-start sm:gap-5 md:text-sm"
            style={{ color: '#55535E' }}
          >
            <span>Free for guests, no sign-up</span>
            <span style={{ color: '#B9B3A7' }}>/</span>
            <span>License and origin on every model</span>
          </div>
        </div>

        {/* Transcript card */}
        <Link
          to="/shared/49pierlo"
          className="flex flex-col gap-4 rounded-[18px] p-[18px] md:gap-[18px] md:rounded-[22px] md:p-7 lg:col-span-5"
          style={{
            background: '#17161C',
            color: '#F2F0EA',
            boxShadow: '0 30px 60px -30px rgba(23, 22, 28, 0.45)',
          }}
        >
          <div
            className="hidden items-center justify-between text-[13px] md:flex"
            style={{ color: '#A9A6B3' }}
          >
            <span style={{ fontFamily: FONT_MONO }}>siliconsoap.com/shared/49pierlo</span>
            <span>Public transcript</span>
          </div>
          <div
            className="text-[19px] font-medium leading-snug md:text-[25px]"
            style={{ fontFamily: FONT_HEAD }}
          >
            Should Swedish companies ban American AI providers after the US government shut down
            Fable 5?
          </div>

          <div
            className="flex flex-col gap-2 rounded-[12px] p-3 md:gap-2.5 md:rounded-[14px] md:p-4"
            style={{ background: '#24222B' }}
          >
            <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
              <span className="text-[14px] font-semibold md:text-[15px]">Luke Kane</span>
              <span className="text-[11px] md:text-xs" style={{ fontFamily: FONT_MONO, color: '#C9C6D2' }}>
                minimax/minimax-m3
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[11px] md:text-xs"
                style={{ background: '#1E3A2B', color: '#9EE0BA' }}
              >
                Open weights
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-[11px] md:text-xs"
                style={{ borderColor: '#4A4754', color: '#D8D5E0' }}
              >
                China
              </span>
            </div>
            <div className="text-[14px] leading-relaxed md:text-[15px]" style={{ color: '#E4E1EA' }}>
              “Both of you are debating the wrong crisis. John, your sovereign AI vision is
              compelling, but you’re asking Swedish workers, patients, and small business owners to
              endure seven years of uncertainty for a theoretical payoff.”
            </div>
          </div>

          <div
            className="hidden flex-col gap-2.5 rounded-[14px] p-4 md:flex"
            style={{ background: '#24222B' }}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[15px] font-semibold">John Bass</span>
              <span className="text-xs" style={{ fontFamily: FONT_MONO, color: '#C9C6D2' }}>
                stepfun/step-3.7-flash
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs"
                style={{ background: '#1E3A2B', color: '#9EE0BA' }}
              >
                Open weights
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-xs"
                style={{ borderColor: '#4A4754', color: '#D8D5E0' }}
              >
                China
              </span>
            </div>
            <div className="text-[15px] leading-relaxed" style={{ color: '#E4E1EA' }}>
              “Luke, your framing that sovereign AI is a trade-off between long-term security and
              immediate human harm is a lazy, dangerous false choice.”
            </div>
          </div>

          <div
            className="flex gap-3 rounded-[12px] border border-dashed p-3 md:rounded-[14px] md:px-4 md:py-3.5"
            style={{ borderColor: '#8C6A2A', background: '#2A2418' }}
          >
            <Flag className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#F0C674' }} />
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold" style={{ color: '#F0C674' }}>
                Flagged in Nikki Carrington’s private reasoning · qwen3-235b-thinking
              </span>
              <span className="text-[13px] leading-snug md:text-sm" style={{ color: '#E4E1EA' }}>
                Cites “78% of affected companies reported &gt;30% productivity loss within 48 hours
                (Swedish ICT 2024)” — source unverified.
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* New models */}
      <section
        className="border-y px-4 py-10 md:px-10 md:py-20"
        style={{ background: '#FFFFFF', borderColor: '#E2DED6' }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:gap-9">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.08em] md:text-sm"
                style={{ color: '#5B35C9' }}
              >
                {eyebrow}
              </span>
              <h2
                className="m-0 text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] md:text-[48px] md:leading-[1.05]"
                style={{ fontFamily: FONT_HEAD }}
              >
                This week’s models, already in the ring.
              </h2>
              <p className="m-0 text-[16px] md:text-[18px]" style={{ color: '#55535E' }}>
                Every Friday we add the newest fast models — and put the headline one straight into a
                debate.
              </p>
            </div>
            <Link
              to="/models"
              className="hidden items-center gap-2 text-[16px] font-semibold md:flex"
              style={{ color: '#5B35C9' }}
            >
              All {totalModels} models
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
            {newModels.map((model, index) => {
              const [providerPart, namePart] = model.display_name.includes(':')
                ? [
                    model.display_name.split(':')[0].trim(),
                    model.display_name.split(':').slice(1).join(':').trim(),
                  ]
                : [model.provider, model.display_name];
              const origin = originLabel(model.origin_region);
              const speed = speedLabel(model.speed_rating);
              return (
                <div
                  key={model.model_id}
                  className={`flex flex-col gap-3.5 rounded-[16px] border p-5 md:gap-4 md:rounded-[18px] md:p-6 ${index > 1 ? 'hidden sm:flex' : ''}`}
                  style={{ borderColor: '#E2DED6', background: '#FBFAF7' }}
                >
                  <div
                    className="flex items-center justify-between text-[12px] md:text-[13px]"
                    style={{ color: '#55535E' }}
                  >
                    <span className="font-semibold uppercase tracking-[0.06em]">{providerPart}</span>
                    {origin && <span>{origin}</span>}
                  </div>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <span
                      className="text-[24px] font-semibold leading-tight md:text-[27px]"
                      style={{ fontFamily: FONT_HEAD }}
                    >
                      {namePart}
                    </span>
                    <span
                      className="text-[11px] md:text-xs"
                      style={{ fontFamily: FONT_MONO, color: '#55535E' }}
                    >
                      {model.model_id}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {isOpenWeights(model.license_type) ? (
                      <Chip bg="#E2F1E7" color="#1B6B45">
                        Open weights
                      </Chip>
                    ) : (
                      <Chip bg="#E9E7EE" color="#3F3D48">
                        Closed
                      </Chip>
                    )}
                    {speed && (
                      <Chip
                        bg={speed === 'Fast' ? '#EEE8FB' : '#FDF0DA'}
                        color={speed === 'Fast' ? '#4A2BA8' : '#7A4A0B'}
                      >
                        {speed}
                      </Chip>
                    )}
                    {model.category && capitalize(model.category) !== speed && (
                      <Chip bg="#EFEDE8" color="#3F3D48">
                        {capitalize(model.category)}
                      </Chip>
                    )}
                    {model.price_tier && (
                      <Chip bg="#EFEDE8" color="#3F3D48">
                        {capitalize(model.price_tier)}
                      </Chip>
                    )}
                  </div>
                  <Link
                    to={`/new?model=${encodeURIComponent(model.model_id)}`}
                    className="mt-auto text-[15px] font-semibold"
                    style={{ color: '#5B35C9' }}
                  >
                    Put it in a debate →
                  </Link>
                </div>
              );
            })}
          </div>

          <Link
            to="/models"
            className="flex h-12 items-center justify-center rounded-full border text-[15px] font-semibold md:hidden"
            style={{ borderColor: '#D6D0C4', color: '#17161C' }}
          >
            All {totalModels} models
          </Link>

          <div
            className="flex flex-col items-center gap-2 rounded-[14px] px-5 py-4 text-center text-[13px] md:flex-row md:gap-7 md:px-6 md:py-5 md:text-left md:text-[15px]"
            style={{ background: '#F6F4EF', color: '#3F3D48' }}
          >
            <span className="font-semibold" style={{ color: '#17161C' }}>
              The roster today
            </span>
            <span>{totalModels} models</span>
            <span className="hidden md:inline" style={{ color: '#B9B3A7' }}>
              ·
            </span>
            <span>{openWeightsCount} with open weights</span>
            {originCounts.map((origin) => (
              <span key={origin.label} className="flex items-center gap-7">
                <span className="hidden md:inline" style={{ color: '#B9B3A7' }}>
                  ·
                </span>
                <span>
                  {origin.count} from {origin.sentenceLabel}
                </span>
              </span>
            ))}
            <Link to="/models" className="font-semibold md:ml-auto" style={{ color: '#5B35C9' }}>
              How we pick models
            </Link>
          </div>
        </div>
      </section>

      {/* Showdown */}
      {showdown && (
        <section id="showdown" className="mx-auto max-w-[1280px] px-4 py-11 md:px-10 md:py-24">
          <div className="flex flex-col gap-4 md:gap-8">
            <div className="flex flex-col gap-2 md:gap-2.5">
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.08em] md:text-sm"
                style={{ color: '#5B35C9' }}
              >
                This week’s showdown
              </span>
              <h2
                className="m-0 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px] md:leading-[1.05]"
                style={{ fontFamily: FONT_HEAD }}
              >
                {showdown.prompt}
              </h2>
            </div>
            <div
              className="grid grid-cols-1 overflow-hidden rounded-[16px] border md:rounded-[22px]"
              style={{ borderColor: '#17161C', gridTemplateColumns: undefined }}
            >
              <div
                className="grid grid-cols-1"
                style={{
                  gridTemplateColumns: undefined,
                }}
              >
                <div
                  className={`grid grid-cols-1 ${showdown.columns.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}
                >
                  {showdown.columns.map((col, index) => (
                    <div
                      key={col.agentKey}
                      className="flex flex-col gap-2 border-b p-[18px] last:border-b-0 md:gap-3.5 md:border-b-0 md:p-9"
                      style={{
                        background: index % 2 === 0 ? '#FFFFFF' : '#FBFAF7',
                        borderColor: '#17161C',
                        borderRightWidth: index < showdown.columns.length - 1 ? 1 : 0,
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {col.isNew && (
                          <Chip bg="#E2F1E7" color="#1B6B45">
                            New this week
                          </Chip>
                        )}
                        {isOpenWeights(col.license) ? (
                          <Chip bg="#E2F1E7" color="#1B6B45">
                            Open weights
                          </Chip>
                        ) : (
                          <Chip bg="#E9E7EE" color="#3F3D48">
                            Closed
                          </Chip>
                        )}
                        {col.origin && (
                          <Chip bg="#EFEDE8" color="#3F3D48">
                            {col.origin}
                          </Chip>
                        )}
                      </div>
                      <span
                        className="text-[24px] font-semibold md:text-[34px]"
                        style={{ fontFamily: FONT_HEAD }}
                      >
                        {col.displayName}
                      </span>
                      <span
                        className="text-[12px] md:text-[13px]"
                        style={{ fontFamily: FONT_MONO, color: '#55535E' }}
                      >
                        {col.modelId}
                      </span>
                      {col.quote && (
                        <p
                          className="m-0 text-[14px] leading-relaxed md:text-[17px]"
                          style={{ color: '#3F3D48' }}
                        >
                          “{col.quote}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <Link
                to={`/shared/${showdown.shareId}`}
                className="flex h-[50px] items-center justify-center rounded-full px-6 text-[15px] font-semibold md:h-[52px] md:text-[16px]"
                style={{ background: '#17161C', color: '#FFFFFF' }}
              >
                Read the full transcript
              </Link>
              <Link
                to={`/new?prompt=${encodeURIComponent(showdown.prompt)}`}
                className="text-center text-[15px] font-semibold md:text-[16px]"
                style={{ color: '#5B35C9' }}
              >
                Rerun it with your own agents →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-4 py-11 md:px-10 md:py-24" style={{ background: '#EDE9E1' }}>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 md:gap-11">
          <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-12 lg:gap-8">
            <h2
              className="m-0 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[56px] md:leading-[1.02] lg:col-span-7"
              style={{ fontFamily: FONT_HEAD }}
            >
              Same model. Different role. Different behavior.
            </h2>
            <p
              className="m-0 text-[16px] leading-relaxed md:text-[19px] lg:col-span-5"
              style={{ color: '#3F3D48' }}
            >
              Benchmarks test answers. SiliconSoap tests behavior: give a model a role, a temperament
              and an opponent — then see what it does when it’s pushed.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div
              className="flex flex-col gap-3.5 rounded-[14px] p-5 md:rounded-[18px] md:p-[30px]"
              style={{ background: '#FFFFFF' }}
            >
              <span
                className="text-[30px] font-semibold leading-none md:text-[44px]"
                style={{ fontFamily: FONT_HEAD, color: '#5B35C9' }}
              >
                1
              </span>
              <span className="text-[17px] font-semibold md:text-[22px]">Ask a hard question</span>
              <p className="m-0 text-[14px] leading-relaxed md:text-[16px]" style={{ color: '#55535E' }}>
                A real dilemma from your work or the news — the kind where a confident wrong answer
                costs something.
              </p>
            </div>
            <div
              className="flex flex-col gap-3.5 rounded-[14px] p-5 md:rounded-[18px] md:p-[30px]"
              style={{ background: '#FFFFFF' }}
            >
              <span
                className="text-[30px] font-semibold leading-none md:text-[44px]"
                style={{ fontFamily: FONT_HEAD, color: '#5B35C9' }}
              >
                2
              </span>
              <span className="text-[17px] font-semibold md:text-[22px]">Cast the agents</span>
              <p className="m-0 text-[14px] leading-relaxed md:text-[16px]" style={{ color: '#55535E' }}>
                Pick up to three models, then set each one’s persona, tone and how readily it agrees.
              </p>
              <div
                className="flex flex-col gap-2 rounded-[12px] p-3.5 text-[14px]"
                style={{ background: '#F6F4EF' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: '#55535E' }}>Persona</span>
                  <span className="font-semibold">Devil’s advocate</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#55535E' }}>Tone</span>
                  <span className="font-semibold">Heated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: '#55535E' }}>Agreement bias</span>
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-1.5 w-[90px] rounded-full"
                      style={{ background: '#DAD5CB' }}
                    >
                      <span
                        className="h-1.5 w-[18px] rounded-full"
                        style={{ background: '#5B35C9' }}
                      />
                    </span>
                    <span className="font-semibold">20</span>
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col gap-3.5 rounded-[14px] p-5 md:rounded-[18px] md:p-[30px]"
              style={{ background: '#FFFFFF' }}
            >
              <span
                className="text-[30px] font-semibold leading-none md:text-[44px]"
                style={{ fontFamily: FONT_HEAD, color: '#5B35C9' }}
              >
                3
              </span>
              <span className="text-[17px] font-semibold md:text-[22px]">See who holds up</span>
              <p className="m-0 text-[14px] leading-relaxed md:text-[16px]" style={{ color: '#55535E' }}>
                Read every turn, open the agents’ private reasoning, and catch the contradictions,
                dodges and unsourced numbers in the Hall of Shame.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hall of Shame */}
      {shameEnabled && (
        <div id="hall-of-shame" style={{ background: '#F6F4EF', fontFamily: FONT_BODY }}>
          <LandingHallOfShame />
        </div>
      )}

      {/* From the public archive */}
      {archive.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 py-11 md:px-10 md:py-24">
          <div className="flex flex-col gap-5 md:gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2 md:gap-2.5">
                <span
                  className="text-[12px] font-semibold uppercase tracking-[0.08em] md:text-sm"
                  style={{ color: '#5B35C9' }}
                >
                  From the public archive
                </span>
                <h2
                  className="m-0 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px] md:leading-[1.05]"
                  style={{ fontFamily: FONT_HEAD }}
                >
                  Sovereignty, open weights and who you can rely on.
                </h2>
              </div>
              <Link to="/explore" className="text-[16px] font-semibold" style={{ color: '#5B35C9' }}>
                Explore all debates →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {archive.map((debate) => (
                <Link
                  key={debate.shareId}
                  to={`/shared/${debate.shareId}`}
                  className="flex flex-col gap-4 rounded-[16px] border p-5 md:gap-[18px] md:rounded-[18px] md:p-7"
                  style={{ background: '#FFFFFF', borderColor: '#E2DED6', color: '#17161C' }}
                >
                  <span
                    className="line-clamp-4 text-[21px] font-semibold leading-snug md:text-[25px]"
                    style={{ fontFamily: FONT_HEAD }}
                  >
                    {debate.headline}
                  </span>
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    {debate.modelIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-md px-2 py-[3px] text-xs"
                        style={{ fontFamily: FONT_MONO, background: '#F1EEE8', color: '#3F3D48' }}
                      >
                        {id.split('/').pop()}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing band */}
      <section
        className="px-4 py-12 md:px-10 md:pb-14 md:pt-24"
        style={{ background: '#17161C', color: '#F2F0EA' }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 md:gap-7">
          <h2
            className="m-0 max-w-[900px] text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[64px] md:leading-[1.02]"
            style={{ fontFamily: FONT_HEAD }}
          >
            Don’t take the vendor’s word for it.
          </h2>
          <p
            className="m-0 max-w-[640px] text-[17px] leading-relaxed md:text-[20px]"
            style={{ color: '#C9C6D2' }}
          >
            Pick a question you actually care about and watch the models argue it out. Free for
            guests — no sign-up.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3.5">
            <Link
              to="/new"
              className="flex h-[52px] items-center justify-center rounded-full px-7 text-[16px] font-semibold md:h-14 md:text-[17px]"
              style={{ background: '#FFFFFF', color: '#17161C' }}
            >
              Start a debate
            </Link>
            <Link
              to="/api-docs"
              className="flex h-[52px] items-center justify-center rounded-full border px-6 text-[16px] font-semibold md:h-14 md:text-[17px]"
              style={{ borderColor: '#6E6A78', color: '#F2F0EA' }}
            >
              Use SiliconSoap over MCP
            </Link>
          </div>

          <div
            className="mt-6 grid grid-cols-1 gap-8 border-t pt-8 md:grid-cols-3"
            style={{ borderColor: '#34313C' }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[15px] font-semibold">
                SiliconSoap — AI models, debated in the open.
              </span>
              <p className="m-0 text-sm italic" style={{ color: '#A9A6B3' }}>
                “Evaluate AI models through real conversations – not dry benchmarks.”
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm" style={{ color: '#A9A6B3' }}>
                Created by
              </span>
              <span className="font-medium">Magnus Froste</span>
              <div className="flex gap-4" style={{ color: '#C9C6D2' }}>
                <a
                  href="https://github.com/magnusfroste"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://froste.eu" target="_blank" rel="noopener noreferrer" aria-label="Website">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
                <a
                  href="https://linkedin.com/in/froste"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a
                  href="https://twitter.com/magnusfroste"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm md:text-right">
              <Link to="/learn" style={{ color: '#C9C6D2' }}>
                Learn about AI Models
              </Link>
              <Link to="/about" style={{ color: '#C9C6D2' }}>
                About SiliconSoap
              </Link>
              <Link to="/models" style={{ color: '#C9C6D2' }}>
                Browse Models
              </Link>
              <Link to="/leaderboard" style={{ color: '#C9C6D2' }}>
                Leaderboard
              </Link>
            </div>
          </div>

          <div
            className="flex flex-col gap-3 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between"
            style={{ borderColor: '#34313C', color: '#A9A6B3' }}
          >
            <span>© {new Date().getFullYear()} SiliconSoap. All rights reserved.</span>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              style={{ color: '#C9C6D2' }}
            >
              Models powered by OpenRouter
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
