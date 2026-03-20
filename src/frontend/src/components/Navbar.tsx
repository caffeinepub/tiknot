import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Radio, Search } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: any) {
        if (err?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate({ to: "/explore", search: { q: search.trim() } } as any);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 shrink-0"
          data-ocid="nav.link"
        >
          <img
            src="/assets/generated/tiknot-logo-transparent.dim_200x200.png"
            alt="Tiknot"
            className="w-8 h-8 object-contain"
          />
          <span className="font-display font-bold text-xl brand-gradient-text hidden sm:block">
            Tiknot
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="nav.search_input"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border text-sm h-9 rounded-full focus-visible:ring-primary"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="live-pill text-xs font-bold px-3 py-1 rounded-full hidden sm:flex items-center gap-1"
            data-ocid="nav.toggle"
          >
            <Radio className="w-3 h-3" />
            LIVE
          </button>

          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.button"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/channel" data-ocid="nav.link">
                <Avatar className="w-8 h-8 cursor-pointer border-2 border-primary/50">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {userProfile?.username?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuth}
                className="hidden sm:flex text-xs border-border hover:border-primary/50 rounded-full"
                data-ocid="nav.button"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="bg-tiknot-follow hover:bg-tiknot-follow/80 text-white text-xs px-4 rounded-full"
              data-ocid="nav.button"
            >
              {isLoggingIn ? "..." : "Login"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex text-xs border-border rounded-full"
            data-ocid="nav.button"
          >
            Get App
          </Button>
        </div>
      </div>
    </header>
  );
}
