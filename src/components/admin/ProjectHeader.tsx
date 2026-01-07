import React from 'react';

/**
 * Props del componente ProjectHeader
 */
interface ProjectHeaderProps {
  projectName: string;
  projectSubtitle?: string;
}

/**
 * Componente ProjectHeader
 * 
 * Muestra el nombre del proyecto en la parte superior derecha del panel
 * Ocupa 4/5 del ancho (columna 2, fila 1)
 */
export function ProjectHeader({ projectName, projectSubtitle }: ProjectHeaderProps) {
  return (
    <div className="flex items-center h-full px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
          {projectName}
        </h1>
        {projectSubtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {projectSubtitle}
          </p>
        )}
      </div>
    </div>
  );
}
