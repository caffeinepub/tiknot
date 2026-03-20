import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Types
  public type Video = {
    id : Text;
    title : Text;
    description : Text;
    tags : [Text];
    videoFile : Storage.ExternalBlob;
    creator : Principal;
    timestamp : Time.Time;
  };

  module Video {
    public func compare(v1 : Video, v2 : Video) : Order.Order {
      Int.compare(v1.timestamp, v2.timestamp);
    };
  };

  public type VideoStats = {
    videoId : Text;
    likeCount : Nat;
    viewCount : Nat;
    commentCount : Nat;
  };

  public type UserProfile = {
    username : Text;
    bio : Text;
    followers : Nat;
    following : Nat;
    totalViews : Nat;
    joinTimestamp : Time.Time;
  };

  public type Comment = {
    id : Text;
    videoId : Text;
    author : Principal;
    username : Text;
    text : Text;
    timestamp : Time.Time;
  };

  module Comment {
    public func compareByTimestamp(c1 : Comment, c2 : Comment) : Order.Order {
      Int.compare(c1.timestamp, c2.timestamp);
    };
  };

  // State
  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();
  var videos : Map.Map<Text, Video> = Map.empty<Text, Video>();
  var videoStats : Map.Map<Text, VideoStats> = Map.empty<Text, VideoStats>();
  var comments : Map.Map<Text, Comment> = Map.empty<Text, Comment>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(username : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Preserve existing stats if profile exists
    let existingProfile = userProfiles.get(caller);
    let profile : UserProfile = switch (existingProfile) {
      case (?existing) {
        {
          username;
          bio;
          followers = existing.followers;
          following = existing.following;
          totalViews = existing.totalViews;
          joinTimestamp = existing.joinTimestamp;
        };
      };
      case (null) {
        {
          username;
          bio;
          followers = 0;
          following = 0;
          totalViews = 0;
          joinTimestamp = Time.now();
        };
      };
    };
    userProfiles.add(caller, profile);
  };

  // Video Functions
  public shared ({ caller }) func createVideo(
    title : Text,
    description : Text,
    tags : [Text],
    videoFile : Storage.ExternalBlob
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create videos");
    };

    let id = title.concat(Time.now().toText());
    let video : Video = {
      id;
      title;
      description;
      tags;
      videoFile;
      creator = caller;
      timestamp = Time.now();
    };

    let stats : VideoStats = {
      videoId = id;
      likeCount = 0;
      viewCount = 0;
      commentCount = 0;
    };

    videos.add(id, video);
    videoStats.add(id, stats);
    id;
  };

  public query ({ caller }) func getVideo(videoId : Text) : async ?Video {
    videos.get(videoId);
  };

  public query ({ caller }) func getAllVideos() : async [Video] {
    videos.values().toArray().sort();
  };

  public query ({ caller }) func getVideosByUser(user : Principal) : async [Video] {
    let filtered = videos.values().toArray().filter(func(v) { v.creator == user });
    filtered.sort();
  };

  public query ({ caller }) func getTrendingVideos() : async [Video] {
    let statsArray = videoStats.values().toArray();
    let filteredStatsArray = statsArray.filter(
      func(stat) {
        let hasAssociatedVideo = switch (videos.get(stat.videoId)) {
          case (?_) { true };
          case (null) { false };
        };
        hasAssociatedVideo;
      }
    );
    let sortedStats = filteredStatsArray.sort(
      func(a, b) {
        Nat.compare(b.viewCount, a.viewCount); // Sort descending by view count
      }
    );

    let videosIter = Nat.range(0, Nat.min(10, sortedStats.size())).map(
      func(i) {
        switch (videos.get(sortedStats[i].videoId)) {
          case (?v) { v };
          case (null) {
            Runtime.trap("Video not found");
          };
        };
      }
    );

    videosIter.toArray();
  };

  // Video Stats Functions
  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };

    let stats = switch (videoStats.get(videoId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Video stats not found") };
    };

    let updatedStats : VideoStats = {
      stats with
      likeCount = stats.likeCount + 1;
    };

    videoStats.add(videoId, updatedStats);
  };

  public shared ({ caller }) func addView(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add views");
    };

    let stats = switch (videoStats.get(videoId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Video stats not found") };
    };

    let updatedStats : VideoStats = {
      stats with
      viewCount = stats.viewCount + 1;
    };

    videoStats.add(videoId, updatedStats);

    // Update creator's total views
    let video = switch (videos.get(videoId)) {
      case (?v) { v };
      case (null) { Runtime.trap("Video not found") };
    };
    let profile = switch (userProfiles.get(video.creator)) {
      case (?p) { p };
      case (null) { Runtime.trap("User profile not found") };
    };
    let updatedProfile : UserProfile = {
      profile with totalViews = profile.totalViews + 1
    };
    userProfiles.add(video.creator, updatedProfile);
  };

  // Validation Function
  public query ({ caller }) func isMonetizationEligible(user : Principal) : async Bool {
    switch (userProfiles.get(user)) {
      case (?profile) {
        profile.followers >= 10_000 and profile.totalViews >= 20_000_000
      };
      case (null) { false };
    };
  };

  // Comment System
  public shared ({ caller }) func addComment(
    videoId : Text,
    username : Text,
    text : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment");
    };

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (_) {};
    };

    let id = Time.now().toText().concat(caller.toText());

    let comment : Comment = {
      id;
      videoId;
      author = caller;
      username;
      text;
      timestamp = Time.now();
    };

    // Update video comment count
    let stats = switch (videoStats.get(videoId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Video stats not found") };
    };
    let updatedStats : VideoStats = {
      stats with
      commentCount = stats.commentCount + 1;
    };
    videoStats.add(videoId, updatedStats);

    comments.add(id, comment);
    id;
  };

  public query ({ caller }) func getCommentsByVideo(videoId : Text) : async [Comment] {
    let filtered = comments.values().toArray().filter(func(c) { c.videoId == videoId });
    let sorted = filtered.sort(
      func(a, b) {
        Int.compare(a.timestamp, b.timestamp);
      }
    );
    sorted;
  };

  public shared ({ caller }) func deleteComment(commentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    let comment = switch (comments.get(commentId)) {
      case (?c) { c };
      case (null) { Runtime.trap("Comment not found") };
    };

    if (caller != comment.author) {
      Runtime.trap("Unauthorized: Only comment author can delete");
    };

    // Update video comment count
    let stats = switch (videoStats.get(comment.videoId)) {
      case (?s) { s };
      case (null) { Runtime.trap("Video stats not found") };
    };
    let updatedStats : VideoStats = {
      stats with
      commentCount = if (stats.commentCount > 0) { stats.commentCount - 1 } else { 0 };
    };
    videoStats.add(comment.videoId, updatedStats);

    comments.remove(commentId);
  };
};
