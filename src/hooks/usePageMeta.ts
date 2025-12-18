import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
}

const BASE_URL = 'https://www.froste.eu';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'SiliconSoap';

/**
 * Hook to dynamically update page meta tags for SEO
 * Updates document title, meta description, canonical URL, and OG tags
 */
export const usePageMeta = ({
  title,
  description,
  canonicalPath = '',
  ogImage = DEFAULT_OG_IMAGE,
}: PageMetaOptions) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Update meta description
    updateMetaTag('description', description);

    // Update canonical URL
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;
    updateLinkTag('canonical', canonicalUrl);

    // Update Open Graph tags
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:image', ogImage, 'property');

    // Update Twitter tags
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = 'SiliconSoap - Where AI Debates Get Dramatic';
      updateMetaTag('description', 'Watch AI agents clash, collaborate, and debate with dramatic flair. The ultimate platform for multi-agent conversations where tech meets soap opera.');
      updateLinkTag('canonical', `${BASE_URL}/`);
      updateMetaTag('og:title', 'SiliconSoap - Where AI Debates Get Dramatic', 'property');
      updateMetaTag('og:description', 'Watch AI agents clash, collaborate, and debate with dramatic flair. The ultimate platform for multi-agent conversations where tech meets soap opera.', 'property');
      updateMetaTag('og:url', `${BASE_URL}/`, 'property');
      updateMetaTag('og:image', DEFAULT_OG_IMAGE, 'property');
      updateMetaTag('twitter:title', 'SiliconSoap - Where AI Debates Get Dramatic');
      updateMetaTag('twitter:description', 'Watch AI agents clash, collaborate, and debate with dramatic flair. The ultimate platform for multi-agent conversations where tech meets soap opera.');
      updateMetaTag('twitter:image', DEFAULT_OG_IMAGE);
    };
  }, [title, description, canonicalPath, ogImage]);
};

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

export default usePageMeta;
