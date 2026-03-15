import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  QueueListIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BoltIcon,
  BriefcaseIcon,
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: <BookOpenIcon className="w-6 h-6" />,
    title: 'Digital Menu',
    desc: 'Browse available meals in real-time with photos, prices, and stock info.',
  },
  {
    icon: <CalculatorIcon className="w-6 h-6" />,
    title: 'Point of Sale',
    desc: 'Fast and intuitive POS for cashiers — select items, assign customers, and complete orders in seconds.',
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: 'Reports & Analytics',
    desc: 'Daily sales summaries, best-selling items, and category breakdowns at a glance.',
  },
  {
    icon: <ArchiveBoxIcon className="w-6 h-6" />,
    title: 'Inventory Tracking',
    desc: 'Monitor stock levels with low-stock alerts and automatic deduction per order.',
  },
  {
    icon: <QueueListIcon className="w-6 h-6" />,
    title: 'Live Order Queue',
    desc: 'Kanban-style queue shows pending, preparing, and ready orders in real time.',
  },
  {
    icon: <UserGroupIcon className="w-6 h-6" />,
    title: 'Role-Based Access',
    desc: 'Separate portals for admins, cashiers, and customers with the right tools for each.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen" style={{ background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpenIcon className="w-6 h-6 text-gray-900" />
            <span className="font-bold text-lg" style={{ color: '#800000' }}>Eljay's Kusina</span>
          </div>
          <Link
            to="/login"
            className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '92vh' }}>
        {/* Full-bleed background photo */}
        <img
          src="/canteen-photo.jpg"
          alt="Canteen"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(70,0,0,0.82) 0%, rgba(90,0,0,0.6) 55%, rgba(0,0,0,0.2) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center" style={{ minHeight: '92vh' }}>
          <div style={{ maxWidth: 560 }}>
            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)' }}
            >
              <AcademicCapIcon className="w-4 h-4" /> School Canteen Management System
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              Eljay's Kusina —<br />
              <span style={{ color: '#FFCDD2' }}>Your School Canteen</span>
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-8">
              A complete digital system for managing orders, menus, inventory, and reports — built for school canteens.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}
              >
                Get Started →
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold text-white border border-white/40 hover:bg-white/10 transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 mt-12">
              {[
                { label: 'Roles Supported', value: '3' },
                { label: 'Real-Time Sync', value: <BoltIcon className="w-8 h-8" /> },
                { label: 'Reports & Charts', value: <ChartBarIcon className="w-8 h-8" /> },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-3xl font-extrabold text-white flex items-center h-9">{value}</p>
                  <p className="text-white/60 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ background: '#FEF2F2', color: '#800000' }}>
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-3">Everything you need</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From taking orders to analyzing daily revenue — all in one clean dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              style={{
                background: '#fff',
                border: '1px solid #f1f1f1',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: '#FEF2F2' }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roles Section ── */}
      <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #800000 0%, #5a0000 100%)' }}>
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-3">Built for Every Role</h2>
          <p className="text-white/70 text-lg">One system, three powerful portals.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: 'Admin', icon: <BriefcaseIcon className="w-12 h-12 mx-auto" />, color: '#ff8a80', desc: 'Manage menus, view reports, track inventory.' },
            { role: 'Cashier', icon: <CreditCardIcon className="w-12 h-12 mx-auto" />, color: '#80cbc4', desc: 'Process orders via POS and manage the queue.' },
            { role: 'Customer', icon: <UserIcon className="w-12 h-12 mx-auto" />, color: '#ffe082', desc: 'Browse menu and track order status.' },
          ].map(({ role, icon, color, desc }) => (
            <div
              key={role}
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <div className="mb-4" style={{ color }}>{icon}</div>
              <h3 className="text-xl font-bold mb-2" style={{ color }}>{role}</h3>
              <p className="text-white/70 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Ready to get started?</h2>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">Sign in to access your canteen management portal.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}
        >
          Sign In Now →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100">
        © {new Date().getFullYear()} Canteen Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
