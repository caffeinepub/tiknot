import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import ChannelPage from "./pages/ChannelPage";
import DownloadsPage from "./pages/DownloadsPage";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";

const queryClient = new QueryClient();

function ProfileGate() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !isLoading && isFetched && userProfile === null;

  return showProfileSetup ? <ProfileSetupModal open={true} /> : null;
}

function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ProfileGate />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channel",
  component: ChannelPage,
});

const downloadsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/downloads",
  component: DownloadsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  exploreRoute,
  uploadRoute,
  channelRoute,
  downloadsRoute,
]);
const router = createRouter({ routeTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}
