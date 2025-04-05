
export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  images?: string[];
  demoLink: string;
  order?: number;
  problemStatement?: string;
  whyBuilt?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AboutSection {
  id: string;
  name: string;
  introText: string;
  additionalText: string;
  skill1Title: string;
  skill1Description: string;
  skill1Icon: string;
  skill2Title: string;
  skill2Description: string;
  skill2Icon: string;
  skill3Title: string;
  skill3Description: string;
  skill3Icon: string;
}

export interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface HeroSection {
  id: string;
  name: string;
  tagline: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature1Icon: string;
  feature2Icon: string;
  feature3Icon: string;
}

export interface StatisticsEntry {
  id?: string;
  type: 'page_visit' | 'demo_click';
  page?: string;
  project?: string;
  timestamp: string;
  userAgent?: string;
  referrer?: string;
}
