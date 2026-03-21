import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Fullscreen,
  RotateCcw,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
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
} from "@components/ui/tooltip";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC, PropsWithChildren } from "react";

export interface VideoPlayerProps {
  src: string;
  type: string;
  poster?: string;
  start?: number;
  label?: string;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onVolume?: () => void;
  onFullscreen?: () => void;
  onNormalScreen?: () => void;
  onTrack?: () => void;
}

export interface VideoControlButtonProps extends PropsWithChildren {
  onClick?: () => void;
  className?: string;
}

export function VideoControlButton({
  onClick,
  className,
  children,
}: VideoControlButtonProps): ReactElement<FC> {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </Button>
  );
}

export default function VideoPlayer({
  src,
  type,
  poster,
  className,
  start,
  autoPlay = false,
  muted = false,
  label = "cibmangotree video player",
}: VideoPlayerProps): ReactElement<FC> {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [trackValue, setTrackValue] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handlePlayToggle = useCallback((): void => {
    if (videoRef.current == null) return;

    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    (async (): Promise<void> => {
      if (hasEnded) {
        videoRef.current!.currentTime = 0;
        setHasEnded(false);
      }

      await videoRef.current?.play();
      setIsPlaying(true);
      if (!hasStarted) setHasStarted(true);
    })();
  }, [isPlaying]);
  const handleEnded = useCallback((): void => {
    setHasEnded(true);
    setIsPlaying(false);
  }, []);
  const handleTimeUpdate = useCallback((): void => {
    if (videoRef.current == null) return;
    if (!hasStarted) return;

    const currentTime: number = videoRef.current.currentTime;

    if (currentTime !== trackValue) setTrackValue(currentTime);
  }, [trackValue, hasStarted]);
  const handleTrackChange = useCallback(
    (value: number | readonly number[]): void => {
      if (videoRef.current == null) return;

      const currentTime = value as number;

      if (currentTime === videoRef.current.currentTime) return;

      videoRef.current.currentTime = currentTime;
      setTrackValue(currentTime);
    },
    [],
  );
  const handleVolumeChange = useCallback(
    (value: number | readonly number[]): void => {
      if (videoRef.current == null) return;
      const currentVolume = value as number;

      if (currentVolume === videoRef.current?.volume) return;

      videoRef.current.volume = currentVolume;
      setVolume(currentVolume);
    },
    [],
  );
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

        return newValue;
      });
      return;
    }
    if (e.key === "ArrowDown") {
      setVolume((state: number): number => {
        const decrementedValue: number = state - 0.05;
        const newValue = decrementedValue < 0 ? 0 : decrementedValue;
        videoRef.current!.volume = newValue;

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
    if (document.fullscreenElement != null) {
      document.exitFullscreen();
      setIsFullscreen(false);
      return;
    }

    containerRef.current.requestFullscreen();
    setIsFullscreen(true);
  }, []);
  const handleFullscreenChange = useCallback((): void => {
    if (containerRef.current == null) return;
    if (document.fullscreenElement == null) setIsFullscreen(false);
  }, []);
  const handleLoadedMetadata = useCallback((): void => {
    if (videoRef.current == null) return;
    setDuration(videoRef.current.duration);
  }, []);
  const formatTime = (currentTime: number): string => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  const containerClasses: string = cn("relative", className, {
    "rounded-none": isFullscreen,
    "rounded-xl": !isFullscreen,
  });
  const posterClasses: string = cn(
    "absolute inset-0 w-full h-auto object-cover z-10 pointer-events-none",
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

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    if (autoPlay != null) setIsPlaying(autoPlay);
    if (start != null) setTrackValue(start);

    return (): void => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className={containerClasses}>
      {poster && !hasStarted && (
        <img src={poster} alt={`${label} poster`} className={posterClasses} />
      )}
      <video
        ref={videoRef}
        className={videoClasses}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
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
      <div className="absolute left-0 right-0 bottom-4 grid grid-cols-12 gap-x-2 px-4 w-full z-20">
        <div className="grid col-span-2 grid-flow-col items-center">
          <VideoControlButton onClick={handlePlayToggle} className="w-20">
            {hasEnded && <RotateCcw />}
            {isPlaying && !hasEnded && <Pause fill="white" />}
            {!isPlaying && !hasEnded && <Play fill="white" />}
          </VideoControlButton>
          <span className="text-white text-sm">{formatTime(trackValue)}</span>
        </div>
        <div className="grid col-span-9 items-center">
          <Slider
            max={duration}
            step={1}
            value={trackValue}
            onValueChange={handleTrackChange}
            className="cursor-pointer"
          />
        </div>
        <div className="grid col-span-1 grid-flow-col items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger render={<VideoControlButton />}>
              {volume === 0 && <Volume />}
              {volume > 0 && volume <= 0.5 && <Volume1 />}
              {volume > 0.5 && volume <= 1 && <Volume2 />}
            </DropdownMenuTrigger>
            <DropdownMenuPortal
              container={isFullscreen ? containerRef.current : document.body}
            >
              <DropdownMenuContent
                side="top"
                align="center"
                className="min-w-none w-8"
              >
                <Slider
                  orientation="vertical"
                  max={1}
                  step={0.01}
                  value={volume}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
          <VideoControlButton onClick={handleFullscreenToggle}>
            <Fullscreen />
          </VideoControlButton>
        </div>
      </div>
    </div>
  );
}
