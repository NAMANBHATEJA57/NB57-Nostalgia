"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional(),
  author: z.string().default("NB57's Nostalgia"),
  status: z.enum(["Draft", "Published", "Scheduled"]).default("Draft"),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  readingTime: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  schemaType: z.enum(["Article", "How-To", "Guide", "Collection", "Review"]).default("Article"),
  estimatedDifficulty: z.string().optional(),
  openGraphImage: z.string().url().optional().or(z.literal("")),
  twitterImage: z.string().url().optional().or(z.literal("")),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogEditorFormProps {
  initialData?: any;
  categories: { id: string; name: string }[];
}

export function BlogEditorForm({ initialData, categories }: BlogEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      categoryId: categories[0]?.id || "",
      excerpt: "",
      content: "",
      featuredImage: "",
      author: "NB57's Nostalgia",
      status: "Draft",
      featured: false,
      pinned: false,
      readingTime: 5,
      schemaType: "Article",
    },
  });

  const onSubmit = async (data: BlogFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/blog${initialData ? `/${initialData.id}` : ""}`, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      toast.success(initialData ? "Post updated successfully" : "Post created successfully");
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-8 flex gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/blog">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-cormorant font-bold">
            {initialData ? "Edit Article" : "New Article"}
          </h1>
          <div className="flex-1" />
          <Button type="submit" disabled={loading} className="rounded-full px-8 bg-slate-900">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Post"}
          </Button>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Article Details</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Title <span className="text-red-500">*</span></label>
              <Input {...form.register("title")} placeholder="How to Identify Original Tazos" className="h-12" onChange={(e) => {
                form.setValue('title', e.target.value);
                if (!initialData) {
                  form.setValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }
              }} />
              {form.formState.errors.title && <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Slug <span className="text-red-500">*</span></label>
              <Input {...form.register("slug")} placeholder="how-to-identify-original-tazos" className="h-12" />
              {form.formState.errors.slug && <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Short Excerpt</label>
            <Textarea {...form.register("excerpt")} placeholder="A brief summary for the blog cards..." className="h-24 resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Content <span className="text-red-500">*</span></label>
            <RichTextEditor 
              value={form.watch("content")} 
              onChange={(val) => form.setValue("content", val)} 
            />
            {form.formState.errors.content && <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Search Engine Optimization (SEO)</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SEO Title</label>
              <Input {...form.register("seoTitle")} placeholder="Default uses article title" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Focus Keyword</label>
              <Input {...form.register("focusKeyword")} placeholder="e.g. pokemon tazos india" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Meta Description</label>
            <Textarea {...form.register("seoDescription")} placeholder="Meta description for search engines (150-160 chars)" className="h-24" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Canonical URL</label>
              <Input {...form.register("canonicalUrl")} placeholder="https://nb57nostalgia.com/blog/..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Schema Type</label>
              <Select value={form.watch("schemaType")} onValueChange={(val) => form.setValue("schemaType", val as any)}>
                <SelectTrigger><SelectValue placeholder="Select schema..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Article">Article</SelectItem>
                  <SelectItem value="How-To">How-To</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Collection">Collection</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Settings */}
      <div className="w-[380px] shrink-0 space-y-6">
        
        {/* Publish Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-semibold border-b pb-2">Publish Settings</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={form.watch("status")} onValueChange={(val) => form.setValue("status", val as any)}>
              <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
            <Select value={form.watch("categoryId")} onValueChange={(val) => form.setValue("categoryId", val)}>
              <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Author</label>
            <Input {...form.register("author")} />
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={form.watch("featured")} 
                onCheckedChange={(checked) => form.setValue("featured", !!checked)} 
              />
              <label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Featured Article (Homepage)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pinned" 
                checked={form.watch("pinned")} 
                onCheckedChange={(checked) => form.setValue("pinned", !!checked)} 
              />
              <label htmlFor="pinned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Pinned to Top
              </label>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-semibold border-b pb-2">Featured Image</h3>
          <ImageUpload 
            value={form.watch("featuredImage") ? [form.watch("featuredImage")!] : []} 
            onChange={(urls) => form.setValue("featuredImage", urls[0] || "")}
            onRemove={(url) => form.setValue("featuredImage", "")}
          />
        </div>

        {/* Extra Options */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-semibold border-b pb-2">Display Options</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reading Time (mins)</label>
            <Input type="number" {...form.register("readingTime", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Estimated Difficulty</label>
            <Select value={form.watch("estimatedDifficulty")} onValueChange={(val) => form.setValue("estimatedDifficulty", val)}>
              <SelectTrigger><SelectValue placeholder="Beginner, Intermediate..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </form>
  );
}
