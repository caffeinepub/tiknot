import {
  Download,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Video } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddView,
  useGetCommentsByVideo,
  useLikeVideo,
} from "../hooks/useQueries";
import CommentsPanel from "./CommentsPanel";

const PLACEHOLDER_GRADIENTS = [
  "from-cyan-900 via-blue-900 to-indigo-900",
  "from-pink-900 via-rose-900 to-red-900",
  "from-purple-900 via-violet-900 to-indigo-900",
  "from-emerald-900 via-teal-900 to-cyan-900",
  "from-orange-900 via-amber-900 to-yellow-900",
];

const SAMPLE_VIDEOS = [
  {
    title: "Street Dance Battle NYC 🔥",
    creator: "@dancekingz",
    likes: "234K",
    comments: "8.2K",
  },
  {
    title: "Cooking Authentic Ramen at Home",
    creator: "@tokyochef",
    likes: "189K",
    comments: "5.7K",
  },
  {
    title: "Sunset Surfing at Malibu 🌊",
    creator: "@surfervibes",
    likes: "412K",
    comments: "12.1K",
  },
  {
    title: "My Morning Routine ✨ (5AM Club)",
    creator: "@mindfulmornings",
    likes: "98K",
    comments: "3.4K",
  },
  {
    title: "Crazy Magic Trick You Won't Believe",
    creator: "@magicmike",
    likes: "1.2M",
    comments: "45K",
  },
  {
    title: "How to Draw Anime Characters",
    creator: "@artbyjess",
    likes: "567K",
    comments: "19K",
  },
];

interface VideoCardProps {
  video?: Video;
  index?: number;
  isActive?: boolean;
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function VideoCard({
  video,
  index = 0,
  isActive = false,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { mutateAsync: likeVideo } = useLikeVideo();
  const { mutateAsync: addView } = useAddView();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const sample = SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length];
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];

  const videoUrl = video?.videoFile?.getDirectURL?.();
  const title = video?.title ?? sample.title;
  const creatorDisplay = video
    ? `@creator_${video.creator.toString().slice(0, 8)}`
    : sample.creator;
  const likesDisplay = sample.likes;
  const videoId = video?.id;

  // Real comment count from backend when we have a real video
  const { data: comments } = useGetCommentsByVideo(videoId ?? null);
  const commentsCount = videoId
    ? (comments?.length ?? 0).toString()
    : sample.comments;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoUrl) return;
    if (isActive) {
      el.play().catch(() => {});
      if (videoId) addView(videoId).catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, videoUrl, videoId, addView]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Login to like videos");
      return;
    }
    if (!videoId) return;
    setLiked(!liked);
    try {
      await likeVideo(videoId);
    } catch {
      setLiked(liked);
    }
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      toast.error("Login to download videos");
      return;
    }
    if (!videoUrl) {
      toast.error("Video file not available");
      return;
    }
    setDownloading(true);
    triggerDownload(videoUrl, `${title.replace(/\s+/g, "_")}.mp4`);
    toast.success("Download started!");
    setTimeout(() => setDownloading(false), 2000);
  };

  const handleOpenComments = () => {
    if (!videoId) {
      toast.info("Comments available on real videos");
      return;
    }
    setCommentsOpen(true);
  };

  return (
    <>
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden video-card-shadow"
        data-ocid="feed.card"
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted={muted}
            playsInline
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-[16px] border-b-[16px] border-l-[28px] border-transparent border-l-white ml-2" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        <div className="absolute bottom-16 left-4 right-16 z-10">
          <p className="font-semibold text-white text-sm">{creatorDisplay}</p>
          <p className="text-white/90 text-sm mt-1 line-clamp-2">{title}</p>
          {video?.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {video.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-tiknot-cyan text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleLike}
              className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-all ${
                liked
                  ? "text-tiknot-pink scale-110"
                  : "text-white hover:text-tiknot-pink"
              }`}
              data-ocid="feed.toggle"
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </button>
            <span className="text-white text-xs font-medium">
              {likesDisplay}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleOpenComments}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:text-tiknot-cyan transition-colors"
              data-ocid="feed.button"
              aria-label="Open comments"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <span className="text-white text-xs font-medium">
              {commentsCount}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:text-tiknot-cyan transition-colors"
              data-ocid="feed.button"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-white text-xs font-medium">Share</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleDownload}
              className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-colors ${
                downloading
                  ? "text-tiknot-cyan"
                  : "text-white hover:text-tiknot-cyan"
              }`}
              data-ocid="feed.button"
              aria-label="Download video"
            >
              <Download
                className={`w-4 h-4 ${downloading ? "animate-bounce" : ""}`}
              />
            </button>
            <span className="text-white text-xs font-medium">Save</span>
          </div>

          <button
            type="button"
            onClick={() => setMuted(!muted)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:text-tiknot-cyan transition-colors"
            data-ocid="feed.toggle"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {videoId && (
        <CommentsPanel
          videoId={videoId}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      )}
    </>
  );
}
