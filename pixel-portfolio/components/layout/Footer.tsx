import React from 'react';
import Link from 'next/link';
import { ISocialLink } from '@/data/types';
import { SocialIcon } from '@/components/ui/Icon';
import { getSocialLinks } from '@/data/navigation';

/**
 * Props for the Footer component
 */
interface IFooterProps {
  /** Social media links to display */
  socialLinks?: ISocialLink[];
  /** Copyright text */
  copyrightText?: string;
  /** Whether to show the current year */
  showCurrentYear?: boolean;
  /** Additional footer links */
  footerLinks?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pixel art styled footer component
 * Features social links, copyright, and additional navigation
 */
export const Footer: React.FC<IFooterProps> = ({
  socialLinks = [],
  copyrightText = "PIXEL PORTFOLIO",
  showCurrentYear = true,
  footerLinks = [],
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  // Base footer classes
  const footerClasses = [
    'bg-pixel-dark',
    'border-t-2',
    'border-pixel-primary',
    'mt-auto',
    'py-8',
    'px-4',
    className
  ].join(' ');

  // Social link classes
  const socialLinkClasses = [
    'font-pixel',
    'text-pixel-light',
    'text-sm',
    'hover:text-pixel-primary',
    'transition-colors',
    'duration-200',
    'p-2',
    'border-2',
    'border-transparent',
    'hover:border-pixel-primary',
    'focus:outline-none',
    'focus:border-pixel-accent',
    'focus:text-pixel-accent'
  ].join(' ');

  // Footer link classes
  const footerLinkClasses = [
    'font-pixel',
    'text-pixel-light',
    'text-xs',
    'hover:text-pixel-secondary',
    'transition-colors',
    'duration-200',
    'underline',
    'underline-offset-2'
  ].join(' ');

  // Copyright text classes
  const copyrightClasses = [
    'font-pixel',
    'text-pixel-light/60',
    'text-xs',
    'text-center'
  ].join(' ');

  return (
    <footer className={footerClasses}>
      <div className="max-w-7xl mx-auto">
        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-4">
              {socialLinks.map((social, index) => (
                <Link
                  key={`social-${index}-${social.platform}`}
                  href={social.url}
                  className={socialLinkClasses}
                  target={social.url.startsWith('http') ? '_blank' : '_self'}
                  rel={social.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  title={`Visit ${social.platform}${social.username ? ` (@${social.username})` : ''}`}
                >
                  <span className="sr-only">{social.platform}</span>
                  <SocialIcon 
                    platform={social.icon as 'github' | 'linkedin' | 'twitter' | 'instagram' | 'email'}
                    size={20}
                    aria-label={`Visit ${social.platform}`}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer Links Section */}
        {footerLinks.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-6 flex-wrap">
              {footerLinks.map((link, index) => (
                <Link
                  key={`footer-link-${index}-${link.label}`}
                  href={link.href}
                  className={footerLinkClasses}
                  target={link.external ? '_blank' : '_self'}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Decorative Divider */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-pixel-primary animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center">
          <p className={copyrightClasses}>
            © {showCurrentYear ? currentYear : ''} {copyrightText}
            <br />
            <span className="text-pixel-primary/40">
              BUILT WITH NEXT.JS & TAILWIND CSS
            </span>
          </p>
        </div>

        {/* Pixel Art Decoration */}
        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 ${
                  i % 2 === 0 ? 'bg-pixel-primary/30' : 'bg-pixel-secondary/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Export default for convenience
export default Footer;

// Export specialized footer variants
export const MainFooter: React.FC<Omit<IFooterProps, 'socialLinks' | 'footerLinks'>> = (props) => {
  // Get actual social links from navigation data
  const defaultSocialLinks: ISocialLink[] = getSocialLinks();

  return (
    <Footer
      socialLinks={defaultSocialLinks}
      {...props}
    />
  );
};

export const MinimalFooter: React.FC<Omit<IFooterProps, 'socialLinks' | 'footerLinks'>> = (props) => {
  // Minimal social links
  const minimalSocialLinks: ISocialLink[] = [
    {
      id: 'github',
      platform: 'GitHub',
      url: 'https://github.com',
      icon: 'github'
    },
    {
      id: 'email',
      platform: 'Email',
      url: 'mailto:contact@example.com',
      icon: 'email'
    }
  ];

  return (
    <Footer
      socialLinks={minimalSocialLinks}
      {...props}
    />
  );
};

export const SimpleFooter: React.FC<Omit<IFooterProps, 'socialLinks' | 'footerLinks'>> = (props) => {
  return (
    <Footer
      socialLinks={[]}
      footerLinks={[]}
      {...props}
    />
  );
};