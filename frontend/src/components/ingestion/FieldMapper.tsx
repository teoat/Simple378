import { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ArrowRight, GripVertical, Check } from 'lucide-react';
import { FieldMapping } from '../../types/ingestion';

interface FieldMapperProps {
  sourceFields: string[];
  targetFields: string[];
  mappings: FieldMapping[];
  onMappingChange: (mappings: FieldMapping[]) => void;
}

export function FieldMapper({ sourceFields, targetFields, mappings, onMappingChange }: FieldMapperProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active) {
      const source = active.id as string;
      const target = over.id as string;
      
      // Update mappings
      const newMappings = [...mappings];
      const existingIndex = newMappings.findIndex(m => m.targetField === target);
      
      if (existingIndex >= 0) {
        newMappings[existingIndex] = { sourceField: source, targetField: target };
      } else {
        newMappings.push({ sourceField: source, targetField: target });
      }
      
      onMappingChange(newMappings);
    }
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-12">
        {/* Source Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center justify-between">
            <span>Source Columns (CSV)</span>
            <span className="text-xs font-normal text-slate-400">{sourceFields.length} columns</span>
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {sourceFields.map(field => (
              <DraggableSource key={field} id={field} isMapped={mappings.some(m => m.sourceField === field)} />
            ))}
          </div>
        </div>

        {/* Target Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center justify-between">
             <span>System Fields</span>
             <span className="text-xs font-normal text-slate-400">Required</span>
          </h3>
          <div className="space-y-3">
            {targetFields.map(field => {
              const mapping = mappings.find(m => m.targetField === field);
              return (
                <DroppableTarget 
                  key={field} 
                  id={field} 
                  mappedSource={mapping?.sourceField} 
                  onRemove={() => {
                    onMappingChange(mappings.filter(m => m.targetField !== field));
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="px-4 py-3 bg-blue-600 text-white rounded-lg shadow-xl font-medium flex items-center gap-2 cursor-grabbing w-full max-w-[200px]">
            <GripVertical className="w-4 h-4 text-blue-200" />
            {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DraggableSource({ id, isMapped }: { id: string, isMapped: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 ring-2 ring-blue-500 bg-blue-50' : 'bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'}
        ${isMapped ? 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}
      `}
    >
      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
      <span className={`flex-1 font-medium ${isMapped ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
        {id}
      </span>
      {isMapped && <Check className="w-4 h-4 text-blue-500" />}
    </div>
  );
}

function DroppableTarget({ id, mappedSource, onRemove }: { id: string, mappedSource?: string, onRemove: () => void }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative rounded-xl border-2 transition-all p-1
        ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 border-dashed'}
        ${mappedSource ? 'border-solid border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900/50'}
      `}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
            {id.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="block font-medium text-slate-900 dark:text-slate-100">{id}</span>
            <span className="text-xs text-slate-400">Target Field</span>
          </div>
        </div>

        {mappedSource ? (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-100 dark:border-slate-700">
            <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
              {mappedSource}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="pr-4 text-sm text-slate-400 italic">
            Drop source column here
          </div>
        )}
      </div>
    </div>
  );
}
