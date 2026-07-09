"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Loader2, Tag as TagIcon, Plus, RefreshCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { itemFormSchema, type ItemFormValues } from "@/lib/validations";
import { createItem } from "@/actions/item";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Category } from "@prisma/client";
import { calculateAskingPrice } from "@/lib/pricing";

export function AddItemForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      categoryId: "",
      description: "",
      specifications: "",
      privateNotes: "",
      quantity: 1,
      images: [],
      coverImage: "",
      condition: "Excellent",
      availability: "Available",
      featured: false,
      showOnHomepage: false,
      trending: false,
      recentlyAdded: true,
      hideFromPublic: false,
      status: "Draft",
      tags: [],
      sealed: false,
    },
  });

  const [isPriceManuallyEdited, setIsPriceManuallyEdited] = useState(false);

  const watchedName = useWatch({ control: form.control, name: "name" }) || "";
  const watchedCondition = useWatch({ control: form.control, name: "condition" }) || "";
  const watchedSealed = useWatch({ control: form.control, name: "sealed" }) || false;
  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" }) || "";
  const watchedSeries = useWatch({ control: form.control, name: "series" }) || "";

  useEffect(() => {
    if (isPriceManuallyEdited) return;

    // Find category name
    const categoryName = categories.find((c) => c.id === watchedCategoryId)?.name || "";

    const newPrice = calculateAskingPrice({
      name: watchedName,
      condition: watchedCondition,
      sealed: watchedSealed,
      categoryName,
      series: watchedSeries,
    });

    form.setValue("askingPrice", newPrice, { shouldValidate: true });
  }, [watchedName, watchedCondition, watchedSealed, watchedCategoryId, watchedSeries, categories, isPriceManuallyEdited, form]);

  async function onSubmit(values: ItemFormValues) {
    if (values.images && values.images.length > 0) {
      // Find the first image or the one explicitly marked as Cover
      const cover = values.images.find(img => img.type === 'Cover Image') || values.images[0];
      values.coverImage = cover.url;
    }
    
    if (!values.coverImage) {
      toast.error("Please upload at least one image to act as the cover image.");
      return;
    }

    startTransition(async () => {
      const result = await createItem(values);
      if (result.success) {
        toast.success("Item created successfully!");
        router.push("/admin/items");
      } else {
        toast.error(result.error || "Failed to create item.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="pb-20">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Item</h2>
            <p className="text-muted-foreground mt-1">
              Create a new collectible entry. All fields are manual.
            </p>
          </div>
          <div className="flex gap-2">
             <Button type="button" variant="outline">
                Preview
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Publish
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECTION 1: Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Section 1: Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={e => {
                          field.onChange(e);
                          form.setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                     <FormLabel>Collection ID</FormLabel>
                     <Input disabled placeholder="Auto-generated on save (e.g. NB57-0001)" className="bg-slate-50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <span className="flex flex-1 text-left line-clamp-1">
                                {field.value ? categories.find(c => c.id === field.value)?.name : "Select a category"}
                              </span>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id} label={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Category</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="series"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="character"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Character</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="releaseYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: Images */}
            <Card>
              <CardHeader>
                <CardTitle>Section 2: Image Upload</CardTitle>
                <CardDescription>Drag to reorder. First image is always the Cover.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload 
                          value={field.value || []} 
                          onChange={(url) => field.onChange(url)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SECTION 3: Description */}
            <Card>
              <CardHeader>
                <CardTitle>Section 3: Description & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="public" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="public">Public Description</TabsTrigger>
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="private">Private Notes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="public" className="mt-0">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RichTextEditor value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="specs" className="mt-0">
                     <FormField
                      control={form.control}
                      name="specifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="private" className="mt-0">
                     <FormField
                      control={form.control}
                      name="privateNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RichTextEditor value={field.value || ''} onChange={field.onChange} />
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-2">These notes will never appear on the public website.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* SECTION 4: Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Section 4: Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="askingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Asking Price (₹)</FormLabel>
                          {isPriceManuallyEdited && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setIsPriceManuallyEdited(false);
                              }}
                            >
                              <RefreshCcw className="w-3 h-3 mr-1" />
                              Reset
                            </Button>
                          )}
                        </div>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={(e) => {
                              setIsPriceManuallyEdited(true);
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fairValueMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fair Value / Estimate (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <FormField
                    control={form.control}
                    name="highestSeenPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Observed</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lowestSeenPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lowest Observed</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Source</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} placeholder="e.g. eBay, Reddit" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                   <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* SECTION 9: SEO */}
            <Card>
              <CardHeader>
                <CardTitle>Section 9: SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">
            
            {/* SECTION 10: Publish Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Section 10: Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gap-2" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Item
                </Button>
                <div className="grid grid-cols-2 gap-2">
                   <Button type="button" variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                    Delete
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SECTION 5 & 6: Condition & Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Section 5 & 6: Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Reserved">Reserved</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                          <SelectItem value="Not For Sale">Not For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch("availability") === "Sold" && (
                  <div className="pt-4 border-t space-y-4">
                     <FormField
                      control={form.control}
                      name="soldPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sold Price (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="soldDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sold Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 7: Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Section 7: Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Add tag and press Enter..." 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const currentTags = form.getValues('tags') || [];
                          if (!currentTags.includes(val)) {
                            form.setValue('tags', [...currentTags, val]);
                          }
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.watch("tags") || []).map((tag, i) => (
                    <div key={i} className="bg-slate-100 text-xs px-2 py-1 rounded-md flex items-center gap-1">
                      <TagIcon className="h-3 w-3" /> {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 8: Homepage Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Section 8: Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Featured Item</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="showOnHomepage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show on Homepage</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trending"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Trending</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recentlyAdded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Recently Added</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hideFromPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Hide from Public</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sealed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Sealed Product</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

          </div>
        </div>
      </form>
    </Form>
  );
}
