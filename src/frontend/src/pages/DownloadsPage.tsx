import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Download, Film, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllVideos } from "../hooks/useQueries";

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function DownloadsPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: videos = [], isLoading } = useGetAllVideos();
  const [downloadStates, setDownloadStates] = useState<
    Record<string, "idle" | "downloading" | "done">
  >({});

  const handleDownload = async (id: string, url: string, title: string) => {
    setDownloadStates((prev) => ({ ...prev, [id]: "downloading" }));
    triggerDownload(url, `${title.replace(/\s+/g, "_")}.mp4`);
    setTimeout(() => {
      setDownloadStates((prev) => ({ ...prev, [id]: "done" }));
      setTimeout(() => {
        setDownloadStates((prev) => ({ ...prev, [id]: "idle" }));
      }, 2500);
    }, 800);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
          data-ocid="downloads.panel"
        >
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Downloads</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Log in to download your favourite Tiknot videos.
          </p>
          <Button
            onClick={login}
            className="brand-gradient text-white w-full rounded-xl h-11"
            data-ocid="downloads.primary_button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log in to Download
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-14 pb-20 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center">
            <Download className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl">Downloads</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Save any video directly to your device.
        </p>
      </motion.div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="downloads.loading_state"
        >
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map((k) => (
            <Skeleton key={k} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="downloads.empty_state"
        >
          <Film className="w-12 h-12 text-muted-foreground mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">
            No videos available to download yet.
          </p>
        </motion.div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          data-ocid="downloads.list"
        >
          {videos.map((video, i) => {
            const videoUrl = video.videoFile?.getDirectURL?.();
            const state = downloadStates[video.id] ?? "idle";
            const creatorLabel = `@creator_${video.creator.toString().slice(0, 8)}`;
            const views = (video as any).views ?? 0;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-surface rounded-2xl overflow-hidden border border-border group"
                data-ocid={`downloads.item.${i + 1}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] max-h-52 bg-secondary overflow-hidden">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-cyan-900 to-indigo-900 flex items-center justify-center">
                      <Film className="w-8 h-8 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {typeof views === "number" && views > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-[10px] bg-black/50 border-0 text-white"
                    >
                      {views >= 1_000_000
                        ? `${(views / 1_000_000).toFixed(1)}M`
                        : views >= 1000
                          ? `${(views / 1000).toFixed(1)}K`
                          : String(views)}{" "}
                      views
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-2 mb-0.5">
                    {video.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {creatorLabel}
                  </p>

                  {videoUrl ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleDownload(video.id, videoUrl, video.title)
                      }
                      disabled={state === "downloading"}
                      className={`w-full h-8 rounded-xl text-xs font-medium transition-all ${
                        state === "done"
                          ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                          : "brand-gradient text-white"
                      }`}
                      data-ocid={`downloads.button.${i + 1}`}
                    >
                      {state === "done" ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Downloaded
                        </>
                      ) : state === "downloading" ? (
                        <>
                          <Download className="w-3.5 h-3.5 mr-1.5 animate-bounce" />
                          Downloading…
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Download
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="w-full h-8 rounded-xl text-xs"
                      data-ocid={`downloads.button.${i + 1}`}
                    >
                      Unavailable
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
