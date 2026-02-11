import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface PageMetaOptions {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const BASE_URL = 'https://siliconsoap.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'SiliconSoap';
const BREADCRUMB_SCRIPT_ID = 'breadcrumb-schema';

/**
 * Hook to dynamically update page meta tags for SEO
 * Updates document title, meta description, canonical URL, OG tags, and breadcrumb schema
 */
export const usePageMeta = ({
  title,
  description,
  canonicalPath = '',
  ogImage = DEFAULT_OG_IMAGE,
  breadcrumbs,
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

    // Update breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      updateBreadcrumbSchema(breadcrumbs);
    }

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
      removeBreadcrumbSchema();
    };
  }, [title, description, canonicalPath, ogImage, breadcrumbs]);
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

function updateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  removeBreadcrumbSchema();
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `${BASE_URL}${item.path}`,
    })),
  };

  const script = document.createElement('script');
  script.id = BREADCRUMB_SCRIPT_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

function removeBreadcrumbSchema() {
  const existing = document.getElementById(BREADCRUMB_SCRIPT_ID);
  if (existing) {
    existing.remove();
  }
}

export default usePageMeta;
