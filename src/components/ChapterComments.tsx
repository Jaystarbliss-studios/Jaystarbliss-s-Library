import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  MessageSquare,
  Send,
  Trash2,
  Reply,
  ChevronDown,
  ChevronRight,
  Heart,
  LogIn,
  Feather
} from 'lucide-react';
import { ChapterComment, ReaderTheme } from '../types';
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
  theme?: ReaderTheme;
}

export const ChapterComments: React.FC<ChapterCommentsProps> = ({
  chapterId,
  bookId,
  chapterNumber,
  currentUser,
  onLoginWithGoogle,
  onShowToast,
  theme = 'dark',
}) => {
  const [comments, setComments] = useState<ChapterComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [expandedReplyThreads, setExpandedReplyThreads] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!chapterId) return;

    const unsubscribe = listenToChapterComments(
      chapterId,
      (liveComments) => setComments(liveComments),
      (error) => console.warn('Real-time comments subscription notice:', error)
    );

    return () => unsubscribe();
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

  const submitReply = async (parentComment: ChapterComment) => {
    if (!currentUser) {
      onLoginWithGoogle();
      return;
    }

    const trimmed = replyText.trim();
    if (!trimmed) return;

    if (trimmed.length > 2000) {
      onShowToast('Reply exceeds maximum length of 2000 characters', 'error');
      return;
    }

    setIsReplySubmitting(true);
    const reply: ChapterComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      chapterId,
      bookId,
      parentCommentId: parentComment.id,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Reader',
      userEmail: currentUser.email || undefined,
      userAvatar: currentUser.photoURL || undefined,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    try {
      await addCommentToFirestore(reply);
      setReplyText('');
      setReplyingTo(null);
      setExpandedReplyThreads(prev => new Set(prev).add(parentComment.id));
      onShowToast('Reply published', 'success');
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error('Failed to post reply to Firestore:', err);
      onShowToast(`Failed to post reply: ${errObj?.message || 'Permission or network issue'}`, 'error');
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const toggleReplyThread = (commentId: string) => {
    setExpandedReplyThreads(prev => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
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
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  };

  const formatCommentDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
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

  const palette = {
    light: {
      text: '#17181c',
      muted: '#64666d',
      panel: '#f5f6f8',
      input: '#ffffff',
      border: '#d8dbe1',
      hover: '#eceef2',
    },
    sepia: {
      text: '#2b2117',
      muted: '#76624a',
      panel: '#eadfc9',
      input: '#fffaf0',
      border: '#d2c1a3',
      hover: '#e4d6bd',
    },
    dark: {
      text: '#f4f6fb',
      muted: '#a6a9b3',
      panel: '#11141b',
      input: '#0c0f15',
      border: '#353a46',
      hover: '#1b2029',
    },
  } as const;

  const activePalette = palette[theme === 'obsidian' ? 'dark' : theme] || palette.dark;
  const isDark = theme === 'dark' || theme === 'obsidian';
  const isAuthor = (email?: string) => email?.toLowerCase() === 'johnrufai242@gmail.com';

  return (
    <section
      className="mt-14 pt-10 max-w-4xl mx-auto"
      style={{
        borderTop: `1px solid ${activePalette.border}`,
        color: activePalette.text,
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-inner"
            style={{
              backgroundColor: activePalette.panel,
              borderColor: activePalette.border,
              color: activePalette.text,
            }}
          >
            <MessageSquare className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <h3
              className="font-cinzel text-xl font-bold tracking-wide"
              style={{ color: activePalette.text }}
            >
              Comments
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full border text-xs font-mono-space"
              style={{
                backgroundColor: activePalette.panel,
                borderColor: activePalette.border,
                color: activePalette.muted,
              }}
            >
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>

      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="mb-10 p-5 rounded-2xl border backdrop-blur-sm shadow-lg"
          style={{
            backgroundColor: activePalette.panel,
            borderColor: activePalette.border,
          }}
        >
          <div
            className="flex items-center justify-between mb-3 pb-3 border-b"
            style={{ borderColor: activePalette.border }}
          >
            <div className="flex items-center gap-2.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Reader'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border object-cover"
                  style={{ borderColor: activePalette.border }}
                />
              ) : (
                <div
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold font-mono-space"
                  style={{
                    backgroundColor: isDark ? '#2a2116' : '#f0dfb8',
                    borderColor: isDark ? '#6f552c' : '#d2b46d',
                    color: isDark ? '#f0c674' : '#765719',
                  }}
                >
                  {(currentUser.displayName || currentUser.email || 'R')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium" style={{ color: activePalette.muted }}>
                Commenting as <strong style={{ color: activePalette.text }}>{currentUser.displayName || currentUser.email}</strong>
              </span>
            </div>
            <span className="text-[11px] font-mono-space" style={{ color: activePalette.muted }}>
              {newComment.length}/2000
            </span>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Share your thoughts on Chapter ${chapterNumber}...`}
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl p-3.5 text-sm focus:outline-none transition-colors resize-y leading-relaxed font-sans"
            style={{
              backgroundColor: activePalette.input,
              border: `1px solid ${activePalette.border}`,
              color: activePalette.text,
            }}
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono-space" style={{ color: activePalette.muted }}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Visible to readers across the library</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono-space text-xs font-bold tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-md"
              style={{
                backgroundColor: activePalette.text,
                color: theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#fffaf0' : '#0d0f14',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'POSTING...' : 'POST COMMENT'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div
          className="mb-10 p-6 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ backgroundColor: activePalette.panel, borderColor: activePalette.border }}
        >
          <div className="space-y-1">
            <h4 className="font-cinzel text-base font-bold" style={{ color: activePalette.text }}>
              Join the Conversation
            </h4>
            <p className="text-xs max-w-lg leading-relaxed font-sans" style={{ color: activePalette.muted }}>
              Sign in with your Google account to post comments and discuss the chapter with fellow readers.
            </p>
          </div>

          <button
            onClick={onLoginWithGoogle}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono-space text-xs font-bold tracking-wider transition-all shadow-md active:scale-95 shrink-0"
            style={{ backgroundColor: activePalette.text, color: theme === 'light' ? '#ffffff' : theme === 'sepia' ? '#fffaf0' : '#0d0f14' }}
          >
            <LogIn className="w-4 h-4" />
            <span>SIGN IN</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div
            className="text-center py-12 px-4 rounded-2xl border"
            style={{ backgroundColor: activePalette.panel, borderColor: activePalette.border }}
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-60" style={{ color: activePalette.muted }} />
            <p className="font-cinzel text-base font-semibold mb-1" style={{ color: activePalette.text }}>
              No Comments Yet
            </p>
            <p className="text-xs font-mono-space max-w-md mx-auto" style={{ color: activePalette.muted }}>
              Be the first reader to share a thought about this chapter.
            </p>
          </div>
        ) : (
          (() => {
            const topLevelComments = comments.filter(comment => !comment.parentCommentId);
            const repliesByParent = new Map<string, ChapterComment[]>();

            comments.filter(comment => comment.parentCommentId).forEach(reply => {
              const existing = repliesByParent.get(reply.parentCommentId!) || [];
              existing.push(reply);
              repliesByParent.set(reply.parentCommentId!, existing);
            });

            const renderComment = (comment: ChapterComment, isReply = false) => {
              const isMyComment = currentUser && currentUser.uid === comment.userId;
              const authorRole = isAuthor(comment.userEmail);
              const isLiked = likedCommentIds.has(comment.id);
              const replies = repliesByParent.get(comment.id) || [];
              const repliesExpanded = expandedReplyThreads.has(comment.id);

              return (
                <div key={comment.id} className={isReply ? 'ml-8 sm:ml-12' : ''}>
                  <div
                    className="p-5 rounded-2xl border transition-all duration-200 shadow-sm"
                    style={{
                      backgroundColor: authorRole && theme === 'sepia' ? '#eee0c2' : activePalette.panel,
                      borderColor: authorRole ? (theme === 'sepia' ? '#c7a86c' : '#8d7041') : activePalette.border,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        {comment.userAvatar ? (
                          <img
                            src={comment.userAvatar}
                            alt={comment.userName}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full border object-cover shadow-sm"
                            style={{ borderColor: activePalette.border }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold font-mono-space shadow-inner"
                            style={{ backgroundColor: activePalette.hover, borderColor: activePalette.border, color: activePalette.text }}
                          >
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm" style={{ color: activePalette.text }}>
                              {comment.userName}
                            </span>
                            {authorRole && (
                              <span
                                className="px-2 py-0.5 rounded-full border text-[10px] font-mono-space font-bold tracking-wider flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(245, 158, 11, 0.14)', borderColor: 'rgba(245, 158, 11, 0.35)', color: theme === 'light' ? '#7a5715' : '#c88f27' }}
                              >
                                <Feather className="w-2.5 h-2.5" /> AUTHOR
                              </span>
                            )}
                            {isMyComment && !authorRole && (
                              <span className="px-2 py-0.5 rounded-full border text-[10px] font-mono-space" style={{ backgroundColor: activePalette.hover, borderColor: activePalette.border, color: activePalette.muted }}>
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono-space block mt-0.5" style={{ color: activePalette.muted }}>
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-colors"
                          style={{ color: isLiked ? '#e11d48' : activePalette.muted, backgroundColor: isLiked ? 'rgba(225, 29, 72, 0.10)' : 'transparent' }}
                          title={isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span className="font-mono-space text-[11px]">{(comment.likes || 0) + (isLiked ? 1 : 0)}</span>
                        </button>
                        {isMyComment && (
                          <button type="button" onClick={() => handleDelete(comment.id)} className="p-1.5 rounded-xl" style={{ color: activePalette.muted }} title="Delete comment">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans pl-12" style={{ color: activePalette.text }}>
                      {comment.content}
                    </p>

                    <div className="pl-12 mt-3 flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            onLoginWithGoogle();
                            return;
                          }
                          setReplyingTo(replyingTo === comment.id ? null : comment.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono-space font-semibold"
                        style={{ color: activePalette.muted }}
                      >
                        <Reply className="w-3.5 h-3.5" /> Reply
                      </button>

                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleReplyThread(comment.id)}
                          className="inline-flex items-center gap-1 text-xs font-mono-space font-semibold"
                          style={{ color: activePalette.muted }}
                        >
                          {repliesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          {repliesExpanded ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                      )}
                    </div>

                    {replyingTo === comment.id && (
                      <div className="pl-12 mt-4">
                        <div className="flex gap-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows={2}
                            maxLength={2000}
                            autoFocus
                            className="flex-1 rounded-xl p-3 text-sm resize-none focus:outline-none font-sans"
                            style={{ backgroundColor: activePalette.input, border: `1px solid ${activePalette.border}`, color: activePalette.text }}
                          />
                          <button
                            type="button"
                            disabled={isReplySubmitting || !replyText.trim()}
                            onClick={() => submitReply(comment)}
                            className="self-end p-3 rounded-xl disabled:opacity-40"
                            style={{ backgroundColor: activePalette.text, color: theme === 'light' ? '#fff' : '#0d0f14' }}
                            title="Post reply"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {repliesExpanded && replies.length > 0 && (
                    <div className="mt-3 space-y-3 border-l-2 pl-3 sm:pl-4" style={{ borderColor: activePalette.border }}>
                      {replies.map(reply => renderComment(reply, true))}
                    </div>
                  )}
                </div>
              );
            };

            return topLevelComments.map(comment => renderComment(comment));
          })()
        )}
      </div>
    </section>
  );
};
