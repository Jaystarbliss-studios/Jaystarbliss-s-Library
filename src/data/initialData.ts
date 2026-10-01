import { Book, Chapter, LibrarySettings } from '../types';

export const INITIAL_SETTINGS: LibrarySettings = {
  siteTitle: "Jaystarbliss Library",
  siteDescription: "Digital publishing platform and personal literary archive for serialized novels, memoirs, and original works.",
  authorName: "Jaystarbliss",
  publisherName: "Jaystarbliss Studios",
  defaultTimezone: "Africa/Lagos (WAT)",
  contactEmail: "johnrufai242@gmail.com",
  tagline: "Good books. Greater minds.",
  announcement: "Welcome to Jaystarbliss Library. Explore serialized stories, track your reading, and unlock new releases."
};

// Curated default books representing the Jaystarbliss literary collection
export const INITIAL_BOOKS: Book[] = [
  {
    id: "book-whisper-shadows",
    slug: "the-whisper-of-shadows",
    title: "The Whisper of Shadows",
    tagline: "When a forgotten secret resurfaces, courage becomes the ultimate weapon.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "When a forgotten secret resurfaces, a young man finds himself at the center of a dangerous game that could change the fate of his world. The Whisper of Shadows is a gripping tale of courage, betrayal, and the power of truth.",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    visibility: "published",
    isFeatured: true,
    genres: ["Fantasy", "Mystery", "Adventure"],
    tags: ["Epic", "Dark Magic", "Destiny", "Sovereign"],
    totalChapters: 32,
    publishedChapterCount: 20,
    scheduledChapterCount: 0,
    latestChapterNumber: 20,
    latestChapterTitle: "The Sovereign Chamber",
    firstPublishedAt: "2024-01-15T00:00:00.000Z",
    lastUpdatedAt: "2026-09-28T12:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2026-09-28T12:00:00.000Z"
  },
  {
    id: "book-echoes-tomorrow",
    slug: "echoes-of-tomorrow",
    title: "Echoes of Tomorrow",
    tagline: "Echoes from the future rewrite the present in unexpected ways.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "A subterranean expedition into the forgotten ruins of a lost civilization uncovers relics that broadcast signals across time, challenging everything humanity thought it knew about its destiny.",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    visibility: "published",
    isFeatured: true,
    genres: ["Sci-Fi", "Thriller", "Adventure"],
    tags: ["Time Anomaly", "Exploration", "Sci-Fi"],
    totalChapters: 24,
    publishedChapterCount: 16,
    scheduledChapterCount: 0,
    latestChapterNumber: 16,
    latestChapterTitle: "Temporal Resonances",
    firstPublishedAt: "2024-03-10T00:00:00.000Z",
    lastUpdatedAt: "2026-09-22T08:00:00.000Z",
    createdAt: "2024-03-10T00:00:00.000Z",
    updatedAt: "2026-09-22T08:00:00.000Z"
  },
  {
    id: "book-last-chapter",
    slug: "the-last-chapter",
    title: "The Last Chapter",
    tagline: "An archivist uncovers a manuscript whose final page predicts tomorrow's tragedy.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "In an ancient mountain library, an isolated archivist finds an uncatalogued tome written in an unknown hand. As each chapter is deciphered, real-world events unfold with terrifying precision.",
    coverUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    visibility: "published",
    isFeatured: false,
    genres: ["Mystery", "Thriller"],
    tags: ["Occult", "Archive", "Suspense"],
    totalChapters: 18,
    publishedChapterCount: 14,
    scheduledChapterCount: 0,
    latestChapterNumber: 14,
    latestChapterTitle: "Ink and Prophecy",
    firstPublishedAt: "2024-05-01T00:00:00.000Z",
    lastUpdatedAt: "2026-09-18T10:00:00.000Z",
    createdAt: "2024-05-01T00:00:00.000Z",
    updatedAt: "2026-09-18T10:00:00.000Z"
  },
  {
    id: "book-beyond-horizon",
    slug: "beyond-the-horizon",
    title: "Beyond the Horizon",
    tagline: "The uncharted seas hold secrets that the old world forgot.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "A navigator exiled from the sovereign capital sets sail beyond the mapped boundaries of the known world, discovering floating archipelagoes and mythical maritime sanctuaries.",
    coverUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    visibility: "published",
    isFeatured: true,
    genres: ["Adventure", "Fantasy"],
    tags: ["Voyage", "Uncharted", "Freedom"],
    totalChapters: 28,
    publishedChapterCount: 18,
    scheduledChapterCount: 0,
    latestChapterNumber: 18,
    latestChapterTitle: "The Isle of Amber Mists",
    firstPublishedAt: "2024-06-12T00:00:00.000Z",
    lastUpdatedAt: "2026-09-25T14:30:00.000Z",
    createdAt: "2024-06-12T00:00:00.000Z",
    updatedAt: "2026-09-25T14:30:00.000Z"
  },
  {
    id: "book-strangers-promise",
    slug: "a-strangers-promise",
    title: "A Stranger's Promise",
    tagline: "A pact made under the veil of night changes two lives forever.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "Amidst a bustling metropolis draped in autumn rain, an unexpected encounter leads to a quiet covenant that tests loyalty, past regrets, and the courage to begin anew.",
    coverUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?q=80&w=800&auto=format&fit=crop",
    status: "ongoing",
    visibility: "published",
    isFeatured: false,
    genres: ["Romance", "Drama"],
    tags: ["Urban", "Introspective", "Autumn"],
    totalChapters: 20,
    publishedChapterCount: 12,
    scheduledChapterCount: 0,
    latestChapterNumber: 12,
    latestChapterTitle: "Quiet Reflections",
    firstPublishedAt: "2024-07-20T00:00:00.000Z",
    lastUpdatedAt: "2026-09-15T09:15:00.000Z",
    createdAt: "2024-07-20T00:00:00.000Z",
    updatedAt: "2026-09-15T09:15:00.000Z"
  },
  {
    id: "book-silent-valley",
    slug: "the-silent-valley",
    title: "The Silent Valley",
    tagline: "In the quietest place on earth, the loudest truths are whispered.",
    author: "Jaystarbliss",
    publisher: "Jaystarbliss Studios",
    description: "Tucked behind impassable ridgelines lies an untouched valley where sound behaves in impossible ways. A weary traveler seeks solace there, only to realize silence has its own voice.",
    coverUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    status: "completed",
    visibility: "published",
    isFeatured: false,
    genres: ["Thriller", "Mystery"],
    tags: ["Sanctuary", "Puzzling", "Atmospheric"],
    totalChapters: 15,
    publishedChapterCount: 15,
    scheduledChapterCount: 0,
    latestChapterNumber: 15,
    latestChapterTitle: "The Final Echo",
    firstPublishedAt: "2024-02-01T00:00:00.000Z",
    lastUpdatedAt: "2024-08-30T17:00:00.000Z",
    createdAt: "2024-02-01T00:00:00.000Z",
    updatedAt: "2024-08-30T17:00:00.000Z"
  }
];

// Generate chapter records for demo books with public chapters 1-10 and locked chapters 11+
function generateDemoChapters(book: Book): Chapter[] {
  const chapterTitles = [
    "The Arrival", "The Hidden Truth", "A New Path", "The Warning", "The Chase",
    "Whispers in the Mist", "The Ancient Seal", "Echoes of the Past", "Crossroads", "The Threshold",
    "Shadows Gather", "The Silent Pact", "Veil of Illusions", "Nightfall at the Gates", "The Relic's Glow",
    "Fractured Memories", "The Hidden Chamber", "The Sovereign Trial", "A Spark in the Abyss", "The Sovereign Chamber",
    "Awakening", "The Forgotten Sky", "Tides of Destiny", "The Final Horizon"
  ];

  const chapters: Chapter[] = [];
  const count = book.publishedChapterCount;

  for (let i = 1; i <= count; i++) {
    const title = chapterTitles[i - 1] || `Chapter ${i}`;
    const wordCount = 3800 + (i * 120);
    const readingTimeMinutes = Math.ceil(wordCount / 220);
    
    const sampleBody = `
      <p>The wind howled through the narrow mountain pass, carrying with it the scent of fresh rain and ancient stone. He tightened his cloak against the biting chill, looking out across the expanse that lay bathed in twilight.</p>
      <p>For weeks the journey had been quiet—almost deceptive in its stillness. But the relics in his pack had begun to vibrate with a faint, rhythmic pulse, resonating with the subterranean veins running deep below the earth.</p>
      <p>"There is no turning back now," he whispered to the gathering dusk. The path ahead carved through the jagged stone toward the fortress towers whose silhouette cut into the violet sky.</p>
      <p>Every step brought memories of the oath he had taken in the sovereign halls of Jaystarbliss. They had warned him that the truth would demand sacrifice, yet here he stood, on the precipice of understanding.</p>
      <p>As the first stars pierced through the heavy clouds, a sudden rustle echoed from the tree line. Shadows lengthened, blending with the mist that rose from the damp earth like quiet specters of the past.</p>
    `;

    chapters.push({
      id: `ch-${book.id}-${i}`,
      bookId: book.id,
      chapterNumber: i,
      title: title,
      subtitle: i <= 10 ? "Public Chapter" : "Exclusive Serialized Chapter",
      content: sampleBody,
      teaserContent: sampleBody,
      authorsThoughts: i === 1 ? "Welcome to the beginning of this journey. Thank you for reading." : undefined,
      status: "published",
      wordCount: wordCount,
      readingTimeMinutes: readingTimeMinutes,
      createdAt: new Date(Date.now() - (count - i) * 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 86400000 * 3).toISOString()
    });
  }

  return chapters;
}

export const INITIAL_CHAPTERS: Chapter[] = INITIAL_BOOKS.flatMap(generateDemoChapters);
