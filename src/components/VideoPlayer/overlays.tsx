import { useRef, useEffect, useCallback } from "react";
import { useVideoPlayerContext } from "@lib/contexts/video";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@utils/classMerge";
import { EMPTY } from "@utils/constants";
import type { ReactElement, FC } from "react";
import type {
  VideoPlayerStore,
  VideoPlayerActions,
  IconFlash,
} from "@lib/stores/video";

export function VideoPlayerIconOverlay(): ReactElement<FC> {
  const wasPlaying = useRef<boolean>(false);
  const iconFlash: IconFlash = useVideoPlayerContext(
    (state: VideoPlayerStore): IconFlash => state.state.values.iconFlash,
  );
  const hasStarted: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.hasStarted,
  );
  const isStarting: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isStarting,
  );
  const isPlaying: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isPlaying,
  );
  const hasEnded: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.hasEnded,
  );
  const isRestarting: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isRestarting,
  );
  const setEvent: VideoPlayerActions["setEvent"] = useVideoPlayerContext(
    (state: VideoPlayerStore): VideoPlayerActions["setEvent"] =>
      state.actions.setEvent,
  );
  const setEvents: VideoPlayerActions["setEvents"] = useVideoPlayerContext(
    (state: VideoPlayerStore): VideoPlayerActions["setEvents"] =>
      state.actions.setEvents,
  );
  const setValue: VideoPlayerActions["setValue"] = useVideoPlayerContext(
    (state: VideoPlayerStore): VideoPlayerActions["setValue"] =>
      state.actions.setValue,
  );
  const handlePlay = useCallback((): void => setEvent("isPlaying", true), []);

  useEffect((): (() => void) | undefined => {
    if (iconFlash == null) return;

    const timeout = setTimeout((): void => setValue("iconFlash", EMPTY), 700);

    return (): void => clearTimeout(timeout);
  }, [iconFlash]);

  useEffect((): (() => void) | undefined => {
    if (!isStarting) return;
    const timeout = setTimeout((): void => {
      setEvents({
        isStarting: false,
        hasStarted: true,
      });
    }, 250);
    return (): void => clearTimeout(timeout);
  }, [isStarting]);

  useEffect((): (() => void) | undefined => {
    if (!isRestarting) return;
    const timeout = setTimeout(
      (): void => setEvent("isRestarting", false),
      250,
    );
    return (): void => clearTimeout(timeout);
  }, [isRestarting]);

  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isStarting && !isRestarting) {
      setValue("iconFlash", "play");
    }
    wasPlaying.current = isPlaying;
  }, [isPlaying, isStarting, isRestarting]);

  return (
    <>
      {iconFlash !== EMPTY && (
        <div className="absolute inset-1/2 -translate-1/2 size-24 z-20 flex items-center justify-center pointer-events-none animate-fade-in-out-media-icon">
          {iconFlash === "pause" && (
            <Pause fill="white" stroke="white" className="size-24" />
          )}
          {iconFlash === "play" && (
            <Play fill="white" stroke="white" className="size-24" />
          )}
        </div>
      )}
      {(!hasStarted || isStarting) && !hasEnded && !isRestarting && (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "absolute inset-1/2 -translate-1/2 size-24 z-20 cursor-pointer",
            isStarting && "animate-fade-out-media-icon",
          )}
          onClick={handlePlay}
        >
          <Play fill="white" stroke="white" className="size-24" />
        </Button>
      )}
      {(hasEnded || isRestarting) && (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "absolute inset-1/2 -translate-1/2 size-24 z-20 cursor-pointer pointer-events-auto",
            hasEnded && !isRestarting && "animate-fade-in-media-icon",
            isRestarting && "animate-fade-out-media-icon pointer-events-none",
          )}
          onClick={handlePlay}
        >
          <RotateCcw stroke="white" className="size-24" />
        </Button>
      )}
    </>
  );
}
