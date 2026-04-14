import { useRef, useState, useEffect, useCallback } from "react";
import { createVideoPlayerStore } from "@lib/stores/video";
import { VideoPlayerContext } from "@lib/contexts/video";
import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  Fullscreen,
  RotateCcw,
} from "lucide-react";
import { VideoPlayerContainer } from "@components/VideoPlayer/container";
import { VideoPlayerWindow } from "@components/VideoPlayer/window";
import { VideoPlayerControlBar } from "@components/VideoPlayer/controls";
import { VideoPlayerIconOverlay } from "@components/VideoPlayer/overlays";
import { Button } from "@components/ui/button";
import { Slider, TrackSlider } from "@components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@components/ui/tooltip";
import { cn } from "@utils/classMerge";
import { formatTime } from "@utils/format";
import { usingMobilePointer } from "@lib/mobile";
import { VIDEO_PLAYER_VOLUME } from "@utils/constants";
import type { ReactElement, FC } from "react";
import type { VideoPlayerStoreApi } from "@lib/contexts/video";

export interface VideoPlayerProps {
  src: string;
  type: string;
  poster?: string;
  label?: string;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
}

export default function VideoPlayer({
  src,
  type,
  poster,
  className,
  autoPlay = false,
  muted = false,
  label = "cibmangotree video player",
}: VideoPlayerProps): ReactElement<FC> {
  const [store] = useState<VideoPlayerStoreApi>(createVideoPlayerStore());
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVolumeMenuOpen, setIsVolumeMenuOpen] = useState<boolean>(false);
  const [fullscreenTransition, setFullscreenTransition] =
    useState<boolean>(false);
  const [trackValue, setTrackValue] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [buffered, setBuffered] = useState<number>(0);
  const [iconFlash, setIconFlash] = useState<"play" | "pause" | null>(null);
  const wasPlaying = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handlePlayToggle = useCallback((): void => {
    if (videoRef.current == null) return;

    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setIsPlaying(false);
      setIconFlash("pause");
      return;
    }

    (async (): Promise<void> => {
      if (hasEnded) {
        videoRef.current!.currentTime = 0;
        setTrackValue(0);
        setIsRestarting(true);
        setHasEnded(false);
      }

      if (!hasStarted) {
        setIsStarting(true);
        setHasStarted(true);
      }
      await videoRef.current?.play();
      setIsPlaying(true);
    })();
  }, [isPlaying, hasStarted, hasEnded]);
  const handleEnded = useCallback((): void => {
    setHasEnded(true);
    setHasStarted(false);
    setIsPlaying(false);
  }, []);
  const handleTimeUpdate = useCallback((): void => {
    if (videoRef.current == null) return;
    if (!hasStarted) return;

    handleProgress();

    const currentTime: number = videoRef.current.currentTime;

    if (currentTime !== trackValue) setTrackValue(currentTime);
  }, [trackValue, hasStarted]);
  const handleTrackChange = useCallback(
    (value: number | readonly number[]): void => {
      if (videoRef.current == null) return;

      const currentTime = value as number;

      if (currentTime === videoRef.current.currentTime) return;
      if (currentTime < duration && hasEnded) {
        setIsRestarting(true);
        setHasStarted(true);
        setHasEnded(false);
      }

      videoRef.current.currentTime = currentTime;
      setTrackValue(currentTime);
    },
    [hasEnded],
  );
  const handleVolumeChange = useCallback(
    (value: number | readonly number[]): void => {
      if (videoRef.current == null) return;
      const currentVolume = value as number;

      if (currentVolume === videoRef.current?.volume) return;

      videoRef.current.volume = currentVolume;
      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(currentVolume));
      setVolume(currentVolume);
    },
    [],
  );
  const handleVolumeMenuOpen = useCallback(
    (open: boolean): void => setIsVolumeMenuOpen(open),
    [],
  );
  const handleProgress = useCallback((): void => {
    if (videoRef.current == null) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) setBuffered(buf.end(buf.length - 1));
  }, []);
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

    e.preventDefault();

    if (e.key === " ") {
      handlePlayToggle();
      return;
    }
    if (e.key === "ArrowUp") {
      setVolume((state: number): number => {
        const incrementedValue: number = state + 0.05;
        const newValue = incrementedValue > 1 ? 1 : incrementedValue;
        videoRef.current!.volume = newValue;
        window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(newValue));

        return newValue;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      setVolume((state: number): number => {
        const decrementedValue: number = state - 0.05;
        const newValue = decrementedValue < 0 ? 0 : decrementedValue;
        videoRef.current!.volume = newValue;
        window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(newValue));

        return newValue;
      });
      return;
    }
    if (e.key === "ArrowLeft") {
      setTrackValue((state: number): number => {
        state -= 5;
        videoRef.current!.currentTime = state;
        return state;
      });
      return;
    }
    if (e.key === "ArrowRight") {
      setTrackValue((state: number): number => {
        state += 5;
        videoRef.current!.currentTime = state;
        return state;
      });
      return;
    }
  }, []);
  const handleFullscreenToggle = useCallback((): void => {
    if (containerRef.current == null) return;

    setFullscreenTransition(true);
    setTimeout(() => setFullscreenTransition(false), 200);

    if (document.fullscreenElement != null) {
      document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    if (!usingMobilePointer()) {
      containerRef.current.requestFullscreen();
    } else {
      videoRef.current?.requestFullscreen();
    }

    setIsFullscreen(true);
  }, []);
  const handleFullscreenChange = useCallback((): void => {
    if (containerRef.current == null) return;
    if (document.fullscreenElement == null) setIsFullscreen(false);
  }, []);

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const volumeSliderValue: string | null =
      window.localStorage.getItem(VIDEO_PLAYER_VOLUME);

    if (volumeSliderValue != null) {
      const volumeSliderValueNum: number = parseFloat(volumeSliderValue);

      if (volumeSliderValueNum !== volume) setVolume(volumeSliderValueNum);
    }
    if (volumeSliderValue == null) {
      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(volume));
    }
    if (autoPlay != null) setIsPlaying(autoPlay);

    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect((): (() => void) | undefined => {
    if (iconFlash == null) return;

    const timeout = setTimeout((): void => setIconFlash(null), 700);

    return (): void => clearTimeout(timeout);
  }, [iconFlash]);

  useEffect((): (() => void) | undefined => {
    if (!isStarting) return;
    const timeout = setTimeout((): void => {
      setIsStarting(false);
      setHasStarted(true);
    }, 250);
    return (): void => clearTimeout(timeout);
  }, [isStarting]);

  useEffect((): (() => void) | undefined => {
    if (!isRestarting) return;
    const timeout = setTimeout((): void => setIsRestarting(false), 250);
    return (): void => clearTimeout(timeout);
  }, [isRestarting]);

  useEffect(() => {
    if (isPlaying && !wasPlaying.current && !isStarting && !isRestarting) {
      setIconFlash("play");
    }
    wasPlaying.current = isPlaying;
  }, [isPlaying, isStarting, isRestarting]);

  return (
    <VideoPlayerContext.Provider value={store}>
      <TooltipProvider>
        <VideoPlayerContainer className={className}>
          <VideoPlayerIconOverlay />
          <VideoPlayerWindow
            src={src}
            type={type}
            poster={poster}
            label={label}
            muted={muted}
            autoPlay={autoPlay}
          />
          <VideoPlayerControlBar />
        </VideoPlayerContainer>
      </TooltipProvider>
    </VideoPlayerContext.Provider>
  );
}
