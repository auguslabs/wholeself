import React, { useEffect, useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { getLocalizedText } from '@/data/models/ContentPage';
import type { ContentPage, LocalizedText } from '@/data/models/ContentPage';

function updateLocalizedTextValue(
  text: LocalizedText,
  value: string,
  language: 'en' | 'es'
) {
  if (typeof text === 'string') {
    return value;
  }
  return {
    ...text,
    [language]: value,
  };
}

function applyEditToContent(
  prevContent: any,
  fieldKey: string,
  draftValue: any,
  language: 'en' | 'es'
) {
  const next = JSON.parse(JSON.stringify(prevContent));

  if (fieldKey === 'hero.headline') {
    next.hero.headline = updateLocalizedTextValue(next.hero.headline, draftValue, language);
  } else if (fieldKey === 'hero.description') {
    next.hero.description = updateLocalizedTextValue(next.hero.description, draftValue, language);
  } else if (fieldKey === 'hero.backgroundImage') {
    next.hero.backgroundImage = draftValue;
  } else if (fieldKey === 'cta.sectionTitle') {
    next.ctaSection.title = updateLocalizedTextValue(next.ctaSection.title, draftValue, language);
  } else if (fieldKey.startsWith('vp.')) {
    const [, indexStr] = fieldKey.split('.');
    const index = Number(indexStr);
    const item = next.valuePropositions.items[index];
    if (item && draftValue) {
      item.icon = draftValue.icon;
      item.title = updateLocalizedTextValue(item.title, draftValue.title, language);
      item.description = updateLocalizedTextValue(item.description, draftValue.description, language);
    }
  } else if (fieldKey.startsWith('cta.')) {
    const [, indexStr] = fieldKey.split('.');
    const index = Number(indexStr);
    const item = next.ctaSection.ctas[index];
    if (item && draftValue) {
      item.icon = draftValue.icon;
      item.link = draftValue.link;
      item.title = updateLocalizedTextValue(item.title, draftValue.title, language);
      item.description = updateLocalizedTextValue(item.description, draftValue.description, language);
    }
  }

  return next;
}

/**
 * Props del componente HomeEditor
 */
interface HomeEditorProps {
  homeData: ContentPage;
  language?: 'en' | 'es';
}

/**
 * Componente HomeEditor
 * 
 * Editor de contenido para la página Home
 * Muestra todos los campos editables de forma simple
 */
export function HomeEditor({ homeData, language = 'en' }: HomeEditorProps) {
  if (!homeData || !homeData.content) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error: Invalid home data structure</p>
      </div>
    );
  }

  const [contentState, setContentState] = useState(() =>
    JSON.parse(JSON.stringify(homeData.content))
  );
  const [editingField, setEditingField] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<any>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setContentState(JSON.parse(JSON.stringify(homeData.content)));
    setEditingField(null);
    setDraftValue('');
    setSaveStatus('idle');
    setSaveMessage(null);
  }, [homeData, language]);

  const startEditing = (fieldKey: string, value: any) => {
    setEditingField(fieldKey);
    setDraftValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setDraftValue('');
  };

  const persistContent = async (nextContent: any) => {
    setSaveStatus('saving');
    setSaveMessage('Guardando cambios...');

    try {
      const response = await fetch('/api/admin/save-home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          content: nextContent,
        }),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let message = `Error al guardar (status ${response.status}).`;

        if (responseText) {
          try {
            const errorBody = JSON.parse(responseText);
            message = errorBody?.message || message;
          } catch {
            message = responseText;
          }
        }

        throw new Error(message);
      }

      setSaveStatus('saved');
      setSaveMessage('Cambios guardados en JSON de prueba.');
    } catch (error: any) {
      setSaveStatus('error');
      setSaveMessage(error?.message || 'No se pudo guardar.');
    }
  };

  const saveEditing = async () => {
    if (!editingField) {
      return;
    }

    const nextContent = applyEditToContent(contentState, editingField, draftValue, language);
    setContentState(nextContent);
    await persistContent(nextContent);

    setEditingField(null);
    setDraftValue('');
  };

  const content = contentState;
  const hero = content.hero;
  const valuePropositions = content.valuePropositions;
  const ctaSection = content.ctaSection;

  return (
    <div className="p-8 space-y-8">
      {saveMessage && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            saveStatus === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : saveStatus === 'saving'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {saveMessage}
        </div>
      )}
      {/* Hero Section */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Hero Section</h2>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Headline</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
                aria-label="Edit Headline"
                onClick={() =>
                  startEditing('hero.headline', getLocalizedText(hero.headline, language))
                }
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </label>
            {editingField === 'hero.headline' ? (
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <input
                  type="text"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={saveEditing}
                    className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">
                  {getLocalizedText(hero.headline, language)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Description</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
                aria-label="Edit Description"
                onClick={() =>
                  startEditing('hero.description', getLocalizedText(hero.description, language))
                }
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </label>
            {editingField === 'hero.description' ? (
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <textarea
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={saveEditing}
                    className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-700">
                  {getLocalizedText(hero.description, language)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Background Image</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
                aria-label="Edit Background Image"
                onClick={() => startEditing('hero.backgroundImage', hero.backgroundImage)}
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </label>
            {editingField === 'hero.backgroundImage' ? (
              <div className="p-4 bg-white rounded-md border border-gray-200">
                <input
                  type="text"
                  value={draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={saveEditing}
                    className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-600">{hero.backgroundImage}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="border-b border-gray-200 pb-8">
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Value Propositions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {valuePropositions.items.map((item: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-[#07549b] rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="text-sm text-gray-500">Icon: {item.icon}</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
                      aria-label={`Edit Value Proposition ${index + 1}`}
                      onClick={() =>
                        startEditing(`vp.${index}`, {
                          icon: item.icon,
                          title: getLocalizedText(item.title, language),
                          description: getLocalizedText(item.description, language),
                        })
                      }
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {editingField === `vp.${index}` ? (
                    <div className="mt-2 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                        <input
                          type="text"
                          value={draftValue?.icon || ''}
                          onChange={(e) =>
                            setDraftValue({ ...draftValue, icon: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                        <input
                          type="text"
                          value={draftValue?.title || ''}
                          onChange={(e) =>
                            setDraftValue({ ...draftValue, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={draftValue?.description || ''}
                          onChange={(e) =>
                            setDraftValue({ ...draftValue, description: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEditing}
                          className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {getLocalizedText(item.title, language)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getLocalizedText(item.description, language)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <h2 className="text-2xl font-semibold text-[#07549b] mb-6">Call to Action Section</h2>
        
        <div className="mb-4">
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Section Title</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
              aria-label="Edit CTA Section Title"
              onClick={() =>
                startEditing('cta.sectionTitle', getLocalizedText(ctaSection.title, language))
              }
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </label>
          {editingField === 'cta.sectionTitle' ? (
            <div className="p-4 bg-white rounded-md border border-gray-200">
              <input
                type="text"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={saveEditing}
                  className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-lg font-semibold text-gray-900">
                {getLocalizedText(ctaSection.title, language)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ctaSection.ctas.map((cta: any, index: number) => (
            <div key={cta.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Icon: {cta.icon}</p>
                  <p className="text-xs text-gray-500 mb-2">Link: {cta.link}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#07549b] transition-colors"
                  aria-label={`Edit CTA ${cta.id}`}
                  onClick={() =>
                    startEditing(`cta.${index}`, {
                      icon: cta.icon,
                      link: cta.link,
                      title: getLocalizedText(cta.title, language),
                      description: getLocalizedText(cta.description, language),
                    })
                  }
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
              {editingField === `cta.${index}` ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                    <input
                      type="text"
                      value={draftValue?.icon || ''}
                      onChange={(e) =>
                        setDraftValue({ ...draftValue, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                    <input
                      type="text"
                      value={draftValue?.link || ''}
                      onChange={(e) =>
                        setDraftValue({ ...draftValue, link: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={draftValue?.title || ''}
                      onChange={(e) =>
                        setDraftValue({ ...draftValue, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={draftValue?.description || ''}
                      onChange={(e) =>
                        setDraftValue({ ...draftValue, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#07549b]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEditing}
                      className="px-3 py-1.5 text-sm bg-[#07549b] text-white rounded-md hover:bg-[#064080] transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-[#07549b] mb-2">
                    {getLocalizedText(cta.title, language)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getLocalizedText(cta.description, language)}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
