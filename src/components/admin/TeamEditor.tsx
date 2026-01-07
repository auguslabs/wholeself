import React, { useState } from 'react';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage } from '@/data/models/ContentPage';

/**
 * Props del componente TeamEditor
 */
interface TeamEditorProps {
  teamData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente TeamEditor
 * 
 * Editor de contenido para la página Team
 * Muestra título, descripción, dropdown para seleccionar miembros y botón "Mostrar"
 */
export function TeamEditor({ teamData, language = 'en' }: TeamEditorProps) {
  if (!teamData || !teamData.content) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error: Invalid team data structure</p>
      </div>
    );
  }

  const teamMembers = teamData.content.team_members || [];
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [showMemberInfo, setShowMemberInfo] = useState<boolean>(false);

  // Encontrar el miembro seleccionado
  const selectedMember = teamMembers.find((member: any) => member.id === selectedMemberId);

  // Manejar clic en botón "Mostrar"
  const handleShowMember = () => {
    if (selectedMemberId) {
      setShowMemberInfo(true);
    }
  };

  // Obtener descripción según el idioma
  const getMemberDescription = (member: any) => {
    if (language === 'es' && member.descriptionEs) {
      return member.descriptionEs;
    }
    return member.descriptionEn || '';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Team Section Header</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-lg font-semibold text-gray-900">
                {getLocalizedText(teamData.seo.title, language)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-700">
                {getLocalizedText(teamData.seo.description, language)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section>
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Team Members</h2>
        
        {teamMembers.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">No team members found in the data.</p>
          </div>
        ) : (
          <>
            {/* Dropdown y Botón "Mostrar" */}
            <div className="mb-6 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team Member
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    setShowMemberInfo(false); // Reset mostrar cuando cambia selección
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b] focus:border-transparent bg-white"
                >
                  <option value="">-- Select a team member --</option>
                  {teamMembers.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleShowMember}
                disabled={!selectedMemberId}
                className="px-6 py-2 bg-[#07549b] text-white rounded-md hover:bg-[#064080] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Mostrar
              </button>
            </div>
          </>
        )}

        {/* Información del miembro seleccionado - Solo se muestra después de hacer clic en "Mostrar" */}
        {showMemberInfo && selectedMember && (
          <div className="space-y-4 p-6 bg-gray-50 rounded-md border border-gray-200">
            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedMember.photoFilename || 'N/A'}
                </p>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">
                  {selectedMember.firstName} {selectedMember.lastName}
                </p>
              </div>
            </div>

            {/* Credenciales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credentials
              </label>
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <p className="text-gray-900">
                  {selectedMember.credentials || 'N/A'}
                </p>
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <p className="text-gray-900">
                  {selectedMember.role}
                </p>
              </div>
            </div>

            {/* Biografía/Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography / Description
              </label>
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {getMemberDescription(selectedMember)}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
