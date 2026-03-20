import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useGetAllVideos } from "../hooks/useQueries";

const SAMPLE_EXPLORE = [
  {
    id: "s1",
    title: "Street Dance Battle NYC 🔥",
    creator: "@dancekingz",
    views: "4.2M",
    tags: ["dance", "battle"],
    gradient: "from-cyan-800 to-blue-900",
  },
  {
    id: "s2",
    title: "Authentic Ramen at Home",
    creator: "@tokyochef",
    views: "2.9M",
    tags: ["food", "cooking"],
    gradient: "from-orange-800 to-red-900",
  },
  {
    id: "s3",
    title: "Sunset Surfing Malibu 🌊",
    creator: "@surfervibes",
    views: "6.1M",
    tags: ["surf", "beach"],
    gradient: "from-purple-800 to-pink-900",
  },
  {
    id: "s4",
    title: "5AM Morning Routine ✨",
    creator: "@mindfulmornings",
    views: "1.7M",
    tags: ["morning", "lifestyle"],
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    id: "s5",
    title: "Crazy Magic Tricks 🎩",
    creator: "@magicmike",
    views: "9.3M",
    tags: ["magic", "tricks"],
    gradient: "from-violet-800 to-indigo-900",
  },
  {
    id: "s6",
    title: "How to Draw Anime ✏️",
    creator: "@artbyjess",
    views: "3.5M",
    tags: ["art", "anime"],
    gradient: "from-rose-800 to-pink-900",
  },
  {
    id: "s7",
    title: "Skateboard Tricks Tutorial",
    creator: "@skatelife",
    views: "2.1M",
    tags: ["skate", "tricks"],
    gradient: "from-yellow-800 to-orange-900",
  },
  {
    id: "s8",
    title: "Late Night Coding Session",
    creator: "@codevibes",
    views: "890K",
    tags: ["coding", "tech"],
    gradient: "from-slate-700 to-blue-900",
  },
  {
    id: "s9",
    title: "Hiking Patagonia Peaks 🏔️",
    creator: "@adventures",
    views: "5.4M",
    tags: ["travel", "hiking"],
    gradient: "from-green-800 to-emerald-900",
  },
  {
    id: "s10",
    title: "EDM Festival Highlights 🎵",
    creator: "@musiclive",
    views: "7.8M",
    tags: ["music", "festival"],
    gradient: "from-fuchsia-800 to-purple-900",
  },
  {
    id: "s11",
    title: "Italian Pizza from Scratch 🍕",
    creator: "@naplescook",
    views: "3.2M",
    tags: ["food", "pizza"],
    gradient: "from-red-800 to-orange-900",
  },
  {
    id: "s12",
    title: "Minimalist Home Tour 🏠",
    creator: "@minimalhome",
    views: "1.4M",
    tags: ["home", "design"],
    gradient: "from-gray-700 to-slate-900",
  },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const { data: videos = [], isLoading } = useGetAllVideos();

  const displayItems =
    videos.length > 0
      ? videos.map((v) => ({
          ...v,
          id: v.id,
          gradient: "from-cyan-800 to-blue-900",
        }))
      : SAMPLE_EXPLORE;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return displayItems;
    return displayItems.filter((v: any) => {
      const inTitle = v.title?.toLowerCase().includes(q);
      const inTags = v.tags?.some((t: string) => t.toLowerCase().includes(q));
      const inCreator = (v.creator?.toString() ?? "").toLowerCase().includes(q);
      return inTitle || inTags || inCreator;
    });
  }, [search, displayItems]);

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-tiknot-pink" />
          <h1 className="font-display font-bold text-2xl">Explore</h1>
        </div>

        <div className="relative max-w-lg mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="explore.search_input"
            placeholder="Search by title or hashtag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border rounded-xl h-11"
          />
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            data-ocid="explore.loading_state"
          >
            {[
              "sk1",
              "sk2",
              "sk3",
              "sk4",
              "sk5",
              "sk6",
              "sk7",
              "sk8",
              "sk9",
              "sk10",
              "sk11",
              "sk12",
            ].map((sk) => (
              <Skeleton key={sk} className="aspect-[9/16] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="explore.empty_state"
          >
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No videos match "{search}"</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            data-ocid="explore.list"
          >
            {filtered.map((item: any, i: number) => (
              <motion.div
                key={item.id ?? `item-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-surface rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform"
                data-ocid={`explore.item.${i + 1}`}
              >
                <div
                  className={`aspect-[9/16] bg-gradient-to-b ${item.gradient ?? "from-cyan-800 to-blue-900"} relative`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-transparent border-l-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-white/80" />
                    <span className="text-xs text-white/90">
                      {item.views ?? "1M"}
                    </span>
                  </div>
                  {item.tags && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs text-tiknot-cyan bg-black/50 px-1.5 py-0.5 rounded-full">
                        #{item.tags[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {typeof item.creator === "object"
                      ? `@creator_${item.creator.toString().slice(0, 8)}`
                      : item.creator}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
