"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CldUploadWidget } from "next-cloudinary";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";

export function CategoryForm({ category, onSuccess }: { category?: any, onSuccess?: () => void }) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [thumbnailImage, setThumbnailImage] = useState(category?.thumbnailImage || "");
  const [bannerImage, setBannerImage] = useState(category?.bannerImage || "");
  const [featured, setFeatured] = useState(category?.featured || false);
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for server action would go here
    console.log("Saving category:", { name, description, thumbnailImage, bannerImage, featured, sortOrder });
    if (onSuccess) onSuccess();
  };

  const ImageUploader = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="relative w-full h-32 rounded-md overflow-hidden border">
          <Image src={value} fill alt={label} className="object-cover" />
          <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-6 w-6" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <CldUploadWidget uploadPreset="nb57_admin" onUpload={(res: any) => onChange(res.info.secure_url)}>
          {({ open }) => (
            <Button type="button" variant="outline" className="w-full h-32 border-dashed flex flex-col gap-2" onClick={() => open()}>
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload {label}</span>
            </Button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Name *</Label>
        <Input required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <ImageUploader value={thumbnailImage} onChange={setThumbnailImage} label="Thumbnail Image" />
         <ImageUploader value={bannerImage} onChange={setBannerImage} label="Banner Image" />
      </div>
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label>Display Order</Label>
           <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
         </div>
         <div className="flex items-center space-x-2 pt-8">
           <Checkbox id="featured" checked={featured} onCheckedChange={(c) => setFeatured(c as boolean)} />
           <Label htmlFor="featured">Featured Category</Label>
         </div>
      </div>
      <Button type="submit" className="w-full">Save Category</Button>
    </form>
  );
}
