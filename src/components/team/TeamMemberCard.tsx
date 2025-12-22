import React from 'react';
import type { TeamMember, PhotoType } from '@/data/models/TeamMember';
import { getPhotoPath, getFullName } from '@/data/models/TeamMember';

interface TeamMemberCardProps {
  member: TeamMember;
  photoType: PhotoType;
  variant?: 'v1' | 'v2' | 'v3';
  className?: string;
  onClick?: () => void;
}

/**
 * Tarjeta de miembro del equipo con variantes para las 3 versiones
 */
export function TeamMemberCard({
  member,
  photoType,
  variant = 'v1',
  className = '',
  onClick,
}: TeamMemberCardProps) {
  const photoPath = getPhotoPath(member, photoType);
  const fullName = getFullName(member);

  // Estilos según variante
  const variantStyles = {
    v1: {
      card: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300',
      image: 'rounded-lg',
      name: 'text-lg font-semibold text-navy-900 uppercase',
      role: 'text-sm text-navy-600 mt-1',
    },
    v2: {
      card: 'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
      image: 'rounded-xl',
      name: 'text-xl font-bold text-navy-900',
      role: 'text-base text-tealBlue-700 mt-2',
    },
    v3: {
      card: 'bg-gradient-to-br from-white to-softAquaGray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
      image: 'rounded-2xl',
      name: 'text-xl font-bold text-navy-900',
      role: 'text-sm text-blueGreen-700 mt-2 font-medium',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.card} ${className} overflow-hidden ${onClick ? 'cursor-pointer' : ''} flex flex-row`}
      onClick={onClick}
    >
      {/* Foto a la izquierda */}
      <div className="relative w-24 md:w-32 flex-shrink-0 aspect-square overflow-hidden">
        <img
          src={photoPath}
          alt={fullName}
          className={`w-full h-full object-cover ${styles.image}`}
          loading="lazy"
        />
      </div>
      
      {/* Contenido a la derecha */}
      <div className="p-4 flex-1 flex flex-col justify-center">
        <h3 className={styles.name}>{fullName}</h3>
        {member.credentials && (
          <p className="text-xs text-navy-500 mt-1">{member.credentials}</p>
        )}
        <p className={styles.role}>{member.role}</p>
      </div>
    </div>
  );
}
