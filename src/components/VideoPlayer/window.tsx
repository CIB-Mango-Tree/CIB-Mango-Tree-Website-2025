import { useEffect, useCallback } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs, useVideoPlayerContextStore } from "@lib/contexts/video";
import { usePlayToggle } from "@hooks/use-play-toggle";
import { cn } from "@utils/classMerge";
import { VIDEO_PLAYER_VOLUME } from "@utils/constants";
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
  const handlePlayToggle = usePlayToggle();
  const { videoRef, containerRef } = useVideoPlayerRefs();
  const store = useVideoPlayerContextStore();
  const time: number = useVideoPlayerContext(
    (state: VideoPlayerStore): number => state.state.values.time,
  );
  const isFullscreen: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.isFullscreen,
  );
  const hasStarted: boolean = useVideoPlayerContext(
    (state: VideoPlayerStore): boolean => state.state.events.hasStarted,
  );
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>(
    (state: VideoPlayerStore): VideoPlayerActions["setEvent"] =>
      state.actions.setEvent,
  );
  const setEvents = useVideoPlayerContext<VideoPlayerActions["setEvents"]>(
    (state: VideoPlayerStore): VideoPlayerActions["setEvents"] =>
      state.actions.setEvents,
  );
  const setValue = useVideoPlayerContext<VideoPlayerActions["setValue"]>(
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
  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (videoRef.current == null) return;

    const tagName = (e.target as HTMLElement).tagName;

    if (
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      tagName === "SELECT" ||
      tagName === "BUTTON"
    )
      return;

    if (e.key === "Escape") {
      const { isSpeedMenuOpen, isVolumeMenuOpen, isFullscreen } = store.getState().state.events;
      if (isSpeedMenuOpen) {
        e.preventDefault();
        store.getState().actions.setEvent("isSpeedMenuOpen", false);
        return;
      }
      if (isVolumeMenuOpen) {
        e.preventDefault();
        store.getState().actions.setEvent("isVolumeMenuOpen", false);
        return;
      }
      if (isFullscreen) {
        e.preventDefault();
        void document.exitFullscreen();
      }
      return;
    }

    e.preventDefault();

    if (e.key === " ") {
      handlePlayToggle();
      return;
    }
    if (e.key === "ArrowUp") {
      const { volume } = store.getState().state.values;
      const incrementedVolume: number = volume + 0.05;
      const newVolume: number = incrementedVolume > 1 ? 1 : incrementedVolume;
      videoRef.current!.volume = newVolume;

      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(newVolume));
      setValue("volume", newVolume);
      return;
    }
    if (e.key === "ArrowDown") {
      const { volume } = store.getState().state.values;
      const decrementedVolume: number = volume - 0.05;
      const newVolume = decrementedVolume < 0 ? 0 : decrementedVolume;

      videoRef.current!.volume = newVolume;
      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(newVolume));
      setValue("volume", newVolume);
      return;
    }
    if (e.key === "ArrowLeft") {
      const { time } = store.getState().state.values;
      const newTime: number = time - 5;
      videoRef.current.currentTime = newTime;

      setValue("time", newTime);
      return;
    }
    if (e.key === "ArrowRight") {
      const { time } = store.getState().state.values;
      const newTime: number = time + 5;
      videoRef.current.currentTime = newTime;

      setValue("time", newTime);
      return;
    }
  }, [videoRef, handlePlayToggle]);
  const handleFullscreenChange = useCallback((): void => {
    if (containerRef.current == null) return;
    if (document.fullscreenElement == null) setEvent("isFullscreen", false);
  }, []);
  const handleLoadedMetadata = useCallback((): void => {
    if (videoRef.current == null) return;
    setValue("duration", videoRef.current.duration);
  }, []);
  const posterClasses: string = cn(
    "absolute inset-0 h-full w-full object-cover z-10 pointer-events-none",
    {
      "rounded-none": isFullscreen,
      "rounded-xl": !isFullscreen,
    },
  );
  const videoClasses: string = cn(
    "block h-full w-full object-cover z-0",
    {
      "rounded-none": isFullscreen,
      "rounded-xl": !isFullscreen,
    },
  );

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [handleKeyDown, handleFullscreenChange]);

  useEffect((): void => {
    const { volume } = store.getState().state.values;
    const volumeSliderValue: string | null =
      window.localStorage.getItem(VIDEO_PLAYER_VOLUME);

    if (volumeSliderValue != null) {
      const volumeSliderValueNum: number = parseFloat(volumeSliderValue);

      if (volumeSliderValueNum !== volume) setValue("volume", volumeSliderValueNum);
    }
    if (volumeSliderValue == null) {
      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(volume));
    }
    if (autoPlay != null) setValue("autoPlay", autoPlay);
  }, []);

  return (
    <>
      {poster && !hasStarted && (
        <img src={poster} alt={`${label} poster`} className={posterClasses} />
      )}
      <video
        ref={videoRef}
        className={videoClasses}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onClick={handlePlayToggle}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
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
