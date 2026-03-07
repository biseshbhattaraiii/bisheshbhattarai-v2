'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getTimeBasedGreeting } from '@/lib/greeting';

export function HeroScene() {
  const [greeting, setGreeting] = useState('Hello');
  const [aiNews, setAiNews] = useState('Loading AI news...');
  const [isDaytime, setIsDaytime] = useState(true);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());

    // Determine if it's daytime (6 AM - 6 PM)
    const hour = new Date().getHours();
    setIsDaytime(hour >= 6 && hour < 18);

    // Fetch random AI news
    const fetchAINews = async () => {
      try {
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await response.json();

        // Get a random story from top 30
        const randomId = storyIds[Math.floor(Math.random() * 30)];
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${randomId}.json`);
        const story = await storyResponse.json();

        // Filter for AI-related stories or just show any tech news
        if (story && story.title) {
          setAiNews(story.title);
        } else {
          setAiNews('Stay curious, keep building.');
        }
      } catch (error) {
        setAiNews('Stay curious, keep building.');
      }
    };

    fetchAINews();
  }, []);

  return (
    <div className="relative h-[400px] overflow-hidden">
      {/* Sky elements - Sun or Moon with Stars */}
      {isDaytime ? (
        // Sun
        <motion.div
          className="absolute top-8 right-16"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" className="fill-accent/60" />
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x1 = 12 + Math.cos(angle) * 7;
              const y1 = 12 + Math.sin(angle) * 7;
              const x2 = 12 + Math.cos(angle) * 9;
              const y2 = 12 + Math.sin(angle) * 9;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-accent/60"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
        </motion.div>
      ) : (
        <>
          {/* Moon */}
          <motion.div
            className="absolute top-8 right-16"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                className="fill-primary/40"
              />
            </svg>
          </motion.div>

          {/* Stars */}
          {[
            { x: 15, y: 10, delay: 0.5, size: 2 },
            { x: 25, y: 15, delay: 0.7, size: 1.5 },
            { x: 80, y: 12, delay: 0.9, size: 2 },
            { x: 85, y: 20, delay: 1.1, size: 1.5 },
            { x: 70, y: 8, delay: 1.3, size: 1.8 },
            { x: 90, y: 18, delay: 1.5, size: 1.6 },
          ].map((star, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.6, 1],
                scale: [0, 1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                delay: star.delay,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            >
              <svg width={star.size * 8} height={star.size * 8} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z"
                  className="fill-primary/50"
                />
              </svg>
            </motion.div>
          ))}
        </>
      )}

      {/* Ocean waves (background layer) */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-32"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"
          className="fill-primary/10"
          initial={{ d: "M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" }}
          animate={{
            d: [
              "M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z",
              "M0,65 Q150,50 300,65 T600,65 T900,65 T1200,65 L1200,120 L0,120 Z",
              "M0,60 Q150,80 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Beach/sand */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-accent/5" />

      {/* Mountains (background) */}
      <svg
        className="absolute bottom-16 left-0 right-0 h-48"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,200 L200,100 L400,140 L600,80 L800,120 L1000,60 L1200,200 Z"
          className="fill-secondary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        />
      </svg>

      {/* Trees scattered */}
      {[
        { x: 10, y: 55, delay: 0.2 },
        { x: 25, y: 60, delay: 0.4 },
        { x: 70, y: 58, delay: 0.6 },
        { x: 85, y: 62, delay: 0.8 },
      ].map((tree, i) => (
        <motion.svg
          key={i}
          className="absolute"
          style={{ left: `${tree.x}%`, bottom: `${tree.y}%` }}
          width="24"
          height="32"
          viewBox="0 0 24 24"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.6, delay: tree.delay }}
        >
          <path
            d="M12 2L8 8H10V14H8L12 22L16 14H14V8H16L12 2Z"
            className="fill-accent/40"
          />
        </motion.svg>
      ))}

      {/* Books stacked */}
      <motion.div
        className="absolute left-[5%] bottom-[25%]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.5, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <svg width="40" height="48" viewBox="0 0 40 48">
          <rect x="4" y="32" width="32" height="4" className="fill-primary/60" rx="1" />
          <rect x="6" y="26" width="28" height="4" className="fill-accent/60" rx="1" />
          <rect x="8" y="20" width="24" height="4" className="fill-secondary/60" rx="1" />
        </svg>
      </motion.div>

      {/* Main text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="text-6xl md:text-8xl font-bold font-display mb-4"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--accent)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {greeting}
          </motion.div>

          {/* AI News */}
          <motion.p
            className="text-sm md:text-base text-secondary max-w-2xl mx-auto px-4 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {aiNews}
          </motion.p>
        </motion.div>
      </div>

      {/* Walking person icon */}
      <motion.div
        className="absolute"
        initial={{ x: 150, y: 150 }}
        animate={{
          x: [150, 250],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="4" r="2" className="fill-accent" />
          <path
            d="M11 7V9L9 10V14L11 15V19L9 21H11L13 19V15L15 14V10L13 9V7H11Z"
            className="fill-accent"
          />
        </svg>
      </motion.div>

      {/* Decorative elements - small dots representing movement */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
          style={{
            left: `${20 + i * 12}%`,
            top: `${25 + (i % 2) * 15}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
