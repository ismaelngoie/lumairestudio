import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const socialAccounts = [
  { client: 'Sarah & James', platform: 'Instagram', hashtag: '#SarahSaysYes', status: 'Content Planned' },
  { client: 'Elena & Michael', platform: 'Pinterest', hashtag: '#ElenaMichaelWedding', status: 'Moodboard Live' },
];

const emailTemplates = [
  { 
    id: 1, 
    title: 'Client Welcome', 
    subject: 'Welcome to Lumaire Studio – Let’s begin!',
    body: 'Hi [Name],\n\nI am so honored to be part of your special day. I have set up your private portal...'
  },
  { 
    id: 2, 
    title: '30-Day Countdown', 
    subject: '30 Days to Go! Important Reminders',
    body: 'Can you believe we are only a month away? Here are the three things we need to finalize this week...'
  },
  { 
    id: 3, 
    title: 'Post-Wedding Thank You', 
    subject: 'Thank You',
    body: 'It was magical seeing everything come together...'
  }
];

export default function MarketingAutomation() {
  return (
    <main className="min-h-screen bg-lumaire-ivory p-8">
      <header className="mb-12">
        <Link href="/dashboard" className="text-sm text-lumaire-brown/60 hover:text-lumaire-brown mb-2 block">← Back to Dashboard</Link>
        <h1 className="text-4xl font-serif text-lumaire-brown">Studio & Marketing</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Section 1: Social Presence Tracking [cite: 87] */}
        <section>
          <h2 className="font-serif text-2xl text-lumaire-brown mb-6">Social Tracking</h2>
          <div className="space-y-4">
            {socialAccounts.map((acc, i) => (
              <Card key={i}>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{acc.client}</h4>
                    <p className="text-sm text-lumaire-brown/60">{acc.platform}: <span className="text-lumaire-wine">{acc.hashtag}</span></p>
                  </div>
                  <span className="text-xs bg-lumaire-tan/20 px-2 py-1 rounded-sm">{acc.status}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: Automation (Email Templates)  */}
        <section>
          <h2 className="font-serif text-2xl text-lumaire-brown mb-6">Email Automation</h2>
          <p className="text-sm text-lumaire-brown/60 mb-6">One-click templates to save you time.</p>
          
          <div className="space-y-4">
            {emailTemplates.map((template) => (
              <Card key={template.id}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-serif text-lg">{template.title}</h4>
                </div>
                <p className="text-xs text-lumaire-brown/60 mb-4 line-clamp-1">{template.subject}</p>
                
                {/* The "Automation" Button */}
                <a 
                  href={`mailto:?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`}
                  className="block w-full text-center py-2 border border-lumaire-brown/20 hover:bg-lumaire-brown hover:text-white transition-colors text-sm rounded-sm"
                >
                  Launch Email
                </a>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
