'use client';

import { useState, useEffect } from 'react';
import { Item, Image as ItemImage, Category } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateItem } from '@/app/admin/items/[id]/actions';
import { Plus, X, RefreshCcw } from 'lucide-react';
import { calculateAskingPrice } from '@/lib/pricing';
import { Checkbox } from '@/components/ui/checkbox';

type ItemWithImages = Item & { images: ItemImage[] };

interface EditItemFormProps {
  item: ItemWithImages;
  categories: Category[];
}

export function EditItemForm({ item, categories }: EditItemFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(item.categoryId);
  const [extraImages, setExtraImages] = useState<string[]>(
    item.images.sort((a, b) => a.order - b.order).map(img => img.url)
  );

  const [name, setName] = useState(item.name || "");
  const [condition, setCondition] = useState(item.condition || "Excellent");
  const [series, setSeries] = useState(item.series || "");
  const [sealed, setSealed] = useState(item.sealed || false);
  const [askingPrice, setAskingPrice] = useState<number | string>(item.askingPrice ?? "");
  const [isPriceManuallyEdited, setIsPriceManuallyEdited] = useState(true);

  useEffect(() => {
    if (isPriceManuallyEdited) return;

    const categoryName = categoryId ? categories.find(c => c.id === categoryId)?.name || "" : "";
    const newPrice = calculateAskingPrice({
      name,
      condition,
      sealed,
      categoryName,
      series
    });
    setAskingPrice(newPrice);
  }, [name, condition, sealed, categoryId, series, categories, isPriceManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    
    // Add extra images as JSON to the form data
    formData.append('extraImagesJson', JSON.stringify(extraImages.filter(url => url.trim() !== '')));

    try {
      await updateItem(item.id, formData);
    } catch (err) {
      console.error(err);
      setIsPending(false);
    }
  };

  const addImageField = () => {
    setExtraImages([...extraImages, '']);
  };

  const removeImageField = (index: number) => {
    const newImages = [...extraImages];
    newImages.splice(index, 1);
    setExtraImages(newImages);
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...extraImages];
    newImages[index] = value;
    setExtraImages(newImages);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="bg-white p-6 rounded-xl border space-y-6">
        <h3 className="text-lg font-semibold">Basic Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="askingPrice">Asking Price (₹)</Label>
              {isPriceManuallyEdited && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => setIsPriceManuallyEdited(false)}
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            <Input 
              id="askingPrice" 
              name="askingPrice" 
              type="number" 
              value={askingPrice} 
              onChange={(e) => {
                setIsPriceManuallyEdited(true);
                setAskingPrice(e.target.value);
              }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" value={categoryId || undefined} onValueChange={setCategoryId}>
              <SelectTrigger>
                <span className="flex flex-1 text-left line-clamp-1">
                  {categoryId ? categories.find(c => c.id === categoryId)?.name : "Select category"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="series">Series</Label>
            <Input id="series" name="series" value={series} onChange={(e) => setSeries(e.target.value)} />
          </div>
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox 
              id="sealed" 
              checked={sealed} 
              onCheckedChange={(c) => setSealed(c === true)} 
            />
            <input type="hidden" name="sealed" value={sealed ? "true" : "false"} />
            <Label htmlFor="sealed">Sealed Product</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select name="condition" value={condition} onValueChange={(v) => v && setCondition(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Factory Sealed">Factory Sealed</SelectItem>
                <SelectItem value="Near Mint / Not Played">Near Mint / Not Played</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Played">Played</SelectItem>
                <SelectItem value="Heavy Played">Heavy Played</SelectItem>
                <SelectItem value="Damaged">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" name="quantity" type="number" defaultValue={item.quantity || 1} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select name="availability" defaultValue={item.availability}>
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Not for Sale">Not for Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={item.description} rows={5} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border space-y-6">
        <h3 className="text-lg font-semibold">Images</h3>
        
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image URL (Primary)</Label>
          <Input id="coverImage" name="coverImage" defaultValue={item.coverImage} required />
          {item.coverImage && (
            <div className="mt-2 w-32 h-32 rounded border overflow-hidden bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.coverImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label>Extra Images (Gallery)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addImageField}>
              <Plus className="h-4 w-4 mr-2" /> Add Image
            </Button>
          </div>
          
          {extraImages.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No extra images added.</p>
          ) : (
            <div className="space-y-3">
              {extraImages.map((url, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="https://..." 
                      value={url}
                      onChange={(e) => updateImageField(index, e.target.value)}
                    />
                  </div>
                  {url ? (
                    <div className="w-10 h-10 rounded border overflow-hidden shrink-0 bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded border shrink-0 bg-slate-50 border-dashed"></div>
                  )}
                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeImageField(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending} className="w-32">
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
