'use client';

import { useState } from 'react';
import { getPersonalInfo, getContactLinks } from '@/data';
import { PageHeader, Button } from '@/components/ui';
import { SocialIcon } from '@/components/ui/Icon';
import Link from 'next/link';

export default function ContactPage() {
  const personalInfo = getPersonalInfo();
  const contactLinks = getContactLinks();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission (replace with actual implementation)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          title="GET IN TOUCH"
          subtitle="Let's discuss your next project or just say hello"
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
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

          {/* Right Column - Contact Form */}
          <div>
            <div className="bg-pixel-dark border-2 border-pixel-primary p-8">
              <h3 className="font-pixel text-pixel-primary text-lg mb-6">SEND MESSAGE</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-pixel text-pixel-light text-xs mb-2">
                      NAME *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-transparent border-2 border-pixel-primary p-3 font-pixel text-pixel-light text-sm focus:border-pixel-accent focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-pixel text-pixel-light text-xs mb-2">
                      EMAIL *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-transparent border-2 border-pixel-primary p-3 font-pixel text-pixel-light text-sm focus:border-pixel-accent focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-pixel text-pixel-light text-xs mb-2">
                    SUBJECT *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-2 border-pixel-primary p-3 font-pixel text-pixel-light text-sm focus:border-pixel-accent focus:outline-none"
                    placeholder="Project inquiry, collaboration, etc."
                  />
                </div>

                <div>
                  <label className="block font-pixel text-pixel-light text-xs mb-2">
                    MESSAGE *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full bg-transparent border-2 border-pixel-primary p-3 font-pixel text-pixel-light text-sm focus:border-pixel-accent focus:outline-none resize-none"
                    placeholder="Tell me about your project or just say hello..."
                  />
                </div>

                {/* Submit Status */}
                {submitStatus === 'success' && (
                  <div className="bg-pixel-accent/20 border-2 border-pixel-accent p-4">
                    <p className="font-pixel text-pixel-accent text-xs">
                      ✓ MESSAGE SENT SUCCESSFULLY!
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-500/20 border-2 border-red-500 p-4">
                    <p className="font-pixel text-red-400 text-xs">
                      ✗ ERROR SENDING MESSAGE. PLEASE TRY AGAIN.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}