import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

async function main() {
  console.log('Reading CSV...');
  const csvFilePath = path.join(process.cwd(), 'NB57_Blog_Seed_Content.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  console.log('Parsing CSV...');
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const allCategories = await prisma.blogCategory.findMany();

  console.log(`Found ${parsed.data.length} articles to import.`);

  for (const row of parsed.data as any[]) {
    if (!row.Title || !row.Slug) continue;

    const categorySlug = row.Category?.trim().toLowerCase() || 'pokemon';
    let category = allCategories.find((c: any) => c.slug === categorySlug);
    
    // Fallback if category doesn't exist
    if (!category) {
      category = allCategories[0];
    }

    const readingTimeStr = row['Reading Time'] || '5';
    // Extract first number from "8-12 min"
    const readingTimeMatch = readingTimeStr.match(/\d+/);
    const readingTime = readingTimeMatch ? parseInt(readingTimeMatch[0], 10) : 5;

    // Convert markdown to basic HTML for Tiptap
    let content = row['Body (Markdown)'] || '';
    
    // Very basic Markdown to HTML conversion for the seeder
    // In production we would use marked or similar, but for seeder this is fine
    const htmlContent = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
      .replace(/\*(.*)\*/gim, '<i>$1</i>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
      .replace(/\n$/gim, '<br />')
      .replace(/\n/g, '<br />');

    const excerptMatch = content.match(/## Introduction\n([\s\S]*?)\n/);
    const excerpt = excerptMatch ? excerptMatch[1].substring(0, 160) : row['Meta Description'];

    try {
      await prisma.blogPost.upsert({
        where: { slug: row.Slug },
        update: {
          title: row.Title,
          categoryId: category.id,
          status: 'Published',
          seoTitle: row['SEO Title'],
          seoDescription: row['Meta Description'],
          focusKeyword: row['Focus Keyword'],
          readingTime: readingTime,
          content: htmlContent,
          excerpt: excerpt,
          featuredImage: row['Featured Image'] === 'cloudinary-placeholder' ? null : row['Featured Image'],
          publishedAt: new Date()
        },
        create: {
          title: row.Title,
          slug: row.Slug,
          categoryId: category.id,
          status: 'Published',
          seoTitle: row['SEO Title'],
          seoDescription: row['Meta Description'],
          focusKeyword: row['Focus Keyword'],
          readingTime: readingTime,
          content: htmlContent,
          excerpt: excerpt,
          featuredImage: row['Featured Image'] === 'cloudinary-placeholder' ? null : row['Featured Image'],
          author: "NB57's Nostalgia",
          schemaType: 'Article',
          publishedAt: new Date()
        }
      });
      console.log(`✅ Imported: ${row.Title}`);
    } catch (e: any) {
      console.error(`❌ Failed to import: ${row.Title}`, e.message);
    }
  }

  console.log('CSV Import Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
