import { useRef, useEffect, useCallback } from "react";
import { useVideoPlayerContext } from "@lib/contexts/video";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC } from "react";
import type { VideoPlayerStore, VideoPlayerActions } from "@lib/stores/video";

export interface VideoPlayerWindowProps {
  src: string;
  type: string;
  poster?: string;
  label?: string;
  muted?: boolean;
  autoPlay?: boolean;
}

export function VideoPlayerWindow({
  src,
  type,
  poster,
  label,
  muted = false,
  autoPlay = false,
}: VideoPlayerWindowProps): ReactElement<FC> {
  const videoRef = useRef<HTMLVideoElement>(null);
  const time: number = useVideoPlayerContext(
    (state: VideoPlayerStore): number => state.state.values.time,
  );
  const isPlaying: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isPlaying,
  );
  const isFullscreen: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isFullscreen,
  );
  const hasStarted: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.hasStarted,
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
  const handleEnded = useCallback((): void => {
    setEvents({
      hasEnded: true,
      hasStarted: false,
      isPlaying: false,
    });
  }, []);
  const handleProgress = useCallback((): void => {
    if (videoRef.current == null) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) setValue("buffered", buf.end(buf.length - 1));
  }, []);
  const handleTimeUpdate = useCallback((): void => {
    if (videoRef.current == null) return;
    if (!hasStarted) return;

    handleProgress();

    const currentTime: number = videoRef.current.currentTime;

    if (currentTime !== time) setValue("time", currentTime);
  }, [time, hasStarted]);
  const handlePlayToggle = useCallback(
    (): void => setEvent("isPlaying", !isPlaying),
    [isPlaying],
  );
  const posterClasses: string = cn(
    "absolute inset-0 w-full h-auto object-cover aspect-video z-10 pointer-events-none",
    {
      "rounded-none": isFullscreen,
      "rounded-xl": !isFullscreen,
    },
  );
  const videoClasses: string = cn(
    "w-full h-auto aspect-video object-cover z-0",
    {
      "rounded-none": isFullscreen,
      "rounded-xl": !isFullscreen,
    },
  );

  return (
    <>
      {poster && !hasStarted && (
        <img src={poster} alt={`${label} poster`} className={posterClasses} />
      )}
      <video
        ref={videoRef}
        className={videoClasses}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onClick={handlePlayToggle}
        onEnded={handleEnded}
        aria-label={label}
        muted={muted}
        autoPlay={autoPlay}
        playsInline
      >
        <source src={src} type={type} />
        Your browser does not support video playback. You may download the video
        <a download="file" href={src} className="decoration-2">
          here
        </a>
        .
      </video>
    </>
  );
}
