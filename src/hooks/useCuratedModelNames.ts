import { useEffect, useState } from 'react';
import { getEnabledModels } from '@/repositories/curatedModelsRepository';

let cache: Promise<Record<string, string>> | null = null;
const load = () => {
  cache ??= getEnabledModels()
    .then((models) => Object.fromEntries(models.map((m) => [m.model_id, m.display_name])))
    .catch(() => { cache = null; return {}; });
  return cache;
};

/** Curated model id → display name, fetched once per page load. */
export const useCuratedModelNames = () => {
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => { let alive = true; load().then((n) => alive && setNames(n)); return () => { alive = false; }; }, []);
  return names;
};
