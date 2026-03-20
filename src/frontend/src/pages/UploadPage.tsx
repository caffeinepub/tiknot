import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Upload, Video, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateVideo } from "../hooks/useQueries";

export default function UploadPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { mutateAsync: createVideo, isPending } = useCreateVideo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Start Creating
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Login to upload videos and start building your channel on Tiknot.
          </p>
          <Button
            onClick={() => login()}
            className="brand-gradient text-white px-8 rounded-full"
            data-ocid="upload.primary_button"
          >
            Login to Upload
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video must be under 500MB");
        return;
      }
      setVideoFile(file);
      setUploaded(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }

    try {
      const bytes = await videoFile.arrayBuffer();
      const uint8 = new Uint8Array(bytes);
      const blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      const tags = tagsInput
        .split(" ")
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean);

      await createVideo({
        title: title.trim(),
        description: description.trim(),
        tags,
        videoFile: blob,
      });

      setUploaded(true);
      toast.success("Video uploaded successfully! 🎬");
      setTitle("");
      setDescription("");
      setTagsInput("");
      setVideoFile(null);
      setUploadProgress(0);
    } catch {
      toast.error("Upload failed. Please try again.");
      setUploadProgress(0);
    }
  };

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 brand-gradient rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl">Upload Video</h1>
              <p className="text-muted-foreground text-sm">
                Share your creativity with the world
              </p>
            </div>
          </div>

          {uploaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-900/30 border border-emerald-700/50 flex items-center gap-3"
              data-ocid="upload.success_state"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  Video uploaded! 🎉
                </p>
                <p className="text-xs text-emerald-400/70">
                  Your video is now live on Tiknot
                </p>
              </div>
              <Link to="/" className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-emerald-700"
                  data-ocid="upload.button"
                >
                  View Feed
                </Button>
              </Link>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* File Drop Zone */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                videoFile
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}
              data-ocid="upload.dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
                data-ocid="upload.upload_button"
              />
              {videoFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Video className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                    }}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    data-ocid="upload.close_button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 brand-gradient rounded-2xl mx-auto mb-3 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-medium text-sm">Click to select video</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, AVI — max 500MB
                  </p>
                </>
              )}
            </button>

            {isPending && uploadProgress > 0 && (
              <div data-ocid="upload.loading_state">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm">Title *</Label>
              <Input
                data-ocid="upload.input"
                placeholder="Give your video a catchy title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea
                data-ocid="upload.textarea"
                placeholder="Tell viewers what this video is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary border-border resize-none"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Hashtags</Label>
              <Input
                placeholder="#dance #funny #viral"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with spaces
              </p>
            </div>

            <Button
              type="submit"
              disabled={isPending || !title.trim() || !videoFile}
              className="w-full brand-gradient text-white font-semibold h-11 rounded-xl text-sm"
              data-ocid="upload.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Video 🚀"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
