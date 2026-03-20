import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, LogIn, ShieldCheck, Tag } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Hero illustration */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-purple-light/10 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-light" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-magenta flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Login to Access <span className="text-magenta">Students Notes</span>
        </h1>
        <p className="text-muted-foreground mb-6">
          Sign in to browse, buy, and sell study notes. Logged-in users get{" "}
          <strong className="text-magenta">50% discount</strong> — only ₹1/page!
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: <BookOpen className="w-5 h-5" />, label: "Browse Notes" },
            { icon: <Tag className="w-5 h-5" />, label: "50% OFF" },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              label: "Secure Login",
            },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-secondary rounded-xl p-3 flex flex-col items-center gap-1"
            >
              <div className="text-purple-light">{f.icon}</div>
              <span className="text-xs font-medium text-muted-foreground">
                {f.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="btn-pill w-full bg-purple-light hover:bg-purple-hero text-white text-base py-3 h-auto"
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          {isLoggingIn ? "Logging in..." : "Log in / Sign Up"}
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Uses Internet Identity — secure, private, no password needed.
        </p>
      </div>
    </div>
  );
}
