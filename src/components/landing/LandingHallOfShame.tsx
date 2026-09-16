import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface ShameMoment {
  id: string;
  agent_name: string;
  quote: string;
  shame_type: 'backstab' | 'diva' | 'trust_issue';
  severity: number;
  share_id: string | null;
  created_at: string;
}

const FONT_HEAD = "'Fraunces', Georgia, serif";
const FONT_BODY = "'IBM Plex Sans', system-ui, sans-serif";

const shameTypeLabels: Record<ShameMoment['shame_type'], string> = {
  backstab: 'Backstab',
  diva: 'Diva moment',
  trust_issue: 'Trust issue',
};

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
const MAX_SEVERITY = 5;

export function LandingHallOfShame() {
  const [moments, setMoments] = useState<ShameMoment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShameMoments = useCallback(async () => {
    const { data, error } = await supabase
      .from('hall_of_shame')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching shame moments:', error);
    } else {
      setMoments((data as ShameMoment[]) || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchShameMoments();
    const interval = setInterval(fetchShameMoments, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchShameMoments]);

  if (loading) {
    return (
      <section className="mx-auto max-w-[1280px] px-4 py-11 md:px-10 md:py-24">
        <div className="mb-8 flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[16px]" />
          ))}
        </div>
      </section>
    );
  }

  if (moments.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 py-11 md:px-10 md:py-24"
      style={{ fontFamily: FONT_BODY, color: '#17161C' }}
    >
      <div className="flex flex-col gap-5 md:gap-8">
        <div className="flex flex-col gap-2 md:gap-2.5">
          <span
            className="text-[12px] font-semibold uppercase tracking-[0.08em] md:text-sm"
            style={{ color: '#5B35C9' }}
          >
            Hall of Shame
          </span>
          <h2
            className="m-0 text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[48px] md:leading-[1.05]"
            style={{ fontFamily: FONT_HEAD }}
          >
            Where the arguments fall apart.
          </h2>
          <p className="m-0 max-w-[720px] text-[16px] leading-relaxed md:text-[19px]" style={{ color: '#55535E' }}>
            Contradictions, dodges and diva moments — flagged automatically in real debates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {moments.map((moment) => {
            const label = shameTypeLabels[moment.shame_type] ?? shameTypeLabels.backstab;
            const severity = Math.max(1, Math.min(MAX_SEVERITY, moment.severity || 1));

            const card = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="rounded-md px-2 py-[3px] text-xs font-semibold"
                    style={{ background: '#E9E7EE', color: '#3F3D48' }}
                  >
                    {label}
                  </span>
                  <span
                    className="flex items-center gap-[3px]"
                    aria-label={`Severity ${severity} of ${MAX_SEVERITY}`}
                  >
                    {Array.from({ length: MAX_SEVERITY }).map((_, i) => (
                      <span
                        key={i}
                        className="h-3 w-[3px] rounded-full"
                        style={{ background: i < severity ? '#5B35C9' : '#DAD5CB' }}
                      />
                    ))}
                  </span>
                </div>

                <p
                  className="m-0 line-clamp-4 text-[15px] leading-relaxed md:text-[17px]"
                  style={{ color: '#3F3D48' }}
                >
                  {moment.quote}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-semibold">Flagged: {moment.agent_name}</span>
                  <span style={{ color: '#55535E' }}>
                    {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
                  </span>
                </div>
              </>
            );

            const cardClass =
              'flex flex-col gap-3.5 rounded-[16px] border p-5 md:rounded-[18px] md:p-7';
            const cardStyle = { background: '#FFFFFF', borderColor: '#E2DED6', color: '#17161C' };

            return moment.share_id ? (
              <Link
                key={moment.id}
                to={`/shared/${moment.share_id}`}
                className={`${cardClass} transition-colors hover:border-[#5B35C9]`}
                style={cardStyle}
              >
                {card}
              </Link>
            ) : (
              <div key={moment.id} className={cardClass} style={cardStyle}>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
