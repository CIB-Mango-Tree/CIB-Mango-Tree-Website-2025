import { useCallback, useRef, forwardRef } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import { usingMobilePointer } from "@lib/mobile";
import { usePlayToggle } from "@hooks/use-play-toggle";
import { Play, Pause, RotateCcw, Volume, Volume1, Volume2, Fullscreen, Gauge } from "lucide-react";
import { Button } from "@components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components/ui/tooltip";
import { Slider, TrackSlider } from "@components/ui/slider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { cn } from "@utils/classMerge";
import { formatTime } from "@utils/format";
import { VIDEO_PLAYER_VOLUME, PLAYBACK_RATES } from "@utils/constants";
import type { ReactElement, FC, PropsWithChildren, PointerEvent } from "react";
import type { VideoPlayerStore, VideoPlayerActions } from "@lib/stores/video";

const videoControlSurfaceClasses = "border-white/15 bg-black/60 text-white backdrop-blur-md hover:bg-black/75 hover:text-white focus-visible:border-white/40 focus-visible:ring-white/40 aria-expanded:bg-black/80 aria-expanded:text-white";
const videoMenuSurfaceClasses = "border border-white/15 bg-black/70 text-white ring-white/15 backdrop-blur-md";
const progressSliderClasses = "[&_[data-slot=slider-track]]:bg-mango-yellow-light [&_[data-slot=slider-buffer]]:bg-mango-yellow-light/70 [&_[data-slot=slider-range]]:bg-mango-yellow [&_[data-slot=slider-thumb]]:border-mango-green-light [&_[data-slot=slider-thumb]]:bg-mango-green-light [&_[data-slot=slider-thumb]]:ring-mango-green-light/40 [&_[data-slot=slider-thumb]:hover]:ring-mango-green-light/35 [&_[data-slot=slider-hover-tooltip]]:bg-black/75 [&_[data-slot=slider-hover-tooltip]]:text-white";
const volumeSliderClasses = "[&_[data-slot=slider-track]]:bg-white/25 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:ring-white/40 [&_[data-slot=slider-thumb]:hover]:ring-white/35";

export interface VideoControlButtonProps extends PropsWithChildren {
  onClick?: () => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLButtonElement>) => void;
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
      className={cn("cursor-pointer", videoControlSurfaceClasses, className)}
      {...props}
    >
      {children}
    </Button>
  );
});

export function VideoPlayerControlBar(): ReactElement<FC> {
  const handlePlayToggle = usePlayToggle();
  const { videoRef, containerRef } = useVideoPlayerRefs();
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>((store: VideoPlayerStore): VideoPlayerActions["setEvent"] => store.actions.setEvent);
  const setEvents = useVideoPlayerContext<VideoPlayerActions["setEvents"]>((store: VideoPlayerStore): VideoPlayerActions["setEvents"] => store.actions.setEvents);
  const setValue = useVideoPlayerContext<VideoPlayerActions["setValue"]>((store: VideoPlayerStore): VideoPlayerActions["setValue"] => store.actions.setValue);
  const hasEnded = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.hasEnded);
  const isFullscreen = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.isFullscreen);
  const isPlaying = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.isPlaying);
  const isVolumeMenuOpen = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.isVolumeMenuOpen);
  const isSpeedMenuOpen = useVideoPlayerContext<boolean>((store: VideoPlayerStore): boolean => store.state.events.isSpeedMenuOpen);
  const playbackRate = useVideoPlayerContext<number>((store: VideoPlayerStore): number => store.state.values.playbackRate);
  const time = useVideoPlayerContext<number>((store: VideoPlayerStore): number => store.state.values.time);
  const duration = useVideoPlayerContext<number>((store: VideoPlayerStore): number => store.state.values.duration);
  const volume = useVideoPlayerContext<number>((store: VideoPlayerStore): number => store.state.values.volume);
  const buffered = useVideoPlayerContext<number>((store: VideoPlayerStore): number => store.state.values.buffered);
  const speedMenuViewportRef = useRef({ x: 0, y: 0 });
  const rememberSpeedMenuViewport = useCallback((): void => {
    speedMenuViewportRef.current = { x: window.scrollX, y: window.scrollY };
  }, []);
  const restoreSpeedMenuViewport = useCallback((wasFullscreen = false): void => {
    const { x, y } = speedMenuViewportRef.current;

    requestAnimationFrame((): void => {
      window.scrollTo(x, y);

      if (
        wasFullscreen &&
        document.fullscreenElement == null &&
        containerRef.current != null
      ) {
        void containerRef.current.requestFullscreen().catch(() => undefined);
      }

      requestAnimationFrame((): void => window.scrollTo(x, y));
    });
  }, []);
  const handleTrackChange = useCallback(
    (value: number | readonly number[]): void => {
      if (videoRef.current == null) return;

      const currentTime = value as number;

      if (currentTime === videoRef.current.currentTime) return;
      if (currentTime < videoRef.current.duration && hasEnded) {
        setEvents({
          isRestarting: true,
          hasStarted: true,
          hasEnded: false
        });
      }

      videoRef.current.currentTime = currentTime;
      setValue("time", currentTime);
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
      setValue("volume", currentVolume);
    },
    [],
  );
  const handleVolumeMenuOpen = useCallback(
    (open: boolean): void => setEvent("isVolumeMenuOpen", open),
    [],
  );
  const handleSpeedMenuOpen = useCallback(
    (open: boolean): void => {
      setEvent("isSpeedMenuOpen", open);
      restoreSpeedMenuViewport();
    },
    [],
  );
  const handlePlaybackRateChange = useCallback(
    (value: string): void => {
      if (videoRef.current == null) return;
      const wasFullscreen = document.fullscreenElement != null;
      const rate = parseFloat(value);
      videoRef.current.playbackRate = rate;
      setValue("playbackRate", rate);
      restoreSpeedMenuViewport(wasFullscreen);
    },
    [],
  );
  const handleFullscreenToggle = useCallback((): void => {
    if (containerRef.current == null) return;

    setEvent("fullscreenTransition", true);
    setTimeout(() => setEvent("fullscreenTransition", false), 200);

    if (document.fullscreenElement != null) {
      document.exitFullscreen();
      setEvent("isFullscreen", false);
      return;
    }

    if (!usingMobilePointer()) {
      containerRef.current.requestFullscreen();
    } else {
      videoRef.current?.requestFullscreen();
    }

    setEvent("isFullscreen", true);
  }, []);

  return (
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
        <div className="inline-flex w-12 justify-center rounded-md bg-black/60 px-2 py-1 text-white backdrop-blur-md">
          <span className="text-white text-sm">
            {formatTime(time)}
          </span>
        </div>
      </div>
      <div className="grid items-center">
        <TrackSlider
          max={duration}
          step={1}
          value={time}
          bufferValue={buffered}
          onValueChange={handleTrackChange}
          className={cn("cursor-pointer", progressSliderClasses)}
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
            <DropdownMenuContent
              container={containerRef}
              side="top"
              align="center"
              className={cn("min-w-none w-8", videoMenuSurfaceClasses)}
            >
              <Slider
                orientation="vertical"
                max={1}
                step={0.01}
                value={volume}
                onValueChange={handleVolumeChange}
                className={cn("cursor-pointer", volumeSliderClasses)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent
            className="text-white"
            container={isFullscreen ? containerRef.current : document.body}
          >
            Volume
          </TooltipContent>
        </Tooltip>
        <Tooltip disabled={isSpeedMenuOpen}>
          <DropdownMenu
            open={isSpeedMenuOpen}
            onOpenChange={handleSpeedMenuOpen}
          >
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <VideoControlButton
                      className="font-mono text-xs"
                      onPointerDown={rememberSpeedMenuViewport}
                      onPointerUp={() => restoreSpeedMenuViewport()}
                    />
                  }
                >
                  <Gauge className="size-4" />
                  <span className="ml-1">{playbackRate === 1 ? "1×" : `${playbackRate}×`}</span>
                </DropdownMenuTrigger>
              }
            />
            <DropdownMenuContent
              container={containerRef}
              side="top"
              align="center"
              className={cn("min-w-[6rem]", videoMenuSurfaceClasses)}
            >
              <DropdownMenuLabel className="text-white/70">Speed</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuRadioGroup
                value={String(playbackRate)}
                onValueChange={handlePlaybackRateChange}
              >
                {PLAYBACK_RATES.map((rate) => (
                  <DropdownMenuRadioItem
                    key={rate}
                    value={String(rate)}
                    onPointerDown={rememberSpeedMenuViewport}
                    onPointerUp={() => restoreSpeedMenuViewport()}
                    className="cursor-pointer font-mono text-sm text-white focus:bg-white/15 focus:text-white focus:**:text-white data-checked:bg-white/15 data-checked:text-white"
                  >
                    {rate === 1 ? "Normal" : `${rate}×`}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <TooltipContent
            className="text-white"
            container={isFullscreen ? containerRef.current : document.body}
          >
            Playback Speed
          </TooltipContent>
        </Tooltip>
        <Tooltip key={isFullscreen ? "fullscreen-toggle:active" : "fullscreen-toggle:inactive"}>
          <TooltipTrigger
            render={
              <VideoControlButton onClick={handleFullscreenToggle}>
                <Fullscreen />
              </VideoControlButton>
            }
          />
          <TooltipContent
            className="text-white"
            container={
              isFullscreen ? containerRef.current : document.body
            }
          >
            {!isFullscreen ? "Enter Fullscreen" : "Exit Fullscreen"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
