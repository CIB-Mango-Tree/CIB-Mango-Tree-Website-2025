import { useCallback } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import type { VideoPlayerStore, VideoPlayerActions } from "@lib/stores/video";


export function usePlayToggle(): (() => void) {
  const { videoRef } = useVideoPlayerRefs();
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>((store: VideoPlayerStore): VideoPlayerActions["setEvent"] => store.actions.setEvent);
  const setEvents = useVideoPlayerContext<VideoPlayerActions["setEvents"]>((store: VideoPlayerStore): VideoPlayerActions["setEvents"] => store.actions.setEvents);
  const setValue = useVideoPlayerContext<VideoPlayerActions["setValue"]>((store: VideoPlayerStore): VideoPlayerActions["setValue"] => store.actions.setValue);
  const hasStarted = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.hasStarted);
  const hasEnded = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.hasEnded);
  const isPlaying = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.isPlaying);

  return useCallback((): void => {
    if (videoRef.current == null) return;

    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setEvent("isPlaying", false);
      setValue("iconFlash", "pause");
      return;
    }

    (async (): Promise<void> => {
      if (hasEnded) {
        videoRef.current!.currentTime = 0;
        setValue("time", 0);
        setEvents({
          isRestarting: true,
          hasEnded: false
        });
      }

      if (!hasStarted) {
        setEvents({
          isStarting: true,
          hasStarted: true
        });
      }
      await videoRef.current?.play();
      setEvent("isPlaying", true);
    })();
  }, [isPlaying, hasStarted, hasEnded]);
}
