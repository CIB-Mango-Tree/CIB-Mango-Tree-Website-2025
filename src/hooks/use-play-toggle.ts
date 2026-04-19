import { useCallback } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import { EMPTY } from "@utils/constants";
import type {
  VideoPlayerStore,
  VideoPlayerActions,
  IconFlash,
} from "@lib/stores/video";

export function usePlayToggle(): () => void {
  const { videoRef } = useVideoPlayerRefs();
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>(
    (store: VideoPlayerStore): VideoPlayerActions["setEvent"] =>
      store.actions.setEvent,
  );
  const setEvents = useVideoPlayerContext<VideoPlayerActions["setEvents"]>(
    (store: VideoPlayerStore): VideoPlayerActions["setEvents"] =>
      store.actions.setEvents,
  );
  const setValue = useVideoPlayerContext<VideoPlayerActions["setValue"]>(
    (store: VideoPlayerStore): VideoPlayerActions["setValue"] =>
      store.actions.setValue,
  );
  const hasStarted = useVideoPlayerContext<boolean>(
    (store: VideoPlayerStore): boolean => store.state.events.hasStarted,
  );
  const hasEnded = useVideoPlayerContext<boolean>(
    (store: VideoPlayerStore): boolean => store.state.events.hasEnded,
  );
  const isPlaying = useVideoPlayerContext<boolean>(
    (store: VideoPlayerStore): boolean => store.state.events.isPlaying,
  );
  const isWaiting = useVideoPlayerContext<boolean>(
    (store: VideoPlayerStore): boolean => store.state.events.isWaiting,
  );
  const iconFlash = useVideoPlayerContext<IconFlash>(
    (store: VideoPlayerStore): IconFlash => store.state.values.iconFlash,
  );

  return useCallback((): void => {
    if (videoRef.current == null) return;
    if (isWaiting) return;

    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setEvent("isPlaying", false);
      if (iconFlash === EMPTY) setValue("iconFlash", "pause");
      return;
    }

    (async (): Promise<void> => {
      if (hasEnded) {
        videoRef.current!.currentTime = 0;
        setValue("time", 0);
        setEvents({
          isRestarting: true,
          hasEnded: false,
        });
      }

      if (!hasStarted) {
        setEvents({
          isStarting: true,
          hasStarted: true,
        });
      }

      if (hasStarted && iconFlash === EMPTY) {
        setValue("iconFlash", "play");
      }

      await videoRef.current?.play();
      setEvent("isPlaying", true);
    })();
  }, [isPlaying, hasStarted, hasEnded, iconFlash]);
}
