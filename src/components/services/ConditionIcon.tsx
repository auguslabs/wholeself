/**
 * ConditionIcon - Componente React para renderizar iconos de condiciones
 * 
 * Este componente puede ser usado en archivos Astro para mostrar iconos
 * de condiciones de manera dinámica.
 */

import { renderIcon } from './iconHelper';

interface ConditionIconProps {
  iconName: string;
  className?: string;
}

export default function ConditionIcon({ iconName, className = 'w-6 h-6' }: ConditionIconProps) {
  return <>{renderIcon(iconName, className)}</>;
}
