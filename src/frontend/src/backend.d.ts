import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: string;
    title: string;
    creator: Principal;
    tags: Array<string>;
    description: string;
    videoFile: ExternalBlob;
    timestamp: Time;
}
export type Time = bigint;
export interface Comment {
    id: string;
    username: string;
    text: string;
    author: Principal;
    timestamp: Time;
    videoId: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    joinTimestamp: Time;
    totalViews: bigint;
    followers: bigint;
    following: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, username: string, text: string): Promise<string>;
    addView(videoId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVideo(title: string, description: string, tags: Array<string>, videoFile: ExternalBlob): Promise<string>;
    deleteComment(commentId: string): Promise<void>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByVideo(videoId: string): Promise<Array<Comment>>;
    getTrendingVideos(): Promise<Array<Video>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(videoId: string): Promise<Video | null>;
    getVideosByUser(user: Principal): Promise<Array<Video>>;
    isCallerAdmin(): Promise<boolean>;
    isMonetizationEligible(user: Principal): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    saveCallerUserProfile(username: string, bio: string): Promise<void>;
}
