import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="bg-tiknot-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img
              src="/assets/generated/tiknot-logo-transparent.dim_200x200.png"
              alt="Tiknot"
              className="w-7 h-7 object-contain"
            />
            <span className="font-display font-bold text-lg brand-gradient-text">
              Tiknot
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The next-gen short video platform. Create, share, and get monetized.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © {year}.{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Press
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Support</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Safety
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Community
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link
                to="/explore"
                className="hover:text-foreground transition-colors"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/upload"
                className="hover:text-foreground transition-colors"
              >
                Upload
              </Link>
            </li>
            <li>
              <Link
                to="/channel"
                className="hover:text-foreground transition-colors"
              >
                Channel
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
