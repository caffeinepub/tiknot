import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Compass,
  Download,
  Home,
  Plus,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import VideoCard from "../components/VideoCard";
import { useGetAllVideos, useGetTrendingVideos } from "../hooks/useQueries";

const CHANNEL_CARDS = [
  { rank: 1, handle: "@dancekingz", name: "Dance Kingz", followers: "2.4M" },
  { rank: 2, handle: "@tokyochef", name: "Tokyo Chef", followers: "1.8M" },
  { rank: 3, handle: "@surfervibes", name: "Surfer Vibes", followers: "1.2M" },
];

const TRENDING_ITEMS = [
  {
    title: "Street Dance Battle NYC",
    creator: "@dancekingz",
    views: "4.2M",
    gradient: "from-cyan-800 to-blue-900",
  },
  {
    title: "Authentic Ramen Recipe",
    creator: "@tokyochef",
    views: "2.9M",
    gradient: "from-orange-800 to-red-900",
  },
  {
    title: "Sunset Surfing Malibu",
    creator: "@surfervibes",
    views: "6.1M",
    gradient: "from-purple-800 to-pink-900",
  },
  {
    title: "5AM Morning Routine",
    creator: "@mindfulmornings",
    views: "1.7M",
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    title: "Crazy Magic Tricks",
    creator: "@magicmike",
    views: "9.3M",
    gradient: "from-violet-800 to-indigo-900",
  },
];

const NAV_ITEMS = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Compass, label: "Explore", to: "/explore" },
  { icon: Plus, label: "Upload", to: "/upload" },
  { icon: Download, label: "Downloads", to: "/downloads" },
  { icon: Bell, label: "Notifications", to: "/" },
  { icon: User, label: "Profile", to: "/channel" },
] as const;

export default function HomePage() {
  const { data: videos = [], isLoading } = useGetAllVideos();
  const { data: trending = [] } = useGetTrendingVideos();
  const [activeIndex, setActiveIndex] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  const feedCount = videos.length > 0 ? videos.length : 6;

  const handleScroll = useCallback(() => {
    const el = feedRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="pt-14">
      <section className="flex gap-0 max-w-7xl mx-auto px-4">
        {/* Sidebar Nav */}
        <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0 pt-8 pr-4">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-medium"
              data-ocid="nav.link"
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Video Feed */}
        <div className="flex-1 flex flex-col items-center">
          <div
            ref={feedRef}
            className="relative h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory hide-scrollbar w-full max-w-sm"
            data-ocid="feed.panel"
          >
            {isLoading ? (
              <div className="w-full h-full snap-start flex items-center justify-center">
                <Skeleton
                  className="w-full h-[85%] rounded-2xl"
                  data-ocid="feed.loading_state"
                />
              </div>
            ) : (
              (videos.length > 0
                ? videos.map((v) => v.id)
                : ["v0", "v1", "v2", "v3", "v4", "v5"]
              )
                .slice(0, feedCount)
                .map((vid, i) => (
                  <div
                    key={vid}
                    className="w-full h-full snap-start flex items-center justify-center p-2"
                  >
                    <div className="w-full h-[90%]">
                      <VideoCard
                        video={videos[i]}
                        index={i}
                        isActive={i === activeIndex}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Mobile bottom nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around py-2 z-40">
            {[
              { icon: Home, label: "Home", to: "/", special: false },
              {
                icon: Compass,
                label: "Explore",
                to: "/explore",
                special: false,
              },
              { icon: Plus, label: "", to: "/upload", special: true },
              {
                icon: Download,
                label: "Downloads",
                to: "/downloads",
                special: false,
              },
              { icon: User, label: "Profile", to: "/channel", special: false },
            ].map(({ icon: Icon, label, to, special }) => (
              <Link
                key={to + label}
                to={to}
                className="flex flex-col items-center gap-0.5"
                data-ocid="nav.link"
              >
                {special ? (
                  <div className="w-10 h-7 brand-gradient rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 text-muted-foreground" />
                )}
                {label && (
                  <span className="text-[10px] text-muted-foreground">
                    {label}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:flex flex-col gap-6 w-72 shrink-0 pt-8 pl-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-tiknot-pink" />
              <h3 className="font-display font-semibold text-sm">
                Trending Now
              </h3>
            </div>
            <div className="space-y-2">
              {(trending.length > 0 ? trending : TRENDING_ITEMS)
                .slice(0, 5)
                .map((item: any, i: number) => (
                  <motion.div
                    key={item.title ?? String(i)}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
                    data-ocid={`trending.item.${i + 1}`}
                  >
                    <div
                      className={`w-10 h-14 rounded-lg bg-gradient-to-b ${item.gradient ?? "from-cyan-800 to-blue-900"} shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">
                        {item.title ?? `Video ${i + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.creator ?? "@creator"}
                      </p>
                      <p className="text-xs text-tiknot-cyan">
                        {item.views ?? "1M"} views
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-tiknot-cyan" />
              <h3 className="font-display font-semibold text-sm">Channels</h3>
            </div>
            <div className="space-y-2">
              {CHANNEL_CARDS.map((ch, i) => (
                <div
                  key={ch.handle}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-secondary transition-colors"
                  data-ocid={`channel.item.${i + 1}`}
                >
                  <span className="text-xs font-bold text-muted-foreground w-4">
                    #{ch.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">
                      {ch.name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{ch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ch.followers} followers
                    </p>
                  </div>
                  <button
                    type="button"
                    className="follow-btn text-xs px-2.5 py-1 rounded-full font-medium shrink-0"
                    data-ocid={`channel.button.${i + 1}`}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-semibold">Get Monetized</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reach 10K followers and 20M views in 6 months to unlock channel
              monetization.
            </p>
            <Link to="/channel">
              <Button
                className="w-full mt-3 brand-gradient text-white text-xs h-8 rounded-xl"
                data-ocid="monetize.primary_button"
              >
                View My Channel
              </Button>
            </Link>
          </div>
        </aside>
      </section>

      {/* Trending Section */}
      <section
        className="max-w-7xl mx-auto px-4 mt-8 pb-16"
        data-ocid="trending.section"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-tiknot-pink" />
          <h2 className="font-display font-bold text-xl">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {TRENDING_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card-surface rounded-2xl overflow-hidden cursor-pointer group"
              data-ocid={`trending.card.${i + 1}`}
            >
              <div
                className={`aspect-[9/16] bg-gradient-to-b ${item.gradient} relative`}
              >
                <div className="absolute bottom-2 left-2">
                  <span className="text-xs text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full">
                    {item.views} views
                  </span>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.creator}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
