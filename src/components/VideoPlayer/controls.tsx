import { forwardRef } from "react";
import {useVideoPlayerContext} from "@lib/contexts/video";
import {Play, Pause, RotateCcw, Volume, Volume1, Volume2, Fullscreen} from "lucide-react";
import { Button } from "@components/ui/button";
import {Tooltip, TooltipTrigger, TooltipContent} from "@components/ui/tooltip";
import {Slider, TrackSlider} from "@components/ui/slider";
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent} from "@components/ui/dropdown-menu";
import { cn } from "@utils/classMerge";
import {formatTime} from "@utils/format";
import type { ReactElement, FC, PropsWithChildren } from "react";
import type {VideoPlayerStore, VideoPlayerActions} from "@lib/stores/video";

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
  const setEvent = useVideoPlayerContext<VideoPlayerActions["setEvent"]>((store: VideoPlayerStore): VideoPlayerActions["setEvent"] => store.actions.setEvent);
  const setValue = useVideoPlayerContext<VideoPlayerActions["setValue"]>((store: VideoPlayerStore): VideoPlayerActions["setValue"] => store.actions.setValue);

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
            {fullscreenTransition ? (
              <VideoControlButton onClick={handleFullscreenToggle}>
                <Fullscreen />
              </VideoControlButton>
            ) : (
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
                  container={
                    isFullscreen ? containerRef.current : document.body
                  }
                >
                  {!isFullscreen ? "Enter Fullscreen" : "Exit Fullscreen"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

  );
}
