import { useRef, useState, useEffect, useCallback, forwardRef } from "react";
import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  Fullscreen,
  RotateCcw,
} from "lucide-react";
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

export const VideoControlButton = forwardRef<
  HTMLButtonElement,
  VideoControlButtonProps
>(({ onClick, className, children, ...props }, ref): ReactElement<FC> => {
  return (
    <Button
      ref={ref}
      type="button"
      size="sm"
      onClick={onClick}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </Button>
  );
});

const VIDEO_PLAYER_VOLUME = "video_player_volume";

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
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isVolumeMenuOpen, setIsVolumeMenuOpen] = useState<boolean>(false);
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
  const handleLoadedMetadata = useCallback((): void => {
    if (videoRef.current == null) return;
    setDuration(videoRef.current.duration);
  }, []);
  const containerClasses: string = cn("relative", className, {
    "rounded-none": isFullscreen,
    "rounded-xl": !isFullscreen,
  });
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

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const volumeSliderValue: string | null =
      window.localStorage.getItem(VIDEO_PLAYER_VOLUME);

    if (volumeSliderValue != null) {
      const volumeSliderValueNum: number = parseInt(volumeSliderValue);

      if (volumeSliderValueNum !== volume) setVolume(volumeSliderValueNum);
    }
    if (volumeSliderValue == null) {
      window.localStorage.setItem(VIDEO_PLAYER_VOLUME, String(volume));
    }
    if (autoPlay != null) setIsPlaying(autoPlay);
    if (start != null) setTrackValue(start);

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
    <TooltipProvider>
      <div ref={containerRef} className={containerClasses}>
        {iconFlash && (
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
            onClick={handlePlayToggle}
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
            onClick={handlePlayToggle}
          >
            <RotateCcw stroke="white" className="size-24" />
          </Button>
        )}
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
          onLoadedMetadata={handleLoadedMetadata}
          aria-label={label}
          muted={muted}
          autoPlay={autoPlay}
          playsInline
        >
          <source src={src} type={type} />
          Your browser does not support video playback. You may download the
          video
          <a download="file" href={src} className="decoration-2">
            here
          </a>
          .
        </video>
        <div className="absolute left-0 right-0 bottom-4 grid grid-cols-[auto_1fr_auto] grid-flow-col gap-x-4 px-4 w-full z-20">
          <div className="grid grid-flow-col items-center justify-center gap-x-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <VideoControlButton
                    onClick={handlePlayToggle}
                    className="w-20"
                  >
                    {hasEnded && <RotateCcw />}
                    {isPlaying && !hasEnded && <Pause fill="white" />}
                    {!isPlaying && !hasEnded && <Play fill="white" />}
                  </VideoControlButton>
                }
              />
              <TooltipContent
                className="text-white"
                container={isFullscreen ? containerRef.current : document.body}
              >
                {isPlaying ? "Pause" : "Play"}
              </TooltipContent>
            </Tooltip>
            <div className="inline-flex justify-center w-10">
              <span className="text-white text-sm">
                {formatTime(trackValue)}
              </span>
            </div>
          </div>
          <div className="grid items-center">
            <TrackSlider
              max={duration}
              step={1}
              value={trackValue}
              bufferValue={buffered}
              onValueChange={handleTrackChange}
              className="cursor-pointer"
            />
          </div>
          <div className="grid grid-flow-col items-center justify-center gap-x-1">
            <Tooltip disabled={isVolumeMenuOpen}>
              <DropdownMenu
                open={isVolumeMenuOpen}
                onOpenChange={handleVolumeMenuOpen}
              >
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger render={<VideoControlButton />}>
                      {volume === 0 && <Volume />}
                      {volume > 0 && volume <= 0.5 && <Volume1 />}
                      {volume > 0.5 && volume <= 1 && <Volume2 />}
                    </DropdownMenuTrigger>
                  }
                />
                <DropdownMenuPortal
                  container={
                    isFullscreen ? containerRef.current : document.body
                  }
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
              <TooltipContent
                className="text-white"
                container={isFullscreen ? containerRef.current : document.body}
              >
                Volume
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <VideoControlButton onClick={handleFullscreenToggle}>
                    <Fullscreen />
                  </VideoControlButton>
                }
              />
              <TooltipContent
                className="text-white"
                container={isFullscreen ? containerRef.current : document.body}
              >
                {!isFullscreen ? "Enter Fullscreen" : "Exit Fullscreen"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
