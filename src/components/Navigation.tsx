'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, Users, BarChart3, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Links with correct paths that respect basePath configuration
  const links = [
    { href: '/recruit', label: 'Recruit', icon: Upload },
  ];

  return (
    <nav className="border-b bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/setup" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">✨</span>
            BestHire
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-all hover:scale-105",
                    isActive 
                      ? "text-white bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm" 
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg text-base font-medium transition-all",
                    isActive 
                      ? "bg-white/20 text-white backdrop-blur-sm" 
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
