import { ReadingProgress } from '../types';
import { saveReadingProgressToFirestore } from './firebase';

const STORAGE_KEY = 'jsb_reading_progress';

function readLocalProgress(): ReadingProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingProgress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Could not read local reading progress:', error);
    return [];
  }
}

function writeLocalProgress(progress: ReadingProgress[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('jsb_library_updated', {
      detail: { key: STORAGE_KEY }
    }));
  } catch (error) {
    console.warn('Could not persist merged reading progress locally:', error);
  }
}

function timestamp(value?: string): number {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Merge progress by book, not by document id.
 *
 * The old synchronization path merged by `id` and allowed the cloud copy to
 * overwrite a newer local chapter. That is exactly how a reader could reach
 * Chapter 20 and later see Resume Chapter 2 again. The newest lastReadAt for a
 * book is now authoritative, regardless of whether it came from local storage
 * or Firestore.
 */
export async function syncAndMergeReadingProgress(
  userId: string,
  cloudProgress: ReadingProgress[] = [],
  legacyLocalUserId = 'library-x-reader'
): Promise<ReadingProgress[]> {
  const local = readLocalProgress();

  // If a reader used the library before Google sign-in, carry that local history
  // into the authenticated account instead of abandoning it under the guest id.
  const migrated = local.map((record) =>
    record.userId === legacyLocalUserId && userId !== legacyLocalUserId
      ? { ...record, userId }
      : record
  );

  const localForUser = migrated.filter((record) => record.userId === userId);
  const otherUsers = migrated.filter((record) => record.userId !== userId);

  const byBook = new Map<string, ReadingProgress>();

  for (const record of localForUser) {
    const existing = byBook.get(record.bookId);
    if (!existing || timestamp(record.lastReadAt) >= timestamp(existing.lastReadAt)) {
      byBook.set(record.bookId, record);
    }
  }

  for (const record of cloudProgress.filter((item) => item.userId === userId)) {
    const existing = byBook.get(record.bookId);
    // Cloud data is allowed to win only when it is genuinely newer.
    if (!existing || timestamp(record.lastReadAt) > timestamp(existing.lastReadAt)) {
      byBook.set(record.bookId, record);
    }
  }

  const merged = [...byBook.values()];
  writeLocalProgress([...otherUsers, ...merged]);

  // Persist a migrated/newer local record back to Firestore. This repairs the
  // common case where the browser has the correct chapter but the cloud still
  // contains an older chapter.
  const cloudByBook = new Map(
    cloudProgress
      .filter((item) => item.userId === userId)
      .map((item) => [item.bookId, item])
  );

  for (const record of merged) {
    const cloudRecord = cloudByBook.get(record.bookId);
    if (!cloudRecord || timestamp(record.lastReadAt) > timestamp(cloudRecord.lastReadAt)) {
      try {
        await saveReadingProgressToFirestore(record);
      } catch (error) {
        console.warn('Could not repair cloud reading progress for', record.bookId, error);
      }
    }
  }

  return merged.sort((a, b) => timestamp(b.lastReadAt) - timestamp(a.lastReadAt));
}
