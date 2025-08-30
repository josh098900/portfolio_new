import { INavItem, ISocialLink, IPersonalInfo } from './types';

/**
 * Navigation menu items for the portfolio
 */
export const navigationItems: INavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: 'home'
  },
  {
    label: 'About',
    href: '/about',
    icon: 'user'
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'code'
  },
  {
    label: 'Skills',
    href: '/skills',
    icon: 'tools'
  },
  {
    label: 'Contact',
    href: '/contact',
    icon: 'mail'
  }
];

/**
 * Social media and professional links
 */
export const socialLinks: ISocialLink[] = [
  {
    id: 'github',
    platform: 'GitHub',
    url: 'https://github.com/josh098900',
    icon: 'github',
    username: 'josh098900'
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/joshua-mathers-3410a7219?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
    icon: 'linkedin',
    username: 'joshua-mathers'
  },
  {
    id: 'twitter',
    platform: 'Twitter',
    url: 'https://x.com/joshdhhhshes?s=21&t=EQpMCp3l0BzMCVVLk3CVvg',
    icon: 'twitter',
    username: '@joshdhhhshes'
  },
  {
    id: 'email',
    platform: 'Email',
    url: 'mailto:joshmathers3@gmail.com',
    icon: 'email',
    username: 'joshmathers3@gmail.com'
  }
];

/**
 * Personal and professional information
 */
export const personalInfo: IPersonalInfo = {
  name: 'Joshua Mathers',
  title: 'Software Engineering Student & Aspiring Developer',
  bio: 'Passionate software engineering student with a love for creating innovative applications and exploring modern web technologies. Currently studying and building projects with a focus on full-stack development.',
  email: 'joshmathers3@gmail.com',
  location: 'Rugby, Warwickshire',
  avatarUrl: '/images/pixelavatar.png',
  resumeUrl: '/documents/resume.pdf'
};

/**
 * Get navigation items
 */
export const getNavigationItems = (): INavItem[] => {
  return navigationItems;
};

/**
 * Get social links
 */
export const getSocialLinks = (): ISocialLink[] => {
  return socialLinks;
};

/**
 * Get personal information
 */
export const getPersonalInfo = (): IPersonalInfo => {
  return personalInfo;
};

/**
 * Get social link by platform
 */
export const getSocialLinkByPlatform = (platform: string): ISocialLink | undefined => {
  return socialLinks.find(link => 
    link.platform.toLowerCase() === platform.toLowerCase()
  );
};

/**
 * Get contact social links (email, phone, etc.)
 */
export const getContactLinks = (): ISocialLink[] => {
  return socialLinks.filter(link => 
    ['email', 'phone', 'linkedin'].includes(link.id)
  );
};

/**
 * Get social media links (excluding contact)
 */
export const getSocialMediaLinks = (): ISocialLink[] => {
  return socialLinks.filter(link => 
    !['email', 'phone'].includes(link.id)
  );
};