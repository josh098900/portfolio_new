'use client';

import Image from 'next/image';
import { getPersonalInfo, getSocialLinks } from '@/data';
import { PageHeader, Button } from '@/components/ui';
import { SocialIcon } from '@/components/ui/Icon';
import Link from 'next/link';

export default function AboutPage() {
  const personalInfo = getPersonalInfo();
  const socialLinks = getSocialLinks();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="ABOUT ME"
          subtitle="Get to know the developer behind the pixels"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Image and Quick Info */}
          <div className="space-y-8">
            {/* Profile Image */}
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 bg-pixel-primary/20 border-4 border-pixel-primary animate-pulse" />
                <Image
                  src={personalInfo.avatarUrl || '/images/pixelavatar.png'}
                  alt={personalInfo.name}
                  fill
                  className="object-cover image-rendering-pixelated"
                  priority
                />
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-pixel-dark border-2 border-pixel-primary p-6">
              <h3 className="font-pixel text-pixel-primary text-lg mb-4">QUICK INFO</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-pixel text-pixel-light text-sm">NAME:</span>
                  <span className="font-pixel text-pixel-secondary text-sm">{personalInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-pixel-light text-sm">ROLE:</span>
                  <span className="font-pixel text-pixel-secondary text-sm">DEVELOPER</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-pixel-light text-sm">LOCATION:</span>
                  <span className="font-pixel text-pixel-secondary text-sm">{personalInfo.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-pixel-light text-sm">EMAIL:</span>
                  <span className="font-pixel text-pixel-secondary text-sm">{personalInfo.email}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center">
              <h3 className="font-pixel text-pixel-primary text-sm mb-4">CONNECT WITH ME</h3>
              <div className="flex justify-center space-x-4">
                {socialLinks.slice(0, 4).map((social) => (
                  <Link
                    key={social.id}
                    href={social.url}
                    className="p-3 border-2 border-pixel-primary hover:bg-pixel-primary hover:text-pixel-dark transition-colors duration-200"
                    target={social.url.startsWith('http') ? '_blank' : '_self'}
                    rel={social.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <SocialIcon 
                      platform={social.icon as 'github' | 'linkedin' | 'twitter' | 'instagram' | 'email'}
                      size={20}
                      aria-label={`Visit ${social.platform}`}
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - About Content */}
          <div className="space-y-8">
            {/* Bio */}
            <div>
              <h3 className="font-pixel text-pixel-primary text-lg mb-4">MY STORY</h3>
              <div className="space-y-4">
                <p className="font-pixel text-pixel-light text-sm leading-relaxed">
                  {personalInfo.bio}
                </p>
                <p className="font-pixel text-pixel-light text-sm leading-relaxed">
                  My journey into development started with a fascination for retro gaming and pixel art. 
                  This passion naturally evolved into web development, where I found the perfect blend 
                  of creativity and technical problem-solving.
                </p>
                <p className="font-pixel text-pixel-light text-sm leading-relaxed">
                  I specialize in creating modern web applications with a nostalgic twist, combining 
                  cutting-edge technologies with pixel-perfect design aesthetics. Every project is 
                  an opportunity to push boundaries while maintaining that classic, timeless appeal.
                </p>
              </div>
            </div>

            {/* What I Do */}
            <div>
              <h3 className="font-pixel text-pixel-primary text-lg mb-4">WHAT I DO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-pixel-dark border-2 border-pixel-primary p-4">
                  <h4 className="font-pixel text-pixel-secondary text-sm mb-2">FRONTEND</h4>
                  <p className="font-pixel text-pixel-light text-xs leading-relaxed">
                    React, Next.js, TypeScript, and modern CSS frameworks to create responsive, 
                    interactive user interfaces.
                  </p>
                </div>
                <div className="bg-pixel-dark border-2 border-pixel-primary p-4">
                  <h4 className="font-pixel text-pixel-secondary text-sm mb-2">BACKEND</h4>
                  <p className="font-pixel text-pixel-light text-xs leading-relaxed">
                    Node.js, Python, and database design to build robust, scalable server-side 
                    applications and APIs.
                  </p>
                </div>
                <div className="bg-pixel-dark border-2 border-pixel-primary p-4">
                  <h4 className="font-pixel text-pixel-secondary text-sm mb-2">DESIGN</h4>
                  <p className="font-pixel text-pixel-light text-xs leading-relaxed">
                    UI/UX design with a focus on pixel art aesthetics, creating unique visual 
                    experiences that stand out.
                  </p>
                </div>
                <div className="bg-pixel-dark border-2 border-pixel-primary p-4">
                  <h4 className="font-pixel text-pixel-secondary text-sm mb-2">TOOLS</h4>
                  <p className="font-pixel text-pixel-light text-xs leading-relaxed">
                    Git, Docker, CI/CD pipelines, and modern development tools to ensure 
                    efficient workflows and deployments.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <div className="space-y-4">
                <p className="font-pixel text-pixel-light text-sm">
                  INTERESTED IN WORKING TOGETHER?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button variant="primary" size="large">
                      GET IN TOUCH
                    </Button>
                  </Link>
                  {personalInfo.resumeUrl && (
                    <Link href={personalInfo.resumeUrl} target="_blank">
                      <Button variant="outline" size="large">
                        DOWNLOAD CV
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}