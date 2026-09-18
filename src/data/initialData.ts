import { Book, Chapter, LibrarySettings } from '../types';

export const INITIAL_SETTINGS: LibrarySettings = {
  siteTitle: "Library X",
  siteDescription: "Digital publishing platform and personal literary archive for serialized novels, memoirs, and original works.",
  authorName: "Jaystarbliss",
  publisherName: "Jaystarbliss Studios",
  defaultTimezone: "Africa/Lagos (WAT)",
  contactEmail: "johnrufai242@gmail.com",
  tagline: "Original Stories, Memoirs, and Serialized Works",
  announcement: "Welcome to Library X. New serialized releases appear here directly from the author."
};

// Wireframe state: All content is loaded dynamically from Firestore or created in the Author Studio.
// No hard-coded books or chapters exist.
export const INITIAL_BOOKS: Book[] = [];

export const INITIAL_CHAPTERS: Chapter[] = [];
