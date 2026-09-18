import React, { useState } from 'react';
import { Book, Chapter } from '../types';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Edit,
  Trash2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface AdminScheduledViewProps {
  books: Book[];
  chapters: Chapter[];
  onEditChapter: (chapterId: string) => void;
  onPublishNow: (chapterId: string) => void;
  onCancelSchedule: (chapterId: string) => void;
  onRunAutoPublishCheck: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AdminScheduledView: React.FC<AdminScheduledViewProps> = ({
  books,
  chapters,
  onEditChapter,
  onPublishNow,
  onCancelSchedule,
  onRunAutoPublishCheck,
  onShowToast
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'publish' | 'cancel' | null>(null);

  const bookMap = new Map(books.map((b) => [b.id, b]));

  const scheduledChapters = chapters
    .filter((c) => c.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime());

  const handleActionClick = (chapterId: string, action: 'publish' | 'cancel') => {
    setSelectedChapterId(chapterId);
    setModalAction(action);
  };

  const handleConfirmModal = () => {
    if (!selectedChapterId) return;

    if (modalAction === 'publish') {
      onPublishNow(selectedChapterId);
      onShowToast('Chapter published immediately to public readers', 'success');
    } else if (modalAction === 'cancel') {
      onCancelSchedule(selectedChapterId);
      onShowToast('Release schedule canceled; chapter returned to draft status', 'info');
    }

    setSelectedChapterId(null);
    setModalAction(null);
  };

  const targetChapter = scheduledChapters.find((c) => c.id === selectedChapterId);

  return (
    <div className="p-6 sm:p-10 space-y-8 font-calibri text-zinc-100 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide uppercase">
              SCHEDULED DAILY CHAPTER RELEASES
            </h1>
          </div>
          <p className="font-mono-space text-xs text-zinc-400">
            TIMEZONE: WEST AFRICA TIME (WAT / UTC+1) • AUTONOMOUS CRON & EVALUATION ENGINE
          </p>
        </div>

        <button
          onClick={onRunAutoPublishCheck}
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>EVALUATE QUEUE NOW</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="p-5 bg-[#141418] border border-amber-900/60 rounded-sm flex items-start gap-4 shadow-sm">
        <div className="w-9 h-9 rounded-sm bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h3 className="font-cinzel font-bold text-zinc-100 tracking-wide">
            Automated Daily Publishing System
          </h3>
          <p className="font-calibri text-xs text-zinc-400 leading-relaxed">
            Chapters assigned a scheduled release timestamp are evaluated continuously. When the scheduled timestamp arrives, the system automatically transitions the chapter to <strong>Published</strong>, increments the book's chapter count, and pushes the release to the public <strong>Latest Updates</strong> stream and reading index.
          </p>
        </div>
      </div>

      {/* Scheduled Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <span className="font-cinzel text-sm font-bold tracking-widest uppercase text-zinc-300">
            PENDING RELEASE QUEUE ({scheduledChapters.length})
          </span>
        </div>

        {scheduledChapters.length > 0 ? (
          <div className="bg-[#121215] border border-zinc-800 rounded-sm divide-y divide-zinc-800 shadow-xl">
            {scheduledChapters.map((ch) => {
              const book = bookMap.get(ch.bookId);
              const schedDate = ch.scheduledFor ? new Date(ch.scheduledFor) : null;
              const isPastDue = schedDate ? schedDate.getTime() <= Date.now() : false;

              return (
                <div
                  key={ch.id}
                  className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono-space text-zinc-400 uppercase tracking-wider">
                        {book?.title || 'UNKNOWN BOOK'}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono-space text-xs text-zinc-300 font-bold">
                        CHAPTER {ch.chapterNumber}
                      </span>
                      {isPastDue && (
                        <span className="px-2 py-0.2 bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono-space rounded">
                          PENDING TRIGGER
                        </span>
                      )}
                    </div>

                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-white truncate">
                      {ch.title}
                    </h3>

                    {ch.subtitle && (
                      <p className="font-cambria text-xs text-zinc-400 italic truncate">
                        {ch.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-mono-space text-amber-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Releasing: {schedDate?.toLocaleString()} (WAT)</span>
                      </span>
                      <span>•</span>
                      <span className="text-zinc-400">{ch.wordCount} words</span>
                      <span>•</span>
                      <span className="text-zinc-400">~{ch.readingTimeMinutes} min read</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    <button
                      onClick={() => onEditChapter(ch.id)}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => handleActionClick(ch.id, 'cancel')}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
                      title="Cancel schedule and revert to draft"
                    >
                      CANCEL SCHEDULE
                    </button>

                    <button
                      onClick={() => handleActionClick(ch.id, 'publish')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono-space font-bold tracking-wider rounded-sm shadow-md transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>PUBLISH NOW</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#121215] border border-zinc-800 rounded-sm space-y-3">
            <Clock className="w-8 h-8 text-zinc-400 mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-white uppercase">
              NO CHAPTERS CURRENTLY SCHEDULED
            </h3>
            <p className="font-cambria text-sm text-zinc-400 max-w-md mx-auto">
              When you write chapters in the Chapter Editor, select a future date and time and click "Schedule" to queue them for autonomous daily releases.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedChapterId && !!modalAction}
        title={modalAction === 'publish' ? `Publish Chapter Immediately?` : `Cancel Release Schedule?`}
        message={
          modalAction === 'publish'
            ? `Publish Chapter ${targetChapter?.chapterNumber} ("${targetChapter?.title}") right now? It will immediately appear to readers in the library.`
            : `Cancel the scheduled release for Chapter ${targetChapter?.chapterNumber}? It will be returned to draft status and will not be published automatically.`
        }
        confirmLabel={modalAction === 'publish' ? 'Publish Now' : 'Cancel Schedule'}
        isDestructive={modalAction === 'cancel'}
        onConfirm={handleConfirmModal}
        onCancel={() => {
          setSelectedChapterId(null);
          setModalAction(null);
        }}
      />

    </div>
  );
};
