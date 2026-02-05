'use client';

import React, { useState, useEffect } from 'react';
import type { TeamMember } from '@/data/models/TeamMember';
import { getPhotoPath } from '@/data/models/TeamMember';
import { pathWithBase } from '@/utils/basePath';
import { getTeamMembers } from '@/data/services/teamService';
import {
  // Iconos de comunidad y equipo
  UsersIcon,
  UserGroupIcon,
  UserIcon,
  // Iconos de cuidado y bienestar
  HeartIcon,
  SparklesIcon,
  // Iconos de crecimiento y educación
  AcademicCapIcon,
  BookOpenIcon,
  LightBulbIcon,
  // Iconos de comunicación y conexión
  ChatBubbleLeftRightIcon,
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  // Iconos de apoyo y ayuda
  HandRaisedIcon,
  // Iconos de diversidad e inclusión
  GlobeAmericasIcon,
  LanguageIcon,
  // Iconos de inspiración y positividad
  StarIcon,
  SunIcon,
  MoonIcon,
  // Iconos de seguridad y confianza
  ShieldCheckIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  // Iconos de crecimiento y progreso
  ArrowTrendingUpIcon,
  ChartBarIcon,
  // Iconos de conexión y enlace
  LinkIcon,
  PaperClipIcon,
  // Iconos de bienestar y balance
  BeakerIcon,
  PuzzlePieceIcon,
  FireIcon,
  // Iconos de tiempo y presencia
  ClockIcon,
  CalendarIcon,
  // Iconos de documentación y recursos
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  // Iconos de apoyo emocional
  FaceSmileIcon,
  // Iconos de transformación
  ArrowPathIcon,
  // Iconos de comunidad y red
  ShareIcon,
} from '@heroicons/react/24/outline';

interface TeamHeroCollageProps {
  className?: string;
  language?: 'en' | 'es';
}

// Array de iconos para usar decorativamente - Enfocados en consejería y terapia
const decorativeIcons = [
  // Cuidado y bienestar emocional
  { Icon: HeartIcon, size: 'w-8 h-8', rotation: -5 },
  { Icon: SparklesIcon, size: 'w-10 h-10', rotation: 8 },
  { Icon: FaceSmileIcon, size: 'w-9 h-9', rotation: 12 },
  { Icon: SunIcon, size: 'w-8 h-8', rotation: 11 },
  { Icon: MoonIcon, size: 'w-9 h-9', rotation: -6 },
  
  // Comunidad y equipo
  { Icon: UsersIcon, size: 'w-12 h-12', rotation: -3 },
  { Icon: UserGroupIcon, size: 'w-10 h-10', rotation: -7 },
  { Icon: UserIcon, size: 'w-9 h-9', rotation: 5 },
  
  // Comunicación y conexión
  { Icon: ChatBubbleLeftRightIcon, size: 'w-10 h-10', rotation: 5 },
  { Icon: ChatBubbleBottomCenterTextIcon, size: 'w-9 h-9', rotation: -4 },
  { Icon: PhoneIcon, size: 'w-8 h-8', rotation: 7 },
  { Icon: EnvelopeIcon, size: 'w-9 h-9', rotation: -8 },
  { Icon: LinkIcon, size: 'w-8 h-8', rotation: 6 },
  { Icon: ShareIcon, size: 'w-9 h-9', rotation: -5 },
  
  // Apoyo y ayuda
  { Icon: HandRaisedIcon, size: 'w-9 h-9', rotation: -10 },
  
  // Crecimiento y educación
  { Icon: AcademicCapIcon, size: 'w-9 h-9', rotation: 12 },
  { Icon: BookOpenIcon, size: 'w-9 h-9', rotation: -4 },
  { Icon: LightBulbIcon, size: 'w-8 h-8', rotation: -6 },
  { Icon: ArrowTrendingUpIcon, size: 'w-10 h-10', rotation: 9 },
  { Icon: ChartBarIcon, size: 'w-9 h-9', rotation: -7 },
  { Icon: ArrowPathIcon, size: 'w-8 h-8', rotation: 4 },
  
  // Diversidad e inclusión
  { Icon: GlobeAmericasIcon, size: 'w-11 h-11', rotation: 7 },
  { Icon: LanguageIcon, size: 'w-9 h-9', rotation: -9 },
  
  // Inspiración y positividad
  { Icon: StarIcon, size: 'w-7 h-7', rotation: -8 },
  
  // Seguridad y confianza
  { Icon: ShieldCheckIcon, size: 'w-10 h-10', rotation: 9 },
  { Icon: CheckBadgeIcon, size: 'w-9 h-9', rotation: 6 },
  { Icon: LockClosedIcon, size: 'w-8 h-8', rotation: -3 },
  
  // Recursos y documentación
  { Icon: DocumentTextIcon, size: 'w-9 h-9', rotation: 5 },
  { Icon: ClipboardDocumentCheckIcon, size: 'w-10 h-10', rotation: -6 },
  { Icon: PaperClipIcon, size: 'w-8 h-8', rotation: 8 },
  
  // Tiempo y presencia
  { Icon: ClockIcon, size: 'w-9 h-9', rotation: -4 },
  { Icon: CalendarIcon, size: 'w-9 h-9', rotation: 7 },
  
  // Bienestar y balance
  { Icon: PuzzlePieceIcon, size: 'w-8 h-8', rotation: -9 },
  { Icon: FireIcon, size: 'w-7 h-7', rotation: 4 },
  { Icon: BeakerIcon, size: 'w-8 h-8', rotation: 6 },
];

/**
 * Componente Hero con carrusel automático de fotos del equipo
 * 3 slides que rotan automáticamente mostrando todo el equipo
 */
export function TeamHeroCollage({ className = '', language = 'en' }: TeamHeroCollageProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (error) {
        console.error('Error loading team members for hero:', error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, []);

  // Dividir miembros en 3 slides
  const getSlides = () => {
    if (members.length === 0) return [[], [], []];
    
    const membersPerSlide = Math.ceil(members.length / 3);
    return [
      members.slice(0, membersPerSlide),
      members.slice(membersPerSlide, membersPerSlide * 2),
      members.slice(membersPerSlide * 2),
    ];
  };

  const slides = getSlides();

  // Auto-play: cambiar slide cada 5 segundos
  useEffect(() => {
    if (slides.length === 0 || slides[0].length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [slides]);

  // Función para obtener rotación aleatoria pero controlada
  const getRandomRotation = (index: number) => {
    const rotations = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    return rotations[index % rotations.length];
  };

  // Distribuir iconos estratégicamente
  const getIconForPosition = (photoIndex: number) => {
    const iconIndex = photoIndex % decorativeIcons.length;
    return decorativeIcons[iconIndex];
  };

  if (loading) {
    return (
      <section className={`relative py-16 md:py-24 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-4">
              {language === 'es'
                ? 'Humanizando el servicio desde el primer contacto'
                : 'Humanizing the service from the very first contact'}
            </h1>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative py-16 md:py-24 overflow-hidden ${className}`}>
      {/* Carrusel de slides con fotos */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          {slides.map((slideMembers, slideIndex) => (
            <div
              key={slideIndex}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === slideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 lg:gap-4 p-4 md:p-6 lg:p-8 h-full">
                {slideMembers.map((member, index) => {
                  const photoPath = pathWithBase(getPhotoPath(member, 'rounded-decorative'));
                  const rotation = getRandomRotation(index);
                  const iconData = getIconForPosition(index);
                  const IconComponent = iconData.Icon;

                  return (
                    <div
                      key={member.id}
                      className="relative group"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {/* Foto pequeña */}
                      <div className="relative overflow-hidden rounded-xl shadow-md h-20 md:h-24 lg:h-28 group-hover:scale-110 transition-transform duration-300">
                        <img
                          src={photoPath}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Overlay sutil en hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Icono decorativo superpuesto (cada 4 fotos) */}
                      {index % 4 === 0 && (
                        <div
                          className={`absolute -top-1 -right-1 ${iconData.size} text-white/25 z-10`}
                          style={{
                            transform: `rotate(${iconData.rotation}deg)`,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          }}
                        >
                          <IconComponent className="w-full h-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay con gradiente (similar a services) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blueGreen-500/85 via-blueGreen-500/80 to-blueGreen-600/85 z-10" />

      {/* Iconos decorativos flotantes adicionales - Más iconos para consejería */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {decorativeIcons.slice(0, 20).map((iconData, index) => {
          const IconComponent = iconData.Icon;
          // Posiciones estratégicas distribuidas - más posiciones para más iconos
          const positions = [
            { top: '5%', left: '2%' },
            { top: '10%', right: '4%' },
            { top: '15%', left: '1%' },
            { top: '20%', right: '6%' },
            { top: '25%', left: '3%' },
            { top: '30%', right: '8%' },
            { top: '35%', left: '2%' },
            { top: '40%', right: '5%' },
            { top: '45%', left: '4%' },
            { top: '50%', right: '3%' },
            { top: '55%', left: '6%' },
            { top: '60%', right: '7%' },
            { top: '65%', left: '2%' },
            { top: '70%', right: '9%' },
            { bottom: '25%', left: '5%' },
            { bottom: '20%', right: '6%' },
            { bottom: '15%', left: '3%' },
            { bottom: '10%', right: '8%' },
            { bottom: '5%', left: '7%' },
            { bottom: '2%', right: '4%' },
          ];
          const position = positions[index % positions.length];

          return (
            <div
              key={index}
              className={`absolute ${iconData.size} text-white/20 animate-pulse`}
              style={{
                ...position,
                transform: `rotate(${iconData.rotation}deg)`,
                animationDelay: `${index * 0.4}s`,
                animationDuration: '3s',
              }}
            >
              <IconComponent className="w-full h-full" />
            </div>
          );
        })}
      </div>

      {/* Indicadores de slide (puntos) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Contenido de texto sobre el overlay */}
      <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
          {language === 'es'
            ? 'Humanizando el servicio desde el primer contacto'
            : 'Humanizing the service from the very first contact'}
        </h1>
        <p className="text-lg md:text-xl text-white/95 drop-shadow-md">
          {language === 'es'
            ? 'Conoce a nuestro equipo compasivo dedicado a tu bienestar'
            : 'Meet our compassionate team dedicated to your well-being'}
        </p>
      </div>
    </section>
  );
}
