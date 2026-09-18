import { Book, Chapter, LibrarySettings } from '../types';

export const INITIAL_SETTINGS: LibrarySettings = {
  siteTitle: "Jaystarbliss's Library",
  siteDescription: "Digital publishing platform and personal literary archive for serialized novels and autobiographies by Jaystarbliss Studios.",
  authorName: "Jaystarbliss",
  publisherName: "Jaystarbliss Studios",
  defaultTimezone: "Africa/Lagos (WAT)",
  contactEmail: "johnrufai242@gmail.com",
  tagline: "Stories of Memory, Survival, and Unfiltered Truth",
  announcement: "Two Decades: New serialized chapters releasing on schedule. Read the authentic memoirs."
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-two-decades',
    slug: 'two-decades',
    title: 'TWO DECADES',
    tagline: '7305 DAYS OF LIVING ON AN EARTHLY DEFINITION OF HELL',
    author: 'JAYSTARBLISS STUDIOS',
    publisher: 'JAYSTARBLISS STUDIOS',
    description: `A raw, unflinching autobiographical account spanning twenty years—seven thousand, three hundred and five days—of survival, resilience, psychological battles, and existential discovery. From the vibrant and chaotic realities of Nigeria to personal wars against circumstance, trauma, and identity, TWO DECADES is an intimate chronicle of finding an unyielding anchor in a world set on burning everything down.`,
    coverUrl: '/cover-two-decades.svg',
    status: 'ongoing',
    visibility: 'published',
    isFeatured: true,
    genres: ['Autobiography', 'Memoir', 'Literary Non-Fiction', 'Psychological Drama', 'Coming of Age'],
    tags: ['Nigeria', 'Resilience', 'Survival', 'True Story', 'Identity', 'Family', 'Youth', 'Raw Memoir'],
    totalChapters: 15,
    publishedChapterCount: 14,
    latestChapterNumber: 14,
    latestChapterTitle: 'FIRST ALCOHOL',
    firstPublishedAt: '2026-08-01T08:00:00.000Z',
    lastUpdatedAt: '2026-09-18T10:00:00.000Z',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z'
  }
];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'two-decades-ch-1',
    bookId: 'book-two-decades',
    chapterNumber: 1,
    title: 'BACKSTORY',
    subtitle: 'The Roots and the Ground',
    content: `<p>To comprehend how twenty years can feel like an eternity measured in sheer endurance, one must first return to the origin. Memory has a curious way of stripping away extraneous details, leaving only the sharpest edges—the smells of early morning air, the stifling silence before a storm, and the realization that nothing in this existence would ever be handed over without a price.</p>
<p>Every person is handed a starting hand in life. Mine was dealt on soil where resilience is not an admirable virtue, but the baseline requirement for taking your next breath. The foundation of who I became was cast in those earliest reckonings with reality.</p>
<p>There was no instruction manual for surviving what lay ahead. There was only the quiet, stubborn refusal to fold before the cards had even finished being dealt.</p>`,
    authorsThoughts: `When I sat down to write TWO DECADES, this was the hardest section to begin. Looking back at twenty years (7,305 days) requires stepping back into shoes you spent a lifetime trying to outgrow. This chapter establishes the emotional baseline of the journey.`,
    status: 'published',
    publishedAt: '2026-08-01T08:00:00.000Z',
    wordCount: 840,
    readingTimeMinutes: 4,
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-2',
    bookId: 'book-two-decades',
    chapterNumber: 2,
    title: 'NIGERIA',
    subtitle: 'The Crucible of the Giant',
    content: `<p>Nigeria does not merely exist as a geography; it operates as an overwhelming force of nature. It breathes with intense heat, unforgiving red dust, sudden torrential downpours that flood streets in minutes, and an electricity grid that tests the patience of saints.</p>
<p>Growing up here teaches you a specific kind of situational alertness. You learn to listen to the pitch of voices down the street, to recognize the subtle shift in neighborhood tension before trouble erupts, and to find quiet dignity even when the world around you is operating on pure unpredictability.</p>
<p>It gave me my edge. It hardened every soft inclination before the world could exploit it.</p>`,
    authorsThoughts: `Writing about Nigeria from the inside means balancing love for the land and the undeniable brutality of its challenges. You cannot understand my psychological makeup without understanding the environment that molded it.`,
    status: 'published',
    publishedAt: '2026-08-04T08:00:00.000Z',
    wordCount: 920,
    readingTimeMinutes: 5,
    createdAt: '2026-08-04T08:00:00.000Z',
    updatedAt: '2026-08-04T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-3',
    bookId: 'book-two-decades',
    chapterNumber: 3,
    title: 'FIGHT!',
    subtitle: 'When Words Run Out',
    content: `<p>There comes a moment when negotiations end, posturing dissolves, and physical reality asserts itself with violent clarity. It wasn't something sought out, but when backed against a concrete wall, running is no longer on the table.</p>
<p>The first blow is always a shock to the senses—not because of the pain, which adrenaline temporarily drowns, but because of the sudden narrowing of the entire universe down to knuckles, breath, and the determination not to be the one lying in the dirt.</p>`,
    authorsThoughts: `Violence in real life is never cinematic or glamorous. It is awkward, terrifying, and exhausting. This chapter is about learning where your breaking point lies.`,
    status: 'published',
    publishedAt: '2026-08-08T08:00:00.000Z',
    wordCount: 780,
    readingTimeMinutes: 4,
    createdAt: '2026-08-08T08:00:00.000Z',
    updatedAt: '2026-08-08T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-4',
    bookId: 'book-two-decades',
    chapterNumber: 4,
    title: 'MIND ANCHOR',
    subtitle: 'Holding Fast in the Storm',
    content: `<p>When the storm outside refuses to let up, your only survival lies in dropping an anchor inside your own mind. You choose a truth that cannot be taken from you: that no matter how severe the pressure, your consciousness remains your own sovereign territory.</p>
<p>This was the internal mechanism I built during those darkest stretches. A mental fortress where exterior noise couldn't penetrate.</p>`,
    authorsThoughts: `The concept of the 'Mind Anchor' became my philosophy for the next decade. If you cannot master the storm within your own skull, the world outside will easily tear you to shreds.`,
    status: 'published',
    publishedAt: '2026-08-12T08:00:00.000Z',
    wordCount: 860,
    readingTimeMinutes: 4,
    createdAt: '2026-08-12T08:00:00.000Z',
    updatedAt: '2026-08-12T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-5',
    bookId: 'book-two-decades',
    chapterNumber: 5,
    title: 'TREASURES?',
    subtitle: 'The Illusion of Value',
    content: `<p>What constitutes a treasure when basic security is a luxury? You find yourself assigning immense value to the smallest artefacts—a worn notebook, a single working pen, a cassette tape with a handwritten label, or a rare moment of undisturbed quiet.</p>
<p>The question mark in the title is deliberate. Much of what people chased around me turned out to be fool's gold.</p>`,
    authorsThoughts: `A reflection on materialism versus what actually kept my spirit alive during those years.`,
    status: 'published',
    publishedAt: '2026-08-16T08:00:00.000Z',
    wordCount: 710,
    readingTimeMinutes: 3,
    createdAt: '2026-08-16T08:00:00.000Z',
    updatedAt: '2026-08-16T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-6',
    bookId: 'book-two-decades',
    chapterNumber: 6,
    title: 'FIRST SCAR',
    subtitle: 'Marks that Never Fade',
    content: `<p>The skin heals, but it never forgets. The first visible mark of consequence stayed etched into flesh as an indelible reminder of a mistake, a boundary crossed, and a lesson paid for in blood.</p>
<p>Looking at that mark today is like reading a timestamp from a former lifetime.</p>`,
    authorsThoughts: `Scars are maps of the battles you survived. I remember every second of the day this one was earned.`,
    status: 'published',
    publishedAt: '2026-08-20T08:00:00.000Z',
    wordCount: 690,
    readingTimeMinutes: 3,
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-7',
    bookId: 'book-two-decades',
    chapterNumber: 7,
    title: 'QUEEN',
    subtitle: 'The Pillar of Grace',
    content: `<p>In the midst of hardship, there are individuals whose presence anchors an entire household. A maternal force of poise, sacrifice, and fierce protection who carried burdens too heavy for any single human to bear, yet carried them without complaint.</p>
<p>This chapter is dedicated to the unwavering standard of dignity she embodied.</p>`,
    authorsThoughts: `A deeply personal chapter. Her sacrifice made my survival possible.`,
    status: 'published',
    publishedAt: '2026-08-24T08:00:00.000Z',
    wordCount: 950,
    readingTimeMinutes: 5,
    createdAt: '2026-08-24T08:00:00.000Z',
    updatedAt: '2026-08-24T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-8',
    bookId: 'book-two-decades',
    chapterNumber: 8,
    title: 'WHEN LIFE STRIKES',
    subtitle: 'The Sudden Blindside',
    content: `<p>Disaster does not knock on the door or announce its arrival with warning sirens. It arrives on an ordinary Tuesday morning while you are thinking about trivial routines. And in ten seconds, the trajectory of your world changes forever.</p>
<p>The news came like a thunderclap without rain.</p>`,
    authorsThoughts: `This turning point shifted the memoir into its second act. The days that followed were pure survival mode.`,
    status: 'published',
    publishedAt: '2026-08-28T08:00:00.000Z',
    wordCount: 880,
    readingTimeMinutes: 4,
    createdAt: '2026-08-28T08:00:00.000Z',
    updatedAt: '2026-08-28T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-9',
    bookId: 'book-two-decades',
    chapterNumber: 9,
    title: 'THE SEED OF HATRED',
    subtitle: 'Dark Poison in the Soil',
    content: `<p>Bitterness is easy to grow; it requires almost no encouragement. Watching hypocrisy flourish while innocence was trampled planted something dark and thorny in my chest. It took years to understand that nursing resentment is drinking poison and expecting the other person to die.</p>`,
    authorsThoughts: `Honesty in memoir demands acknowledging the ugly emotions too. I carried this seed for a long time before I found the courage to uproot it.`,
    status: 'published',
    publishedAt: '2026-09-01T08:00:00.000Z',
    wordCount: 830,
    readingTimeMinutes: 4,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-10',
    bookId: 'book-two-decades',
    chapterNumber: 10,
    title: "UNICORN'S HORN",
    subtitle: 'Chasing the Impossible Miracle',
    content: `<p>We were promised a breakthrough—an opportunity so pristine and miraculous it felt mythical, like a unicorn's horn. In desperation, people will believe almost anything that sounds like salvation. But miracles built on deception always crumble under their own weight.</p>`,
    authorsThoughts: `The lessons of youth are often taught through false promises. This was one of the steepest learning curves of my teenage years.`,
    status: 'published',
    publishedAt: '2026-09-05T08:00:00.000Z',
    wordCount: 790,
    readingTimeMinutes: 4,
    createdAt: '2026-09-05T08:00:00.000Z',
    updatedAt: '2026-09-05T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-11',
    bookId: 'book-two-decades',
    chapterNumber: 11,
    title: 'FIRST KISS',
    subtitle: 'Fleeting Tenderness in a Harsh World',
    content: `<p>Amidst unrelenting battles, a sudden moment of genuine human softness feels almost unnatural. It happened in the quiet shadow between buildings, away from prying eyes. Awkward, heart hammering at two hundred beats a minute, and for the first time, the world felt like it could hold something gentle.</p>`,
    authorsThoughts: `Even in an earthly definition of hell, life finds small ways to assert wonder. A reminder of youth before complete cynicism set in.`,
    status: 'published',
    publishedAt: '2026-09-09T08:00:00.000Z',
    wordCount: 740,
    readingTimeMinutes: 3,
    createdAt: '2026-09-09T08:00:00.000Z',
    updatedAt: '2026-09-09T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-12',
    bookId: 'book-two-decades',
    chapterNumber: 12,
    title: 'A CLOSE SHAVE',
    subtitle: 'Seconds from Oblivion',
    content: `<p>There are instances where survival comes down to centimeters and micro-seconds. A screech of tires, a sudden gust of wind, or a stray brick falling from scaffolding. You stand there afterward, looking at where you would have been standing had you taken one more step forward.</p>`,
    authorsThoughts: `I still get chills thinking about how close that afternoon came to ending the entire story right then and there.`,
    status: 'published',
    publishedAt: '2026-09-12T08:00:00.000Z',
    wordCount: 810,
    readingTimeMinutes: 4,
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-12T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-13',
    bookId: 'book-two-decades',
    chapterNumber: 13,
    title: 'FIRST HARASSMENT',
    subtitle: 'The Injustice of Power',
    content: `<p>Authority without accountability produces casual cruelty. The first time someone in uniform or a position of petty power decided to demonstrate their dominance over me, I learned how defenseless a young person is without backing or wealth. The humiliation burned hotter than any punch.</p>`,
    authorsThoughts: `A systemic reality familiar to many who came of age where power answers to no one. It permanently shaped my view of justice.`,
    status: 'published',
    publishedAt: '2026-09-15T08:00:00.000Z',
    wordCount: 870,
    readingTimeMinutes: 4,
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-14',
    bookId: 'book-two-decades',
    chapterNumber: 14,
    title: 'FIRST ALCOHOL',
    subtitle: 'Numbing the Edges',
    content: `<p>The burning liquid traveled down the throat, sharp and bitter, followed by a warm bloom behind the ribs. For thirty minutes, the constant clatter of anxiety quieted down. But the illusion was brief, and morning brought a headache that matched the weight of reality.</p>`,
    authorsThoughts: `Trying to outrun reality through substances is a well-worn trap. This chapter explores the dangerous appeal of false relief.`,
    status: 'published',
    publishedAt: '2026-09-18T08:00:00.000Z',
    wordCount: 760,
    readingTimeMinutes: 4,
    createdAt: '2026-09-18T08:00:00.000Z',
    updatedAt: '2026-09-18T08:00:00.000Z'
  },
  {
    id: 'two-decades-ch-15',
    bookId: 'book-two-decades',
    chapterNumber: 15,
    title: 'FIRST RUBBISH',
    subtitle: 'Discarded and Defiant',
    content: `<p>To be treated as disposable—as mere rubbish on the side of someone else's road—is a profound test of self-worth. When the people you trusted relegate you to the scrap heap, you are left with a fundamental decision: accept their evaluation or build an identity so solid it breaks their teeth.</p>
<p>I chose defiance.</p>`,
    authorsThoughts: `This chapter marks a major threshold in the memoir. The transition from helpless victim of circumstance to active author of my own destiny. Scheduled for the upcoming daily release.`,
    status: 'scheduled',
    scheduledFor: '2026-09-19T08:00:00.000Z',
    wordCount: 890,
    readingTimeMinutes: 5,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z'
  }
];
