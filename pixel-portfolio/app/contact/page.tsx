import { getPersonalInfo, getContactLinks } from '@/data';
import { PageHeader } from '@/components/ui';
import { SocialIcon } from '@/components/ui/Icon';
import Link from 'next/link';

export default function ContactPage() {
  const personalInfo = getPersonalInfo();
  const contactLinks = getContactLinks();

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="GET IN TOUCH"
          subtitle="Let's discuss your next project or just say hello"
        />

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-pixel-dark border-2 border-pixel-primary p-8">
              <h3 className="font-pixel text-pixel-primary text-lg mb-6">CONTACT INFO</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 border-2 border-pixel-secondary flex items-center justify-center">
                    <span className="font-pixel text-pixel-secondary text-xs">@</span>
                  </div>
                  <div>
                    <h4 className="font-pixel text-pixel-secondary text-sm mb-1">EMAIL</h4>
                    <Link 
                      href={`mailto:${personalInfo.email}`}
                      className="font-pixel text-pixel-light text-sm hover:text-pixel-primary transition-colors"
                    >
                      {personalInfo.email}
                    </Link>
                  </div>
                </div>

                {personalInfo.phone && (
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 border-2 border-pixel-secondary flex items-center justify-center">
                      <span className="font-pixel text-pixel-secondary text-xs">☎</span>
                    </div>
                    <div>
                      <h4 className="font-pixel text-pixel-secondary text-sm mb-1">PHONE</h4>
                      <Link 
                        href={`tel:${personalInfo.phone}`}
                        className="font-pixel text-pixel-light text-sm hover:text-pixel-primary transition-colors"
                      >
                        {personalInfo.phone}
                      </Link>
                    </div>
                  </div>
                )}

                {personalInfo.location && (
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 border-2 border-pixel-secondary flex items-center justify-center">
                      <span className="font-pixel text-pixel-secondary text-xs">📍</span>
                    </div>
                    <div>
                      <h4 className="font-pixel text-pixel-secondary text-sm mb-1">LOCATION</h4>
                      <p className="font-pixel text-pixel-light text-sm">{personalInfo.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-pixel-dark border-2 border-pixel-primary p-8">
              <h3 className="font-pixel text-pixel-primary text-lg mb-6">SOCIAL MEDIA</h3>
              <div className="grid grid-cols-2 gap-4">
                {contactLinks.map((social) => (
                  <Link
                    key={social.id}
                    href={social.url}
                    className="flex items-center space-x-3 p-3 border-2 border-pixel-primary/30 hover:border-pixel-primary hover:bg-pixel-primary/10 transition-all duration-200"
                    target={social.url.startsWith('http') ? '_blank' : '_self'}
                    rel={social.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <SocialIcon 
                      platform={social.icon as 'github' | 'linkedin' | 'twitter' | 'instagram' | 'email'}
                      size={16}
                      aria-label={`Visit ${social.platform}`}
                    />
                    <span className="font-pixel text-pixel-light text-xs">{social.platform}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-pixel-dark border-2 border-pixel-accent p-6">
              <h3 className="font-pixel text-pixel-accent text-sm mb-2">RESPONSE TIME</h3>
              <p className="font-pixel text-pixel-light text-xs leading-relaxed">
                I typically respond to messages within 24 hours. For urgent inquiries, 
                feel free to reach out via phone or LinkedIn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}