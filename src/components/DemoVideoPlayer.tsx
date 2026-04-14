import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useIsMobile } from "@hooks/use-mobile";
import { cn } from "@utils/classMerge";

export type DemoVideoPlayerProps = {
  src: string;
  poster: string;
  className?: string;
};

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.5, 2] as const;

function rateLabel(rate: number): string {
  return rate === 1 ? "1×" : `${rate}×`;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return type === "text" || type === "search" || type === "email" || type === "url";
  }
  return false;
}

export function DemoVideoPlayer({
  src,
  poster,
  className,
}: DemoVideoPlayerProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const isMobile = useIsMobile();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [portraitMobile, setPortraitMobile] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => {
        /* autoplay policy: ignore */
      });
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const seekToRatio = useCallback((ratio: number) => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    const next = Math.min(1, Math.max(0, ratio)) * dur;
    v.currentTime = next;
    setProgress(next);
  }, []);

  const setRate = useCallback((rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    setSpeedMenuOpen(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onDocKeyDown = (e: KeyboardEvent): void => {
      const root = rootRef.current;
      if (!root) return;

      const targetInPlayer = root.contains(e.target as Node);
      const fsHere = document.fullscreenElement === root;
      if (!targetInPlayer && !fsHere) return;

      if (isEditableTarget(e.target)) return;

      if (e.key === "Escape") {
        if (speedMenuOpen) {
          e.preventDefault();
          setSpeedMenuOpen(false);
          return;
        }
        if (fsHere) {
          e.preventDefault();
          void document.exitFullscreen();
        }
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
        return;
      }

      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    document.addEventListener("keydown", onDocKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onDocKeyDown, true);
    };
  }, [speedMenuOpen, toggleFullscreen, toggleMute, togglePlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime = (): void => {
      if (!scrubbingRef.current) {
        setProgress(v.currentTime);
      }
    };
    const onMeta = (): void => {
      setDuration(v.duration || 0);
    };
    const onPlay = (): void => {
      setPlaying(true);
    };
    const onPause = (): void => {
      setPlaying(false);
    };
    const onVolume = (): void => {
      setMuted(v.muted);
    };
    const onFs = (): void => {
      setIsFs(document.fullscreenElement === rootRef.current);
    };
    const endScrub = (): void => {
      scrubbingRef.current = false;
    };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVolume);
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("pointerup", endScrub);
    window.addEventListener("pointercancel", endScrub);

    setMuted(v.muted);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVolume);
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("pointerup", endScrub);
      window.removeEventListener("pointercancel", endScrub);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined") {
      setPortraitMobile(false);
      return;
    }
    const mql = window.matchMedia("(orientation: portrait)");
    const sync = (): void => {
      setPortraitMobile(mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => {
      mql.removeEventListener("change", sync);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!speedMenuOpen) return;
    const close = (e: MouseEvent): void => {
      const el = speedMenuRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, [speedMenuOpen]);

  const dur = duration;
  const ratio = dur > 0 ? progress / dur : 0;

  return (
    <div
      className={cn(
        "max-md:relative max-md:left-1/2 max-md:w-screen max-md:max-w-[100vw] max-md:-translate-x-1/2",
        isMobile && "max-md:min-h-[100dvh] max-md:bg-black",
        isMobile && portraitMobile && "max-md:flex max-md:flex-col max-md:justify-center",
        className,
      )}
    >
      <div
        ref={rootRef}
        role="region"
        aria-label="CIB Mango Tree demo video"
        tabIndex={0}
        onPointerDownCapture={() => {
          rootRef.current?.focus({ preventScroll: true });
        }}
        className={cn(
          "group relative rounded-xl bg-mango-green-darkest outline-none ring-offset-2 ring-offset-cyan-tint focus-visible:ring-2 focus-visible:ring-mango-yellow",
          speedMenuOpen ? "overflow-visible" : "overflow-hidden",
          isMobile && "max-md:rounded-none max-md:ring-offset-0",
          isMobile &&
            !portraitMobile &&
            "max-md:landscape:flex max-md:landscape:max-h-[100dvh] max-md:landscape:min-h-0 max-md:landscape:w-full max-md:landscape:flex-col max-md:landscape:justify-center",
        )}
      >
        <video
          ref={videoRef}
          className={cn(
            "block h-auto w-full cursor-pointer",
            isMobile &&
              "max-md:max-h-[min(85dvh,100vw)] max-md:w-full max-md:object-contain",
            isMobile &&
              !portraitMobile &&
              "max-md:landscape:max-h-[calc(100dvh-5rem)] max-md:landscape:w-full max-md:landscape:object-contain",
          )}
          poster={poster}
          preload="metadata"
          playsInline
          onClick={togglePlay}
        >
          <source src={src} type="video/mp4" />
        </video>

        {isMobile && portraitMobile && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 flex justify-center px-4"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 rounded-full bg-black/75 px-4 py-2.5 text-center text-sm font-medium text-white shadow-lg backdrop-blur-sm">
              <Smartphone className="size-5 shrink-0 text-mango-yellow" aria-hidden />
              <ArrowLeftRight className="size-4 shrink-0 text-mango-yellow/90" aria-hidden />
              <span>Rotate your phone sideways for full-width video</span>
            </div>
          </div>
        )}

        {!playing && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
            aria-hidden
          >
            <button
              type="button"
              aria-label="Play demo video"
              className="pointer-events-auto rounded-full bg-mango-yellow p-5 text-mango-green-dark shadow-lg transition-transform duration-200 ease-[var(--ease-default)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-mango-green-dark focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              <Play className="size-10" fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        )}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10 transition-opacity duration-300 md:gap-3 md:px-4 md:pb-4",
            playing ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          )}
        >
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            className="shrink-0 rounded-md p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-mango-yellow focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {playing ? (
              <Pause className="size-6" aria-hidden />
            ) : (
              <Play className="size-6" fill="currentColor" aria-hidden />
            )}
          </button>

          <span className="w-10 shrink-0 text-right font-mono text-[10px] text-white/90 tabular-nums sm:w-11 sm:text-xs">
            {formatTime(progress)}
          </span>

          <input
            aria-label="Seek in video"
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={Number.isFinite(ratio) ? ratio : 0}
            onPointerDown={(e) => {
              e.stopPropagation();
              scrubbingRef.current = true;
            }}
            onInput={(e) => {
              seekToRatio(Number((e.target as HTMLInputElement).value));
            }}
            onChange={(e) => {
              seekToRatio(Number((e.target as HTMLInputElement).value));
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-2 min-h-[44px] min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 py-[18px] accent-mango-yellow [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-mango-yellow [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mango-yellow"
          />

          <span className="w-10 shrink-0 font-mono text-[10px] text-white/70 tabular-nums sm:w-11 sm:text-xs">
            {formatTime(dur)}
          </span>

          <div
            className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div ref={speedMenuRef} className="relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1.5 font-mono text-xs font-semibold text-white/95 transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-mango-yellow focus-visible:outline-none"
                aria-haspopup="listbox"
                aria-expanded={speedMenuOpen}
                aria-label={`Playback speed, currently ${rateLabel(playbackRate)}`}
                onClick={() => {
                  setSpeedMenuOpen((o) => !o);
                }}
              >
                {rateLabel(playbackRate)}
                {speedMenuOpen ? (
                  <ChevronDown className="size-3.5 opacity-80" aria-hidden />
                ) : (
                  <ChevronUp className="size-3.5 opacity-80" aria-hidden />
                )}
              </button>
              {speedMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Playback speed"
                  className="absolute bottom-full left-0 z-30 mb-1 flex min-w-[5.5rem] flex-col gap-0.5 rounded-lg bg-black/95 p-1 shadow-xl ring-1 ring-white/15 backdrop-blur-sm"
                >
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      role="option"
                      aria-selected={playbackRate === rate}
                      className={cn(
                        "rounded-md px-3 py-2 text-left font-mono text-xs font-semibold transition-colors",
                        playbackRate === rate
                          ? "bg-mango-yellow/90 text-mango-green-dark"
                          : "text-white/90 hover:bg-white/15",
                      )}
                      onClick={() => {
                        setRate(rate);
                      }}
                    >
                      {rateLabel(rate)}
                    </button>
                  ))}
                </div>
              )}
            </div>

          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            className="shrink-0 rounded-md p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-mango-yellow focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {muted ? (
              <VolumeX className="size-5" aria-hidden />
            ) : (
              <Volume2 className="size-5" aria-hidden />
            )}
          </button>

          <button
            type="button"
            aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
            className="shrink-0 rounded-md p-1.5 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-mango-yellow focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              void toggleFullscreen();
            }}
          >
            {isFs ? (
              <Minimize2 className="size-5" aria-hidden />
            ) : (
              <Maximize2 className="size-5" aria-hidden />
            )}
          </button>
          </div>
        </div>

        <p className="sr-only">
          Keyboard: Space toggles play and pause. Escape exits fullscreen. F toggles
          fullscreen, M toggles mute. K toggles play and pause.
        </p>
      </div>
    </div>
  );
}
