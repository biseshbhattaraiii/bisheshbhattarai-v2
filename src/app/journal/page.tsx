import { contentRepository } from '@/adapters/content';
import { JournalList } from '@/ui/journal/journal-list';

export default async function JournalPage() {
  const posts = await contentRepository.getAllPosts();

  return <JournalList posts={posts} />;
}
