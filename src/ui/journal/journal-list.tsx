'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { Post, PostCategory } from '@/domain/types';
import { Container, Card, Tag } from '@/ui/common';

interface JournalListProps {
  posts: Post[];
}

const categories: PostCategory[] = ['life', 'coding', 'travel', 'fitness'];

export function JournalList({ posts }: JournalListProps) {
  const [filter, setFilter] = useState<PostCategory | 'all'>('all');

  const filteredPosts =
    filter === 'all' ? posts : posts.filter((p) => p.category === filter);

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-5xl font-bold font-display mb-6">Journal</h1>
        <p className="text-xl text-secondary mb-12">
          Thoughts, learnings, and experiments
        </p>

        <div className="flex gap-3 mb-12 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={
              filter === 'all'
                ? 'px-4 py-2 rounded-full bg-primary text-background'
                : 'px-4 py-2 rounded-full bg-muted text-foreground hover:bg-secondary transition-colors'
            }
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={
                filter === cat
                  ? 'px-4 py-2 rounded-full bg-primary text-background'
                  : 'px-4 py-2 rounded-full bg-muted text-foreground hover:bg-secondary transition-colors'
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.slug} href={`/journal/${post.slug}`}>
              <div className="mb-3">
                <Tag>{post.category}</Tag>
              </div>
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-secondary mb-4">{post.description}</p>
              <div className="flex items-center justify-between text-sm text-secondary">
                <time>{format(new Date(post.date), 'MMM d, yyyy')}</time>
                {post.readingTime && <span>{post.readingTime} min read</span>}
              </div>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <p className="text-center text-secondary py-12">
            No posts found in this category yet.
          </p>
        )}
      </div>
    </Container>
  );
}
