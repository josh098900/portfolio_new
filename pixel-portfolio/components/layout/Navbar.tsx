'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { INavItem } from '@/data/types';
import { NavigationIcon } from '@/components/ui/Icon';

/**
 * Props for the Navbar component
 */
interface INavbarProps {
  /** Navigation items to display */
  navItems?: INavItem[];
  /** Whether to show the logo */
  showLogo?: boolean;
  /** Custom logo text */
  logoText?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pixel art styled navigation bar component
 * Features responsive design with mobile hamburger menu
 */
export const Navbar: React.FC<INavbarProps> = ({
  navItems = [],
  showLogo = true,
  logoText = "JOSH'S PORTFOLIO",
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking a nav item
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Base navbar classes
  const navbarClasses = [
    'fixed',
    'top-0',
    'left-0',
    'right-0',
    'z-50',
    'bg-pixel-dark',
    'border-b-2',
    'border-pixel-primary',
    'shadow-lg',
    'shadow-pixel-primary/20',
    className
  ].join(' ');

  // Logo classes
  const logoClasses = [
    'font-pixel',
    'text-pixel-primary',
    'text-lg',
    'md:text-xl',
    'hover:text-pixel-secondary',
    'transition-colors',
    'duration-200',
    'select-none'
  ].join(' ');

  // Nav link classes
  const navLinkClasses = [
    'font-pixel',
    'text-pixel-light',
    'text-sm',
    'hover:text-pixel-primary',
    'transition-colors',
    'duration-200',
    'px-3',
    'py-2',
    'border-2',
    'border-transparent',
    'hover:border-pixel-primary',
    'focus:outline-none',
    'focus:border-pixel-accent',
    'focus:text-pixel-accent'
  ].join(' ');

  // Mobile menu button classes
  const mobileButtonClasses = [
    'md:hidden',
    'font-pixel',
    'text-pixel-primary',
    'text-lg',
    'p-2',
    'border-2',
    'border-pixel-primary',
    'hover:bg-pixel-primary',
    'hover:text-pixel-dark',
    'transition-colors',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-pixel-accent'
  ].join(' ');

  // Mobile menu classes
  const mobileMenuClasses = [
    'md:hidden',
    'absolute',
    'top-full',
    'left-0',
    'right-0',
    'bg-pixel-dark',
    'border-b-2',
    'border-pixel-primary',
    'shadow-lg',
    'shadow-pixel-primary/20',
    isMobileMenuOpen ? 'block' : 'hidden'
  ].join(' ');

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {showLogo && (
            <Link href="/" className={logoClasses}>
              {logoText}
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item, index) => (
              <Link
                key={`nav-${index}-${item.label}`}
                href={item.href}
                className={navLinkClasses}
                title={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className={mobileButtonClasses}
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <NavigationIcon 
              type={isMobileMenuOpen ? 'close' : 'menu'} 
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={mobileMenuClasses}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={`mobile-nav-${index}-${item.label}`}
                href={item.href}
                className={`${navLinkClasses} block w-full text-left`}
                onClick={closeMobileMenu}
                title={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Export default for convenience
export default Navbar;

// Export specialized navbar variants
export const MainNavbar: React.FC<Omit<INavbarProps, 'navItems'>> = (props) => {
  // Default navigation items
  const defaultNavItems: INavItem[] = [
    {
      label: 'HOME',
      href: '/'
    },
    {
      label: 'PROJECTS',
      href: '/projects'
    },
    {
      label: 'SKILLS',
      href: '/skills'
    },
    {
      label: 'ABOUT',
      href: '/about'
    },
    {
      label: 'CONTACT',
      href: '/contact'
    }
  ];

  return <Navbar navItems={defaultNavItems} {...props} />;
};

export const MinimalNavbar: React.FC<Omit<INavbarProps, 'navItems'>> = (props) => {
  // Minimal navigation items
  const minimalNavItems: INavItem[] = [
    {
      label: 'HOME',
      href: '/'
    },
    {
      label: 'PROJECTS',
      href: '/projects'
    },
    {
      label: 'CONTACT',
      href: '/contact'
    }
  ];

  return <Navbar navItems={minimalNavItems} {...props} />;
};