/**
 * Icon Helper - Mapea nombres de iconos a componentes de Heroicons
 * 
 * Este helper permite usar iconos dinámicamente desde el JSON
 */

import {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  UserGroupIcon,
  RectangleGroupIcon,
  BriefcaseIcon,
  HandRaisedIcon,
  GlobeAmericasIcon,
  CalendarIcon,
  ClockIcon,
  LockClosedIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  WalletIcon,
  CloudIcon,
  ArrowPathIcon,
  BoltIcon,
  HeartIcon,
  VideoCameraIcon,
  DevicePhoneMobileIcon,
  FaceFrownIcon,
  AcademicCapIcon,
  ArrowsUpDownIcon,
  FireIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

// Tipo para los componentes de iconos
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Mapa de nombres de iconos a componentes
const iconMap: Record<string, IconComponent> = {
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  UserGroupIcon,
  RectangleGroupIcon,
  BriefcaseIcon,
  HandRaisedIcon,
  GlobeAmericasIcon,
  CalendarIcon,
  ClockIcon,
  LockClosedIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  WalletIcon,
  CloudIcon,
  ArrowPathIcon,
  BoltIcon,
  HeartIcon,
  VideoCameraIcon,
  DevicePhoneMobileIcon,
  FaceFrownIcon,
  AcademicCapIcon,
  ArrowsUpDownIcon,
  FireIcon,
  UserCircleIcon,
};

/**
 * Obtiene el componente de icono por nombre
 * @param iconName Nombre del icono (ej: "UserIcon")
 * @returns Componente del icono o null si no existe
 */
export function getIcon(iconName: string): IconComponent | null {
  return iconMap[iconName] || null;
}

/**
 * Renderiza un icono por nombre
 * @param iconName Nombre del icono
 * @param className Clases CSS adicionales
 * @param props Props adicionales para el SVG
 */
export function renderIcon(
  iconName: string,
  className: string = '',
  props?: SVGProps<SVGSVGElement>
): JSX.Element | null {
  const IconComponent = getIcon(iconName);
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`);
    return null;
  }
  return <IconComponent className={className} {...props} />;
}
