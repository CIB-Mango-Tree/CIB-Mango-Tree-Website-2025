import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Fullscreen,
} from "lucide-react";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { cn } from "@utils/classMerge";
import type { ReactElement, FC } from "react";

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackValue, setTrackValue] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handlePlayToggle = useCallback((): void => {
    if (videoRef.current == null) return;
    if (!videoRef.current.paused) {
      videoRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    (async (): Promise<void> => {
      await videoRef.current?.play();
      setIsPlaying(true);
      if (!hasStarted) setHasStarted(true);
    })();
  }, [isPlaying]);
  const handleTimeUpdate = useCallback((): void => {
    if (videoRef.current == null) return;

    const currentTime: number = videoRef.current.currentTime;

    if (currentTime !== trackValue) setTrackValue(currentTime);
  }, [trackValue]);
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
      return;
    }
    if (e.key === "ArrowDown") {
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

  useEffect((): (() => void) => {
    window.addEventListener("keydown", handleKeyDown);
    if (autoPlay != null) setIsPlaying(autoPlay);
    if (start != null && start > 0) setTrackValue(start);

    return (): void => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative group/video-player rounded-xl", className)}>
      {poster && !hasStarted && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-xl z-10 pointer-events-none cursor-pointer"
        />
      )}
      <video
        ref={videoRef}
        className="w-full h-auto aspect-video object-cover rounded-xl z-0 cursor-pointer"
        preload="off"
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayToggle}
        aria-label={label}
        muted={muted}
        autoPlay={autoPlay}
        playsInline
      >
        <source src={src} type={type} />
        Your browser does not support video playback. You may download the video
        <a
          download="file"
          href="CIB_Mango_Tree_Demo.mp4"
          className="decoration-2"
        >
          here
        </a>
        .
      </video>
      <div className="absolute left-0 right-0 bottom-4 grid grid-cols-12 gap-x-2 px-4 w-full z-20">
        <div className="grid col-span-1 items-center">
          <Button
            type="button"
            size="sm"
            onClick={handlePlayToggle}
            className="cursor-pointer"
          >
            {isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
          </Button>
        </div>
        <div className="grid col-span-10 items-center">
          <Slider
            max={videoRef.current?.duration || 100}
            step={1}
            value={trackValue}
            onValueChange={handleTrackChange}
            className="cursor-pointer"
          />
        </div>
        <div className="grid col-span-1 grid-flow-col items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" size="sm" className="cursor-pointer" />
              }
            >
              {volume === 0 && <Volume />}
              {volume > 0 && volume <= 0.5 && <Volume1 />}
              {volume > 0.5 && volume <= 1 && <Volume2 />}
            </DropdownMenuTrigger>
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
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" size="sm" className="cursor-pointer">
            <Fullscreen />
          </Button>
        </div>
      </div>
    </div>
  );
}
