export const SHARE_HOST = 'https://share.siliconsoap.com';

/** Outgoing link people copy/post; the share host serves previews and redirects humans to /shared/<id>. */
export const publicShareUrl = (shareId: string): string => `${SHARE_HOST}/${shareId}`;

/** Extracts the share id from a /shared/<id> URL or a share-host URL. */
export const shareIdFromUrl = (url: string): string => {
  const shared = url.split('/shared/')[1];
  if (shared) return shared.split(/[?#/]/)[0];
  if (url.startsWith(`${SHARE_HOST}/`)) return url.slice(SHARE_HOST.length + 1).split(/[?#/]/)[0];
  return '';
};
