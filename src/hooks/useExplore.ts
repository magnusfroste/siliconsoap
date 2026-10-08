import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllCuratedModels } from '@/repositories/curatedModelsRepository';
import { fetchExplorePage, fetchShowdowns } from '@/repositories/exploreRepository';
import { completeUniqueDebates, matchingModelIds, PAGE_SIZE, type ExploreDebate, type ExploreFilters } from '@/services/exploreService';
import type { CuratedModel } from '@/models/model';
export function useExplore() {
  const [params, setParams] = useSearchParams();
  const key = params.toString();
  const filters = useMemo<ExploreFilters>(() => ({ tab: params.get('tab') === 'showdowns' ? 'showdowns' : 'newest', origin: params.get('origin') || '', license: params.get('license') || '', model: params.get('model') || '', q: params.get('q') || '' }), [key]);
  const [search, setSearch] = useState(filters.q);
  const [models, setModels] = useState<CuratedModel[]>([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [rows, setRows] = useState<ExploreDebate[]>([]);
  const [showdowns, setShowdowns] = useState<ExploreDebate[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const updateFilter = (field: keyof ExploreFilters, value: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (!value || (field === 'tab' && value === 'newest')) next.delete(field); else next.set(field, value);
    return next;
  });
  useEffect(() => { setSearch(filters.q); }, [filters.q]);
  useEffect(() => {
    if (search === filters.q) return;
    const timer = window.setTimeout(() => updateFilter('q', search), 300);
    return () => clearTimeout(timer);
  }, [search, filters.q]);
  useEffect(() => {
    let active = true;
    setModelsReady(false);
    getAllCuratedModels().then(data => { if (active) { setModels(data); setModelsReady(true); } }).catch(() => { if (active) { setError(true); setLoading(false); } });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => {
    const controller = new AbortController();
    fetchShowdowns(controller.signal).then(data => setShowdowns(completeUniqueDebates(data).sort((a,b) => (b.featured_at || '').localeCompare(a.featured_at || '')).slice(0,4))).catch(() => {});
    return () => controller.abort();
  }, [retry]);
  // One request per archive page; stale responses cannot overwrite newer URL filters.
  useEffect(() => {
    if (!modelsReady) return;
    const controller = new AbortController();
    setLoading(true); setError(false);
    const constrained = filters.origin || filters.license || filters.model;
    fetchExplorePage(filters, 0, constrained ? matchingModelIds(models, filters) : null, controller.signal).then(page => {
      if (controller.signal.aborted) return;
      setRows(page.debates); setHasMore(page.hasMore); setOffset(PAGE_SIZE); setLoading(false);
    }).catch(() => { if (!controller.signal.aborted) { setError(true); setLoading(false); } });
    return () => controller.abort();
  }, [key, modelsReady, models, retry]);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => { setLoadingMore(false); }, [key]);
  async function loadMore() {
    const requestedKey = key;
    setLoadingMore(true);
    try {
      const constrained = filters.origin || filters.license || filters.model;
      const page = await fetchExplorePage(filters, offset, constrained ? matchingModelIds(models, filters) : null, new AbortController().signal);
      if (window.location.search.slice(1) !== requestedKey) return;
      setRows(previous => [...previous, ...page.debates]); setOffset(offset + PAGE_SIZE); setHasMore(page.hasMore);
    } catch { setError(true); } finally { setLoadingMore(false); }
  }
  const debates = useMemo(() => {
    const unique = completeUniqueDebates(rows);
    return filters.tab === 'showdowns' ? unique.sort((a,b) => (b.featured_at || '').localeCompare(a.featured_at || '')) : unique;
  }, [rows, filters.tab]);
  return { filters, search, setSearch, updateFilter, clearFilters: () => { setSearch(''); setParams({}); }, models, debates, showdowns, loading, error, hasMore, loadingMore, loadMore, retry: () => setRetry(n => n+1) };
}
