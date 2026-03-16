/**
 * Conditions Section Component
 * 
 * Sección que muestra todas las condiciones que apoyamos con tarjetas visuales
 */

import ConditionCard from './ConditionCard';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { LocalizedText } from '@/data/models/ContentPage';

interface Condition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string | LocalizedText;
  link: string;
}

interface ConditionsSectionProps {
  title: LocalizedText;
  subtitle: LocalizedText;
  conditions: Condition[];
  language: 'en' | 'es';
}

export default function ConditionsSection({ title, subtitle, conditions, language }: ConditionsSectionProps) {
  const safeConditions = Array.isArray(conditions)
    ? conditions.filter((c): c is Condition => c != null && typeof c === 'object' && (typeof (c as Condition).link === 'string' || typeof (c as Condition).id === 'string'))
    : [];

  return (
    <section className="py-12 px-4 bg-blueGreen-300">
      <div className="container mx-auto max-w-7xl">
        {/* Título */}
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {getLocalizedText(title, language)}
        </h2>
        
        {/* Subtítulo */}
        <p className="text-lg text-white/90 text-center mb-12 max-w-3xl mx-auto">
          {getLocalizedText(subtitle, language)}
        </p>
        
        {/* Grid de condiciones - solo ítems con link válido para evitar "Cannot read properties of null (reading 'link')" */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeConditions.map((condition) => (
            <ConditionCard
              key={condition.id}
              name={condition.name}
              description={condition.description}
              icon={typeof condition.icon === 'string' ? condition.icon : getLocalizedText(condition.icon as LocalizedText, language)}
              link={condition.link ?? `/services/${condition.id}`}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
