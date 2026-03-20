# Tiknot

## Current State
Tiknot is a TikTok-inspired video sharing app with home feed, explore, upload, channel profile, video downloading, and monetization tracking. The backend has Video, VideoStats, and UserProfile types. No comments system exists yet.

## Requested Changes (Diff)

### Add
- Comment type with id, videoId, author (Principal), username, text, timestamp
- Backend functions: addComment, getCommentsByVideo, deleteComment (own comments only)
- VideoStats commentCount already exists — increment it on addComment
- Frontend: Comments panel/drawer on video cards (home feed and explore) showing comment list and add-comment input for logged-in users

### Modify
- VideoStats: commentCount already tracked, ensure it increments on new comment
- Home feed video cards and explore video page to show comment icon/count that opens the comments panel

### Remove
- Nothing removed

## Implementation Plan
1. Add Comment type and comments Map to backend
2. Add addComment, getCommentsByVideo, deleteComment functions
3. Update commentCount on addComment
4. Frontend: CommentsPanel component (slide-in drawer) with comment list and input
5. Wire comment icon on video cards to open CommentsPanel
6. Add useAddComment and useGetComments query hooks
