/**
 * Category Accordion Component
 * 
 * Wrapper component for displaying service categories in an accordion format
 */

import type { ReactNode } from 'react';
import { Accordion } from '@/components/ui/Accordion';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
}

interface CategoryAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export default function CategoryAccordion({ items, allowMultiple = false, className = '' }: CategoryAccordionProps) {
  return <Accordion items={items} allowMultiple={allowMultiple} className={className} />;
}
