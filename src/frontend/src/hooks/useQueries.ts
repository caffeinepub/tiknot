import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment, ExternalBlob, UserProfile, Video } from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { username: string; bio: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(params.username, params.bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["allVideos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTrendingVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["trendingVideos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideosByUser(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videosByUser", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getVideosByUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useIsMonetizationEligible(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["monetizationEligible", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      return actor.isMonetizationEligible(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      tags: string[];
      videoFile: ExternalBlob;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createVideo(
        params.title,
        params.description,
        params.tags,
        params.videoFile,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideos"] });
      queryClient.invalidateQueries({ queryKey: ["trendingVideos"] });
    },
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likeVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideos"] });
      queryClient.invalidateQueries({ queryKey: ["trendingVideos"] });
    },
  });
}

export function useAddView() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) return;
      return actor.addView(videoId);
    },
  });
}

export function useGetCommentsByVideo(videoId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return [];
      return actor.getCommentsByVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
    refetchInterval: 10_000,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      videoId: string;
      username: string;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addComment(params.videoId, params.username, params.text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.videoId],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}
