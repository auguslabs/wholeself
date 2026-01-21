/**
 * Quick Jump Link Component
 * 
 * Enlace sutil entre hero e intro que permite saltar directamente a los CTAs
 */

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

interface QuickJumpLinkProps {
  text: LocalizedText;
  language: 'en' | 'es';
  targetId?: string;
}

export default function QuickJumpLink({ text, language, targetId = 'services-cta' }: QuickJumpLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="py-4 px-4 text-center">
      <a
        href={`#${targetId}`}
        onClick={handleClick}
        className="inline-flex items-center gap-2 text-tealBlue-600 hover:text-tealBlue-700 text-sm font-medium transition-colors duration-200 group"
      >
        <span>{getLocalizedText(text, language)}</span>
        <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
}
