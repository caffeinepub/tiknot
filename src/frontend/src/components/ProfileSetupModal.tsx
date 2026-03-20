import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal({ open }: { open: boolean }) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const { mutateAsync, isPending } = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      await mutateAsync({ username: username.trim(), bio: bio.trim() });
      toast.success("Channel created! Welcome to Tiknot 🎬");
    } catch {
      toast.error("Failed to create channel. Please try again.");
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="bg-tiknot-surface border-border max-w-md"
        data-ocid="profile_setup.dialog"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-display brand-gradient-text">
            Create Your Channel
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your Tiknot channel to start uploading videos and connecting
            with your audience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm">
              Channel Name
            </Label>
            <Input
              id="username"
              data-ocid="profile_setup.input"
              placeholder="@yourchannel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-sm">
              Bio
            </Label>
            <Textarea
              id="bio"
              data-ocid="profile_setup.textarea"
              placeholder="Tell the world about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-background border-border resize-none"
              rows={3}
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !username.trim()}
            className="w-full brand-gradient text-white font-semibold"
            data-ocid="profile_setup.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Channel 🎬"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
