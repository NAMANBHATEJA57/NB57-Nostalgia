"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageItem {
  url: string;
  publicId: string;
  type: string;
}

interface ImageUploadProps {
  value: ImageItem[];
  onChange: (value: ImageItem[]) => void;
}

const SortableImage = ({ img, index, onRemove, onTypeChange }: { img: ImageItem, index: number, onRemove: () => void, onTypeChange: (type: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.publicId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative w-40 h-48 rounded-md overflow-hidden border bg-white flex flex-col ${isDragging ? 'shadow-2xl ring-2 ring-primary' : 'shadow-sm'}`}>
      <div className="flex items-center justify-between bg-slate-100 p-1 border-b">
        <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-slate-200 rounded">
          <GripVertical className="h-4 w-4 text-slate-500" />
        </div>
        <Button type="button" onClick={onRemove} variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative flex-1 bg-slate-50">
        <Image fill src={img.url} alt="Upload" className="object-cover" />
      </div>
      <div className="p-1 text-xs text-center border-t bg-slate-50">
        <select 
          className="w-full bg-transparent border-none outline-none text-center cursor-pointer font-medium text-slate-700"
          value={index === 0 ? "Cover Image" : img.type}
          onChange={(e) => onTypeChange(e.target.value)}
          disabled={index === 0}
        >
          {index === 0 ? (
             <option value="Cover Image">Cover Image</option>
          ) : (
            <>
              <option value="Front">Front</option>
              <option value="Back">Back</option>
              <option value="Packaging">Packaging</option>
              <option value="Close Up">Close Up</option>
              <option value="Damage">Damage</option>
              <option value="Extra">Extra</option>
            </>
          )}
        </select>
      </div>
    </div>
  );
};

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onUpload = (result: any) => {
    const newImage = {
      url: result.info.secure_url,
      publicId: result.info.public_id,
      type: value.length === 0 ? "Cover Image" : "Front",
    };
    onChange([...value, newImage]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((img) => img.publicId === active.id);
      const newIndex = value.findIndex((img) => img.publicId === over.id);
      
      const newArray = arrayMove(value, oldIndex, newIndex);
      // Ensure index 0 type becomes Cover Image, and if the old cover image moved, set it to something else if we care.
      onChange(newArray);
    }
  };

  return (
    <div className="space-y-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-wrap gap-4 mb-4">
          <SortableContext 
            items={value.map(img => img.publicId)}
            strategy={rectSortingStrategy}
          >
            {value.map((img, index) => (
              <SortableImage 
                key={img.publicId} 
                img={img} 
                index={index}
                onRemove={() => onChange(value.filter((i) => i.publicId !== img.publicId))}
                onTypeChange={(type) => {
                  const newValue = [...value];
                  newValue[index].type = type;
                  onChange(newValue);
                }}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      
      <CldUploadWidget 
        uploadPreset="nb57_admin" 
        onUpload={onUpload}
        options={{ multiple: true, folder: "Nostalgia" }}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              variant="outline"
              onClick={() => open()}
              className="w-full border-dashed py-8 bg-slate-50 hover:bg-slate-100"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8 opacity-50" />
                <span>Upload Images</span>
                <span className="text-xs">Drag & Drop, Browse, or Paste files here</span>
              </div>
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
