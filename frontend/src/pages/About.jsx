import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 fade-in pb-16 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="py-12 border-b border-brand-canvas-soft space-y-6">
        <h1 className="display-xxl text-brand-ink uppercase tracking-tight">
          Moving people, assets, and businesses forward.
        </h1>
        <p className="body-lg text-brand-body max-w-3xl font-normal leading-relaxed">
          RentMyVehicle is a decentralized marketplace for specialized vehicles. 
          We connect vehicle operators with logistics providers, contractors, and individuals, 
          making asset rental friction-free, instantaneous, and secure.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
          >
            Find a vehicle
          </button>
          <button
            onClick={() => navigate('/register?role=OWNER')}
            className="px-6 py-3 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft transition duration-150"
          >
            List your fleet
          </button>
        </div>
      </div>

      {/* Grid: How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border border-brand-surface-pressed rounded-xl space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill">
            <Truck className="w-5 h-5 text-brand-ink" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-brand-ink">Unrivaled fleet selection</h3>
          <p className="body-sm text-brand-body leading-relaxed">
            From daily passenger cars and cargo vans to heavy duty construction machinery like JCBs, 
            we house every vehicle type under one unified digital storefront.
          </p>
        </div>

        <div className="p-6 border border-brand-surface-pressed rounded-xl space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill">
            <ShieldCheck className="w-5 h-5 text-brand-ink" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-brand-ink">Guaranteed safety & trust</h3>
          <p className="body-sm text-brand-body leading-relaxed">
            Every vehicle operator is verified. All transactions are securely held and integrated 
            with our automated insurance partners to ensure safety on every mile.
          </p>
        </div>

        <div className="p-6 border border-brand-surface-pressed rounded-xl space-y-4">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill">
            <Clock className="w-5 h-5 text-brand-ink" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-brand-ink">Flexible rental terms</h3>
          <p className="body-sm text-brand-body leading-relaxed">
            Renting by the hour, day, or month. Choose custom periods that adapt exactly to your 
            operational or project needs, backed by integrated test payments.
          </p>
        </div>
      </div>

      {/* Editorial Content Block */}
      <div className="flex flex-col md:flex-row items-center gap-12 bg-brand-canvas-soft p-8 md:p-12 rounded-xl">
        <div className="flex-1 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-body">Our Mission</span>
          <h2 className="display-lg text-brand-ink tracking-tight uppercase">
            Designed for convenience, built for growth.
          </h2>
          <p className="body-md text-brand-body font-normal leading-relaxed">
            We started with a simple question: why should specialized vehicle rentals be slow and paper-bound? 
            By eliminating booking delays and automating registration, we enable vehicle owners to unlock new revenue streams 
            and customers to deploy assets in minutes instead of days.
          </p>
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="bg-brand-canvas p-6 border border-brand-surface-pressed rounded-xl text-center space-y-1">
            <span className="block text-3xl font-extrabold text-brand-ink">10,000+</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Vehicles Listed</span>
          </div>
          <div className="bg-brand-canvas p-6 border border-brand-surface-pressed rounded-xl text-center space-y-1">
            <span className="block text-3xl font-extrabold text-brand-ink">50,000+</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Completed Bookings</span>
          </div>
          <div className="bg-brand-canvas p-6 border border-brand-surface-pressed rounded-xl text-center space-y-1">
            <span className="block text-3xl font-extrabold text-brand-ink">24/7</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Active Support</span>
          </div>
          <div className="bg-brand-canvas p-6 border border-brand-surface-pressed rounded-xl text-center space-y-1">
            <span className="block text-3xl font-extrabold text-brand-ink">99.9%</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Uptime Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
