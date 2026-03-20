import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Edit2,
  Eye,
  Instagram,
  Loader2,
  Star,
  TrendingUp,
  Twitter,
  Upload,
  Users,
  Video,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetVideosByUser,
  useIsMonetizationEligible,
  useSaveUserProfile,
} from "../hooks/useQueries";

const SAMPLE_CHANNEL_VIDEOS = [
  {
    id: "cv1",
    title: "My First Tiknot Video 🎬",
    views: "12.3K",
    gradient: "from-cyan-800 to-blue-900",
  },
  {
    id: "cv2",
    title: "Behind the Scenes ✨",
    views: "8.7K",
    gradient: "from-purple-800 to-pink-900",
  },
  {
    id: "cv3",
    title: "Day in My Life",
    views: "5.2K",
    gradient: "from-orange-800 to-red-900",
  },
];

const BANNER_GRADIENTS = [
  "from-cyan-900 via-blue-900 to-purple-900",
  "from-purple-900 via-pink-900 to-rose-900",
  "from-teal-900 via-cyan-900 to-blue-900",
  "from-indigo-900 via-purple-900 to-pink-900",
  "from-blue-900 via-indigo-900 to-violet-900",
];

function getBannerGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffff;
  }
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length];
}

function formatJoinDate(ts: bigint | number | undefined): string {
  if (!ts) return "";
  const ms = typeof ts === "bigint" ? Number(ts) / 1_000_000 : ts;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

type SocialLinks = { youtube: string; instagram: string; twitter: string };

function MonetizationCard({ eligible }: { eligible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-5 border ${
        eligible
          ? "bg-yellow-900/20 border-yellow-600/40"
          : "bg-secondary border-border"
      }`}
      data-ocid="channel.card"
    >
      <div className="flex items-center gap-2 mb-3">
        {eligible ? (
          <Crown className="w-5 h-5 text-yellow-400" />
        ) : (
          <Star className="w-5 h-5 text-muted-foreground" />
        )}
        <h3 className="font-display font-semibold text-sm">
          {eligible ? "Monetization Eligible! 🎉" : "Channel Monetization"}
        </h3>
        {eligible && (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-600/40 text-xs">
            <Crown className="w-3 h-3 mr-1" /> Eligible
          </Badge>
        )}
      </div>

      {eligible ? (
        <div>
          <p className="text-sm text-yellow-300/90 leading-relaxed mb-3">
            🏆 Congratulations! Your channel qualifies for monetization. You can
            now earn revenue from your content.
          </p>
          <Button
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm rounded-xl"
            data-ocid="channel.primary_button"
          >
            Apply for Monetization
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reach the requirements below to unlock channel monetization and
            start earning.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-tiknot-cyan" />
                <span className="text-xs">Followers</span>
              </div>
              <span className="text-xs text-muted-foreground">0 / 10,000</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full brand-gradient rounded-full"
                style={{ width: "0%" }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-tiknot-pink" />
                <span className="text-xs">Views (6 months)</span>
              </div>
              <span className="text-xs text-muted-foreground">
                0 / 20,000,000
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full brand-gradient rounded-full"
                style={{ width: "0%" }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            📅 Must be achieved within <strong>6 months</strong> of channel
            creation.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function EditProfileDialog({
  profile,
  socialLinks,
  onSocialLinksChange,
}: {
  profile: { username?: string; bio?: string } | null | undefined;
  socialLinks: SocialLinks;
  onSocialLinksChange: (links: SocialLinks) => void;
}) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [localLinks, setLocalLinks] = useState<SocialLinks>(socialLinks);
  const save = useSaveUserProfile();

  function handleOpen(val: boolean) {
    if (val) {
      setDisplayName(profile?.username ?? "");
      setBio(profile?.bio ?? "");
      setLocalLinks(socialLinks);
    }
    setOpen(val);
  }

  async function handleSave() {
    await save.mutateAsync(
      { username: displayName, bio },
      {
        onSuccess: () => {
          toast.success("Profile updated!");
          onSocialLinksChange(localLinks);
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to save profile. Try again.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full border-border/60 hover:border-tiknot-cyan/60 gap-1.5 text-xs"
          data-ocid="channel.edit_button"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="channel.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="display-name"
              className="text-xs text-muted-foreground"
            >
              Display Name
            </Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your channel name"
              className="bg-secondary border-border"
              data-ocid="channel.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-xs text-muted-foreground">
              Bio / Description
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="Tell your audience about yourself..."
              className="bg-secondary border-border resize-none h-24"
              data-ocid="channel.textarea"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length} / 200
            </p>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Social Links (optional)
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                <Input
                  value={localLinks.youtube}
                  onChange={(e) =>
                    setLocalLinks((p) => ({ ...p, youtube: e.target.value }))
                  }
                  placeholder="YouTube channel URL"
                  className="bg-secondary border-border text-xs h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <Input
                  value={localLinks.instagram}
                  onChange={(e) =>
                    setLocalLinks((p) => ({ ...p, instagram: e.target.value }))
                  }
                  placeholder="Instagram profile URL"
                  className="bg-secondary border-border text-xs h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
                <Input
                  value={localLinks.twitter}
                  onChange={(e) =>
                    setLocalLinks((p) => ({ ...p, twitter: e.target.value }))
                  }
                  placeholder="Twitter / X profile URL"
                  className="bg-secondary border-border text-xs h-8"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            data-ocid="channel.cancel_button"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={save.isPending || !displayName.trim()}
            className="brand-gradient text-white rounded-lg"
            data-ocid="channel.save_button"
          >
            {save.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : null}
            {save.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AboutCard({
  bio,
  joinTimestamp,
}: {
  bio?: string;
  joinTimestamp?: bigint | number;
}) {
  const [expanded, setExpanded] = useState(false);
  const joinDate = formatJoinDate(joinTimestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-surface rounded-2xl p-5"
    >
      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="text-tiknot-cyan">✦</span> About
      </h3>

      {bio ? (
        <div>
          <p
            className={`text-sm text-muted-foreground leading-relaxed ${
              !expanded ? "line-clamp-3" : ""
            }`}
          >
            {bio}
          </p>
          {bio.length > 140 && (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="text-xs text-tiknot-cyan mt-1.5 hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic">
          No description yet. Edit your profile to add one.
        </p>
      )}

      {joinDate && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          📅 Member since {joinDate}
        </p>
      )}
    </motion.div>
  );
}

export default function ChannelPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal() ?? null;

  const { data: profile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: myVideos = [], isLoading: videosLoading } =
    useGetVideosByUser(principal);
  const { data: isEligible = false } = useIsMonetizationEligible(principal);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    youtube: "",
    instagram: "",
    twitter: "",
  });

  if (!isAuthenticated) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Your Channel</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Login to create your channel and start sharing videos on Tiknot.
          </p>
          <Button
            onClick={() => login()}
            className="brand-gradient text-white px-8 rounded-full"
            data-ocid="channel.primary_button"
          >
            Login to Create Channel
          </Button>
        </motion.div>
      </div>
    );
  }

  const username = profile?.username ?? "Your Channel";
  const bannerGradient = getBannerGradient(principal?.toString() ?? username);
  const initial = username[0]?.toUpperCase() ?? "U";

  const displayVideos =
    myVideos.length > 0
      ? myVideos.map((v) => ({
          ...v,
          gradient: "from-cyan-800 to-blue-900",
          views: "",
        }))
      : SAMPLE_CHANNEL_VIDEOS;

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative h-32 sm:h-40 bg-gradient-to-r ${bannerGradient} overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(6,182,212,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_80%,rgba(236,72,153,0.12),transparent_60%)]" />
        </motion.div>

        <div className="px-4 pb-8">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-24 h-24 brand-gradient rounded-full flex items-center justify-center ring-4 ring-background shrink-0"
            >
              <span className="text-white text-3xl font-bold">{initial}</span>
            </motion.div>

            <div className="flex items-center gap-2 mb-1">
              <EditProfileDialog
                profile={profile}
                socialLinks={socialLinks}
                onSocialLinksChange={setSocialLinks}
              />
              <Link to="/upload">
                <Button
                  size="sm"
                  className="brand-gradient text-white rounded-full text-xs gap-1.5"
                  data-ocid="channel.primary_button"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </Button>
              </Link>
            </div>
          </div>

          {/* Profile info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            {profileLoading ? (
              <Skeleton className="h-7 w-48 mb-1" />
            ) : (
              <h1 className="font-display font-bold text-2xl">{username}</h1>
            )}

            {/* Social link badges */}
            {(socialLinks.youtube ||
              socialLinks.instagram ||
              socialLinks.twitter) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs bg-red-900/30 text-red-300 border border-red-800/40 px-2.5 py-1 rounded-full hover:bg-red-900/50 transition-colors"
                  >
                    <Youtube className="w-3 h-3" /> YouTube
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs bg-pink-900/30 text-pink-300 border border-pink-800/40 px-2.5 py-1 rounded-full hover:bg-pink-900/50 transition-colors"
                  >
                    <Instagram className="w-3 h-3" /> Instagram
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs bg-sky-900/30 text-sky-300 border border-sky-800/40 px-2.5 py-1 rounded-full hover:bg-sky-900/50 transition-colors"
                  >
                    <Twitter className="w-3 h-3" /> Twitter
                  </a>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="flex gap-6 mt-4">
              {[
                {
                  label: "Following",
                  value: profile?.following?.toString() ?? "0",
                },
                {
                  label: "Followers",
                  value: profile?.followers?.toString() ?? "0",
                },
                {
                  label: "Views",
                  value: profile?.totalViews?.toString() ?? "0",
                },
              ].map((stat) => (
                <button
                  type="button"
                  key={stat.label}
                  className="text-left group cursor-pointer"
                >
                  <p className="font-bold text-lg leading-tight group-hover:text-tiknot-cyan transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                    {stat.label}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* About card */}
              <AboutCard
                bio={profile?.bio}
                joinTimestamp={(profile as any)?.joinTimestamp}
              />

              {/* Videos */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Video className="w-4 h-4 text-tiknot-cyan" />
                  <h2 className="font-display font-semibold">My Videos</h2>
                  <span className="text-xs text-muted-foreground ml-1">
                    {displayVideos.length}
                  </span>
                </div>

                {videosLoading ? (
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    data-ocid="channel.loading_state"
                  >
                    {["cs1", "cs2", "cs3", "cs4", "cs5", "cs6"].map((sk) => (
                      <Skeleton key={sk} className="aspect-[9/16] rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    data-ocid="channel.list"
                  >
                    {displayVideos.map((v: any, i: number) => (
                      <motion.div
                        key={v.id ?? `cv-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card-surface rounded-xl overflow-hidden cursor-pointer group"
                        data-ocid={`channel.item.${i + 1}`}
                      >
                        <div
                          className={`aspect-[9/16] bg-gradient-to-b ${
                            v.gradient ?? "from-cyan-800 to-blue-900"
                          } relative`}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                          {v.views && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-white/80" />
                              <span className="text-xs text-white/90">
                                {v.views}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium line-clamp-2">
                            {v.title ?? `Video ${i + 1}`}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    <Link
                      to="/upload"
                      className="aspect-[9/16] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                      data-ocid="channel.upload_button"
                    >
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <MonetizationCard eligible={isEligible} />

              <div className="card-surface rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-tiknot-pink" />
                  <h3 className="font-semibold text-sm">Channel Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Videos
                    </span>
                    <span className="text-xs font-medium">
                      {myVideos.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Total Views
                    </span>
                    <span className="text-xs font-medium">
                      {profile?.totalViews?.toString() ?? "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Followers
                    </span>
                    <span className="text-xs font-medium">
                      {profile?.followers?.toString() ?? "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
