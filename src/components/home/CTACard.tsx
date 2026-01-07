/**
 * CTA Card Component - Individual Call-to-Action Card
 * 
 * Displays a single CTA card with icon, title, and description
 */

import React from 'react';
import { getIcon } from '@/components/services/iconHelper';

interface CTACardProps {
  id: string;
  title: string;
  description: string;
  link: string;
  iconName: string;
  colors: {
    bg: string;
    bgHover: string;
    bgHoverDark: string;
    text: string;
    textDesc: string;
  };
}

export default function CTACard({ id, title, description, link, iconName, colors }: CTACardProps) {
  const IconComponent = getIcon(iconName);
  const bgHoverClass = id === 'i-need-help' ? 'group-hover:bg-blueGreen-600' : 
                      id === 'loved-one' ? 'group-hover:bg-navy-600' : 
                      'group-hover:bg-lightbrown-600';

  return (
    <a 
      href={link} 
      className={`group flex flex-col items-center text-center p-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 ${colors.bg}`}
    >
      {/* Icon with white background circle */}
      <div className={`w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 ${bgHoverClass} transition-colors shadow-md`}>
        {IconComponent ? (
          <IconComponent className={`w-10 h-10 ${colors.text}`} />
        ) : (
          <span className="text-white font-semibold text-sm">icon</span>
        )}
      </div>
      {/* Heading */}
      <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>
        {title}
      </h2>
      {/* Description */}
      <p className={`${colors.textDesc} italic`}>
        "{description}"
      </p>
    </a>
  );
}
