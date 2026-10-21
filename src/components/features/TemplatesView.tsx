import React, { useState } from 'react';
import { usePhotobooth } from '@/state/photoboothContext';
import { Template, TemplateElement } from '@/types';
import {
  Layers,
  Trash2,
  Save,
  Type,
  Image as ImageIcon,
  Square,
  Check,
  Move,
} from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const { templates, activeTemplate, setActiveTemplate, saveTemplate } = usePhotobooth();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const currentTemplate = activeTemplate;

  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    const updatedElements = currentTemplate.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    const updatedTemplate: Template = {
      ...currentTemplate,
      elements: updatedElements,
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(updatedTemplate);
  };

  const handleAddPhotoElement = () => {
    const photoCount = currentTemplate.elements.filter((e) => e.type === 'photo').length;
    const newElement: TemplateElement = {
      id: `photo-${Date.now()}`,
      type: 'photo',
      photoIndex: photoCount,
      x: 10,
      y: 10 + photoCount * 30,
      width: 80,
      height: 45,
      zIndex: currentTemplate.elements.length + 1,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: '#e2e8f0',
    };
    const updated = {
      ...currentTemplate,
      elements: [...currentTemplate.elements, newElement],
    };
    saveTemplate(updated);
    setSelectedElementId(newElement.id);
  };

  const handleAddTextElement = () => {
    const newElement: TemplateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'EVENT TITLE',
      x: 10,
      y: 120,
      width: 80,
      height: 10,
      fontSize: 4,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      zIndex: currentTemplate.elements.length + 1,
    };
    const updated = {
      ...currentTemplate,
      elements: [...currentTemplate.elements, newElement],
    };
    saveTemplate(updated);
    setSelectedElementId(newElement.id);
  };

  const handleDeleteElement = (id: string) => {
    const updated = {
      ...currentTemplate,
      elements: currentTemplate.elements.filter((e) => e.id !== id),
    };
    saveTemplate(updated);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleSave = () => {
    saveTemplate(currentTemplate);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  const selectedElement = currentTemplate.elements.find((e) => e.id === selectedElementId);

  // Aspect ratio for preview canvas
  const canvasAspect = currentTemplate.widthMm / currentTemplate.heightMm;

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-foreground">Visual Template Designer</h2>
            <p className="text-xs text-muted-foreground">
              Editing: <span className="text-foreground font-medium">{currentTemplate.name}</span> ({currentTemplate.widthMm} x {currentTemplate.heightMm} mm @ 300 DPI)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Preset Selector */}
          <select
            value={currentTemplate.id}
            onChange={(e) => {
              const found = templates.find((t) => t.id === e.target.value);
              if (found) setActiveTemplate(found);
            }}
            className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground font-medium"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
          >
            {isSavedAlert ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSavedAlert ? 'Saved!' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      {/* Main Designer Studio */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left: Element Toolbar & Layer Hierarchy (3 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">Insert Elements</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddPhotoElement}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
                >
                  <Square className="w-3.5 h-3.5 text-primary" />
                  <span>+ Photo Frame</span>
                </button>
                <button
                  onClick={handleAddTextElement}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
                >
                  <Type className="w-3.5 h-3.5 text-accent" />
                  <span>+ Custom Text</span>
                </button>
              </div>
            </div>

            {/* Elements Layer List */}
            <div>
              <span className="text-xs font-semibold text-foreground block mb-2">
                Layers ({currentTemplate.elements.length})
              </span>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {currentTemplate.elements.map((el) => {
                  const isSelected = el.id === selectedElementId;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary/10 border border-primary text-primary'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {el.type === 'photo' && <Square className="w-3.5 h-3.5 text-primary" />}
                        {el.type === 'text' && <Type className="w-3.5 h-3.5 text-accent" />}
                        {el.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="truncate">
                          {el.type === 'photo'
                            ? `Photo #${(el.photoIndex ?? 0) + 1}`
                            : el.text || el.id}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="text-muted-foreground hover:text-rose-400 p-1"
                        title="Delete element"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Canvas Properties */}
          <div className="pt-4 border-t border-border space-y-3 text-xs">
            <span className="font-semibold text-foreground block">Canvas Settings</span>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Background:</span>
              <input
                type="color"
                value={currentTemplate.backgroundColor}
                onChange={(e) =>
                  saveTemplate({ ...currentTemplate, backgroundColor: e.target.value })
                }
                className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Safe Margin:</span>
              <span className="font-mono text-foreground">{currentTemplate.safeMarginMm} mm</span>
            </div>
          </div>
        </div>

        {/* Center: Live Interactive Canvas Preview (6 cols) */}
        <div className="lg:col-span-6 bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center overflow-hidden">
          <div
            className="relative shadow-2xl rounded-sm border border-border overflow-hidden select-none transition-all"
            style={{
              aspectRatio: `${canvasAspect}`,
              height: '85%',
              backgroundColor: currentTemplate.backgroundColor,
            }}
          >
            {/* Safe margin boundary line */}
            <div
              className="absolute inset-2 border border-dashed border-red-500/20 pointer-events-none z-20"
              title="Safe Print Margin"
            />

            {/* Elements Rendering */}
            {currentTemplate.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              const elLeft = `${(el.x / currentTemplate.widthMm) * 100}%`;
              const elTop = `${(el.y / currentTemplate.heightMm) * 100}%`;
              const elWidth = `${(el.width / currentTemplate.widthMm) * 100}%`;
              const elHeight = `${(el.height / currentTemplate.heightMm) * 100}%`;

              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(el.id);
                  }}
                  className={`absolute cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-black z-30' : ''
                  }`}
                  style={{
                    left: elLeft,
                    top: elTop,
                    width: elWidth,
                    height: elHeight,
                    zIndex: el.zIndex,
                    backgroundColor: el.backgroundColor || (el.type === 'photo' ? '#18181b' : 'transparent'),
                    borderRadius: el.borderRadius ? `${el.borderRadius * 3}px` : undefined,
                    borderWidth: el.borderWidth ? `${el.borderWidth * 2}px` : undefined,
                    borderColor: el.borderColor || undefined,
                  }}
                >
                  {el.type === 'photo' && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900/90 text-center p-1">
                      <Square className="w-5 h-5 mb-1 text-primary" />
                      <span className="text-[10px] font-bold">Photo #{(el.photoIndex ?? 0) + 1}</span>
                    </div>
                  )}

                  {el.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center"
                      style={{
                        justifyContent:
                          el.textAlign === 'center'
                            ? 'center'
                            : el.textAlign === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                        color: el.color || '#ffffff',
                        fontWeight: el.fontWeight || 600,
                        fontSize: '11px',
                      }}
                    >
                      {el.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-3 font-mono">
            Physical Output: {currentTemplate.widthMm}mm x {currentTemplate.heightMm}mm (4x6in Postcard)
          </span>
        </div>

        {/* Right: Selected Element Inspector (3 cols) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-bold text-foreground">Element Properties</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted uppercase text-muted-foreground">
                  {selectedElement.type}
                </span>
              </div>

              {/* Position and Size (mm) */}
              <div className="space-y-2">
                <span className="text-[11px] font-medium text-muted-foreground">Position & Dimensions (mm)</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-muted-foreground">X (mm)</label>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { x: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Y (mm)</label>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { y: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Width (mm)</label>
                    <input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { width: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Height (mm)</label>
                    <input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { height: Number(e.target.value) })}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Text Element Customization */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <span className="text-[11px] font-medium text-muted-foreground">Text Properties</span>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Content</label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { text: e.target.value })}
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Color</span>
                    <input
                      type="color"
                      value={selectedElement.color || '#ffffff'}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-border cursor-pointer bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground">Alignment</label>
                    <div className="grid grid-cols-3 gap-1 mt-1">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          onClick={() => handleUpdateElement(selectedElement.id, { textAlign: align })}
                          className={`py-1 text-xs rounded capitalize font-medium ${
                            selectedElement.textAlign === align
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Element Customization */}
              {selectedElement.type === 'photo' && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <span className="text-[11px] font-medium text-muted-foreground">Photo Properties</span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target Shot #:</span>
                    <select
                      value={selectedElement.photoIndex ?? 0}
                      onChange={(e) =>
                        handleUpdateElement(selectedElement.id, { photoIndex: Number(e.target.value) })
                      }
                      className="bg-muted border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value={0}>Photo 1</option>
                      <option value={1}>Photo 2</option>
                      <option value={2}>Photo 3</option>
                      <option value={3}>Photo 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Border Radius (mm)</label>
                    <input
                      type="number"
                      value={selectedElement.borderRadius ?? 0}
                      onChange={(e) =>
                        handleUpdateElement(selectedElement.id, { borderRadius: Number(e.target.value) })
                      }
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground text-xs">
              <Move className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <span>Click on any canvas element or layer to inspect and edit properties.</span>
            </div>
          )}

          <div className="pt-4 border-t border-border text-[11px] text-muted-foreground">
            Changes are saved locally and synced with live sessions.
          </div>
        </div>
      </div>
    </div>
  );
};
