import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  MessageSquare,
  Send,
  Trash2,
  Heart,
  LogIn,
  CheckCircle2,
  Feather,
  AlertCircle
} from 'lucide-react';
import { ChapterComment } from '../types';
import {
  listenToChapterComments,
  addCommentToFirestore,
  deleteCommentFromFirestore,
  SimpleAuthUser
} from '../lib/firebase';

interface ChapterCommentsProps {
  chapterId: string;
  bookId: string;
  chapterNumber: number;
  currentUser: User | SimpleAuthUser | null;
  onLoginWithGoogle: () => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ChapterComments: React.FC<ChapterCommentsProps> = ({
  chapterId,
  bookId,
  chapterNumber,
  currentUser,
  onLoginWithGoogle,
  onShowToast,
}) => {
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  // Subscribe to real-time comments for this chapter from Firestore
  useEffect(() => {
    if (!chapterId) return;

    const unsubscribe = listenToChapterComments(
      chapterId,
      (liveComments) => {
        setComments(liveComments);
      },
      (error) => {
        console.warn('Real-time comments subscription notice:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginWithGoogle();
      return;
    }

    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (trimmed.length > 2000) {
      onShowToast('Comment exceeds maximum length of 2000 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    const commentObj: ChapterComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      chapterId,
      bookId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Reader',
      userEmail: currentUser.email || undefined,
      userAvatar: currentUser.photoURL || undefined,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    try {
      await addCommentToFirestore(commentObj);
      setNewComment('');
      onShowToast('Your comment was published to chapter discussion!', 'success');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error('Failed to post comment to Firestore:', err);
      onShowToast(`Failed to post comment: ${errObj?.message || 'Permission or network issue'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteCommentFromFirestore(commentId);
      onShowToast('Comment removed', 'info');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      onShowToast(`Could not delete comment: ${errObj?.message || 'Access denied'}`, 'error');
    }
  };

  const handleToggleLike = (commentId: string) => {
    setLikedCommentIds(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const formatCommentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const isAuthor = (email?: string) => {
    return email?.toLowerCase() === 'johnrufai242@gmail.com';
  };

  return (
    <section className="mt-14 pt-10 border-t border-zinc-800/60 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 flex items-center justify-center text-amber-400 shadow-inner">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-xl font-bold tracking-wide text-zinc-100">
                Chapter {chapterNumber} Literary Salon
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-mono-space text-zinc-300">
                {comments.length} {comments.length === 1 ? 'thought' : 'thoughts'}
              </span>
            </div>
            <p className="font-mono-space text-xs text-zinc-400">
              Discussions and reflections recorded directly to the cloud archive
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form or Google Login Prompt */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-10 p-5 rounded-2xl bg-[#14141b]/80 border border-zinc-800/80 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Reader'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold font-mono-space">
                  {(currentUser.displayName || currentUser.email || 'R')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-200">
                Commenting as <strong className="text-white">{currentUser.displayName || currentUser.email}</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono-space text-zinc-500">
              {newComment.length}/2000
            </span>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Share your interpretation, emotional resonance, or thoughts on Chapter ${chapterNumber}...`}
            rows={3}
            maxLength={2000}
            className="w-full bg-[#0c0c10] border border-zinc-800 focus:border-zinc-600 rounded-xl p-3.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors resize-y leading-relaxed font-sans"
          />

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-space text-zinc-400">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>Visible to readers across the library</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'TRANSMITTING...' : 'POST THOUGHT'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-[#14141c] to-[#181824] border border-zinc-800/80 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h4 className="font-cinzel text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>Join the Literary Conversation</span>
            </h4>
            <p className="text-xs text-zinc-400 max-w-lg leading-relaxed font-sans">
              Sign in with your Google account to post comments, discuss key plot developments with fellow readers, and receive updates from the author.
            </p>
          </div>

          <button
            onClick={onLoginWithGoogle}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-mono-space text-xs font-bold tracking-wider transition-all shadow-md active:scale-95 shrink-0"
          >
            <LogIn className="w-4 h-4 text-zinc-950" />
            <span>SIGN IN</span>
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
            <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-3 opacity-60" />
            <p className="font-cinzel text-base text-zinc-300 font-semibold mb-1">
              No Reflections Yet on Chapter {chapterNumber}
            </p>
            <p className="text-xs text-zinc-400 font-mono-space max-w-md mx-auto">
              Be the first reader to engrave your thoughts into this chapter's archive.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMyComment = currentUser && currentUser.uid === comment.userId;
            const authorRole = isAuthor(comment.userEmail);
            const isLiked = likedCommentIds.has(comment.id);

            return (
              <div
                key={comment.id}
                className={`p-5 rounded-2xl border transition-all duration-200 ${
                  authorRole
                    ? 'bg-[#181512]/90 border-amber-900/40 shadow-sm'
                    : 'bg-[#121217]/70 border-zinc-800/60 hover:border-zinc-700/60 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full border border-zinc-700 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold font-mono-space shadow-inner">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-100">
                          {comment.userName}
                        </span>

                        {authorRole && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono-space font-bold tracking-wider text-amber-300 flex items-center gap-1">
                            <Feather className="w-2.5 h-2.5" />
                            AUTHOR
                          </span>
                        )}

                        {isMyComment && !authorRole && (
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono-space text-zinc-300">
                            YOU
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono-space text-zinc-400 block mt-0.5">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-colors ${
                        isLiked
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span className="font-mono-space text-[11px]">
                        {(comment.likes || 0) + (isLiked ? 1 : 0)}
                      </span>
                    </button>

                    {isMyComment && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete thought"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans pl-12">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
