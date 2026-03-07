import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

interface FileReadResult {
  content: string;
  data: Record<string, unknown>;
}

export async function readMdxFile(
  filePath: string
): Promise<FileReadResult | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const { content, data } = matter(fileContent);
    return { content, data };
  } catch {
    return null;
  }
}

export async function getMdxFiles(directory: string): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    return files.filter((file) => file.endsWith('.mdx'));
  } catch {
    return [];
  }
}

export function getContentPath(...segments: string[]): string {
  return path.join(process.cwd(), 'content', ...segments);
}

export function extractSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx$/, '');
}
