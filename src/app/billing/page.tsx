import React from 'react';
import { Card } from '@/components/ui/Card';
import { Check } from 'lucide-react';

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-lumaire-ivory p-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-serif text-lumaire-brown mb-4">Invest in Your Business</h1>
        <p className="text-lumaire-brown/60 mb-12">Simple, transparent pricing for professional planners.</p>

        <div className="bg-white border border-lumaire-tan rounded-sm p-8 shadow-lg max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-lumaire-wine"></div>
          
          <h3 className="font-serif text-2xl mb-2">Professional</h3>
          <div className="flex justify-center items-baseline mb-6">
            <span className="text-4xl font-bold">$29</span>
            <span className="text-lumaire-brown/60">/month</span>
          </div>

          <ul className="text-left space-y-4 mb-8 text-sm">
            {[
              'Unlimited Clients & Weddings',
              'Visual Timeline Builder',
              'Vendor Rolodex',
              'Email Automation',
              'Document Storage (Coming Soon)'
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="bg-lumaire-brown/10 p-1 rounded-full">
                  <Check size={12} className="text-lumaire-brown" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          {/* This button links to Stripe */}
          <a 
            href="https://stripe.com" 
            target="_blank"
            className="block w-full py-4 bg-lumaire-brown text-lumaire-ivory font-medium tracking-wide hover:bg-lumaire-wine transition-colors rounded-sm"
          >
            SUBSCRIBE NOW
          </a>
          
          <p className="text-xs text-lumaire-brown/40 mt-4">Secure payment via Stripe. Cancel anytime.</p>
        </div>
      </div>
    </main>
  );
}
