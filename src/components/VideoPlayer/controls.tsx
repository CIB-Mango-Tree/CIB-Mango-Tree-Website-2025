import { useCallback, forwardRef } from "react";
import { useVideoPlayerContext, useVideoPlayerRefs } from "@lib/contexts/video";
import { usingMobilePointer } from "@lib/mobile";
import { usePlayToggle } from "@hooks/use-play-toggle";
import { Play, Pause, RotateCcw, Volume, Volume1, Volume2, Fullscreen, Gauge } from "lucide-react";
import { Button } from "@components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@components/ui/tooltip";
import { Slider, TrackSlider } from "@components/ui/slider";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator } from "@components/ui/dropdown-menu";
import { cn } from "@utils/classMerge";
import { formatTime } from "@utils/format";
import { VIDEO_PLAYER_VOLUME, PLAYBACK_RATES } from "@utils/constants";
import type { ReactElement, FC, PropsWithChildren } from "react";
import type { VideoPlayerStore, VideoPlayerActions } from "@lib/stores/video";

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
    (open: boolean): void => setEvent("isSpeedMenuOpen", open),
    [],
  );
  const handlePlaybackRateChange = useCallback(
    (value: string): void => {
      if (videoRef.current == null) return;
      const rate = parseFloat(value);
      videoRef.current.playbackRate = rate;
      setValue("playbackRate", rate);
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
        <div className="inline-flex justify-center w-10">
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
        <Tooltip disabled={isSpeedMenuOpen}>
          <DropdownMenu
            open={isSpeedMenuOpen}
            onOpenChange={handleSpeedMenuOpen}
          >
            <TooltipTrigger
              render={
                <DropdownMenuTrigger render={<VideoControlButton className="font-mono text-xs" />}>
                  <Gauge className="size-4" />
                  <span className="ml-1">{playbackRate === 1 ? "1×" : `${playbackRate}×`}</span>
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
                className="min-w-[6rem]"
              >
                <DropdownMenuLabel>Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={String(playbackRate)}
                  onValueChange={handlePlaybackRateChange}
                >
                  {PLAYBACK_RATES.map((rate) => (
                    <DropdownMenuRadioItem key={rate} value={String(rate)} className="cursor-pointer font-mono text-sm">
                      {rate === 1 ? "Normal" : `${rate}×`}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenuPortal>
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
