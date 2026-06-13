import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function Help() {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const categories = [
    { id: 'general', label: 'General Info' },
    { id: 'customer', label: 'For Renting Customers' },
    { id: 'owner', label: 'For Vehicle Owners' }
  ];

  const faqs = {
    general: [
      {
        q: "What is RentMyVehicle?",
        a: "RentMyVehicle is a digital rental marketplace connecting users in need of vehicles (cars, trucks, construction machinery) directly with operators and fleet owners."
      },
      {
        q: "How are payments handled on the platform?",
        a: "We integrate with the Razorpay test API. Payments are securely checked out online and held in escrow until booking verification is completed, ensuring both parties are protected."
      },
      {
        q: "How does the verification process work?",
        a: "When owners list a vehicle, it goes into a PENDING status. Platform administrators review the listing to verify registration details and insurance before making it active for search."
      }
    ],
    customer: [
      {
        q: "What documents are required to rent a vehicle?",
        a: "You must provide a valid government driving license matching the category of vehicle you are renting. Heavy construction equipment may require specialized operating permits."
      },
      {
        q: "Can I cancel a confirmed booking?",
        a: "Yes. Cancelations made more than 24 hours prior to the booking start time are fully refunded. Select the cancel booking option in your customer bookings log."
      },
      {
        q: "What happens if a vehicle breaks down during rental?",
        a: "Each vehicle is covered by on-road operator assistance. You can contact support immediately via our Support Portal, or call the owner using the contact details provided in your booking confirmation."
      }
    ],
    owner: [
      {
        q: "How do I list my vehicles on the platform?",
        a: "Register an account, select the Owner role, subscribe to a listing plan (Starter, Pro, or Enterprise), and click 'Add Listing' on your Owner Dashboard to fill out the vehicle details."
      },
      {
        q: "Do I need a subscription to list vehicles?",
        a: "Yes, to list vehicles, owners must select an active plan. We offer a Starter plan (up to 3 listings) at a minimal cost, as well as Professional and Enterprise packages for commercial operations."
      },
      {
        q: "How do payouts work for renting out my fleet?",
        a: "Once a customer completes their booking period, the funds are deposited directly to your registered bank account, minus a standard 5% marketplace transaction fee."
      }
    ]
  };

  const toggleAccordion = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-10 fade-in pb-16 max-w-4xl mx-auto">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">Help & FAQs</h1>
        <p className="text-brand-body text-sm font-normal">Find answers to commonly asked questions about RentMyVehicle</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center md:justify-start border-b border-brand-canvas-soft gap-6">
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setExpandedIndex(null);
            }}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider transition duration-150 border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-primary text-brand-ink'
                : 'border-transparent text-brand-body hover:text-brand-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion Questions */}
      <div className="space-y-4">
        {faqs[activeTab].map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              className="border border-brand-surface-pressed rounded-xl overflow-hidden bg-brand-canvas transition duration-150"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-brand-canvas-soft/40 transition duration-150"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4.5 h-4.5 text-brand-body flex-shrink-0" />
                  <span className="text-sm font-bold text-brand-ink tracking-tight">{faq.q}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-brand-ink flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-ink flex-shrink-0" />
                )}
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-60 border-t border-brand-canvas-soft p-5' : 'max-h-0 pointer-events-none'
                }`}
              >
                <p className="text-xs text-brand-body leading-relaxed font-normal">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact Call to Action */}
      <div className="bg-brand-canvas-soft p-8 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-brand-ink">Still need support?</h3>
          <p className="text-xs text-brand-body font-normal">Submit a query to our 24/7 dedicated support staff.</p>
        </div>
        <a
          href="/contact"
          className="px-6 py-3.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150 text-center whitespace-nowrap"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
