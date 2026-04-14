import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@utils/classMerge";

export type DemoVideoPlayerProps = {
  src: string;
  poster: string;
  className?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DemoVideoPlayer({
  src,
  poster,
  className,
}: DemoVideoPlayerProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFs, setIsFs] = useState(false);

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
    if (!v || !Number.isFinite(duration) || duration <= 0) return;
    const next = Math.min(1, Math.max(0, ratio)) * duration;
    v.currentTime = next;
    setProgress(next);
  }, [duration]);

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
    const v = videoRef.current;
    if (!v) return;

    const onTime = (): void => {
      setProgress(v.currentTime);
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

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVolume);
    document.addEventListener("fullscreenchange", onFs);

    setMuted(v.muted);

    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVolume);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  const ratio = duration > 0 ? progress / duration : 0;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label="CIB Mango Tree demo video"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "k" || e.key === "K") {
          e.preventDefault();
          togglePlay();
        }
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          void toggleFullscreen();
        }
        if (e.key === "m" || e.key === "M") {
          e.preventDefault();
          toggleMute();
        }
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-mango-green-darkest outline-none ring-offset-2 ring-offset-cyan-tint focus-visible:ring-2 focus-visible:ring-mango-yellow",
        className,
      )}
    >
      <video
        ref={videoRef}
        className="block h-auto w-full cursor-pointer"
        poster={poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
      </video>

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
          "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 md:gap-3 md:px-4 md:pb-4",
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

        <span className="hidden w-11 shrink-0 text-right font-mono text-xs text-white/90 tabular-nums sm:inline">
          {formatTime(progress)}
        </span>

        <input
          aria-label="Seek in video"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={Number.isFinite(ratio) ? ratio : 0}
          onChange={(e) => {
            seekToRatio(Number(e.target.value));
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-mango-yellow [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mango-yellow"
        />

        <span className="hidden w-11 shrink-0 font-mono text-xs text-white/70 tabular-nums sm:inline">
          {formatTime(duration)}
        </span>

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
  );
}
