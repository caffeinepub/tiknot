import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Comment } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useDeleteComment,
  useGetCallerUserProfile,
  useGetCommentsByVideo,
} from "../hooks/useQueries";

function timeAgo(ts: bigint): string {
  const diff = Math.floor((Date.now() - Number(ts / 1_000_000n)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface CommentsPanelProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentsPanel({
  videoId,
  isOpen,
  onClose,
}: CommentsPanelProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const myPrincipal = identity?.getPrincipal().toString();

  const { data: profile } = useGetCallerUserProfile();
  const { data: comments = [], isLoading } = useGetCommentsByVideo(
    isOpen ? videoId : null,
  );
  const { mutateAsync: addComment, isPending: isAdding } = useAddComment();
  const { mutateAsync: deleteComment } = useDeleteComment();

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !isAuthenticated) return;
    const username = profile?.username || `user_${myPrincipal?.slice(0, 6)}`;
    try {
      await addComment({ videoId, username, text: text.trim() });
      setText("");
    } catch {
      // ignore
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
            data-ocid="comments.modal"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto rounded-t-3xl overflow-hidden"
            style={{
              background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            data-ocid="comments.panel"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-white font-bold text-base">
                {comments.length > 0
                  ? `${comments.length} Comments`
                  : "Comments"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
                data-ocid="comments.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comments list */}
            <ScrollArea className="h-80 px-4">
              {isLoading ? (
                <div
                  className="flex items-center justify-center h-full py-12"
                  data-ocid="comments.loading_state"
                >
                  <div
                    className="w-6 h-6 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: "var(--tiknot-pink)",
                      borderTopColor: "transparent",
                    }}
                  />
                </div>
              ) : comments.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-white/40"
                  data-ocid="comments.empty_state"
                >
                  <span className="text-3xl mb-2">💬</span>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {comments.map((comment: Comment, i: number) => {
                    const isOwn = comment.author.toString() === myPrincipal;
                    return (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex gap-3 group"
                        data-ocid={`comments.item.${i + 1}`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--tiknot-pink), var(--tiknot-cyan))",
                          }}
                        >
                          {comment.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white/90 text-xs font-semibold">
                              @{comment.username}
                            </span>
                            <span className="text-white/30 text-xs">
                              {timeAgo(comment.timestamp)}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm mt-0.5 break-words">
                            {comment.text}
                          </p>
                        </div>
                        {isOwn && (
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-red-400 hover:bg-red-900/40 transition-all"
                            data-ocid={`comments.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10">
              {isAuthenticated ? (
                <form
                  onSubmit={handleSubmit}
                  className="flex gap-2 items-center"
                >
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={500}
                    className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-1 transition-all"
                    style={
                      {
                        "--tw-ring-color": "var(--tiknot-pink)",
                      } as React.CSSProperties
                    }
                    data-ocid="comments.input"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || isAdding}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--tiknot-pink), var(--tiknot-cyan))",
                    }}
                    data-ocid="comments.submit_button"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
              ) : (
                <p className="text-center text-white/40 text-xs py-1">
                  Login to leave a comment
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
