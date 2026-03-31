import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@utils/classMerge";
import { formatTime } from "@utils/format";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

function TrackSlider({
  className,
  defaultValue,
  value,
  bufferValue,
  tooltip = true,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props & { bufferValue: number; tooltip?: boolean }) {
  const controlRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const [hoverX, setHoverX] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const bufferPercent = React.useMemo(() => {
    if (bufferValue == null || max === 0) return 0;
    return Math.min((bufferValue / max) * 100, 100);
  }, [bufferValue, max]);
  const updateHoverFromEvent = React.useCallback(
    (clientX: number): void => {
      if (controlRef.current == null || max === 0) return;
      const rect = controlRef.current.getBoundingClientRect();
      const thumbHalf = thumbRef.current
        ? thumbRef.current.getBoundingClientRect().width / 2
        : 0;
      const effectiveWidth = rect.width - thumbHalf * 2;
      const offsetX = clientX - rect.left - thumbHalf;
      const percent = Math.max(0, Math.min(1, offsetX / effectiveWidth));

      setHoverValue(Math.round(percent * max));
      setHoverX(clientX - rect.left);
    },
    [max],
  );
  const handleTrackMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      updateHoverFromEvent(e.clientX);
    },
    [updateHoverFromEvent],
  );
  const handleTrackMouseLeave = React.useCallback((): void => {
    if (!isDragging) setHoverValue(null);
  }, [isDragging]);
  const handlePointerDown = React.useCallback((): void => {
    setIsDragging(true);
  }, []);

  React.useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent): void => {
      updateHoverFromEvent(e.clientX);
    };

    const handlePointerUp = (): void => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, updateHoverFromEvent]);

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        ref={controlRef}
        className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col"
        onMouseMove={handleTrackMouseMove}
        onMouseLeave={handleTrackMouseLeave}
        onPointerDown={handlePointerDown}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <div
            data-slot="slider-buffer"
            className="absolute left-0 top-0 h-full rounded-full bg-primary/30 transition-[width] duration-300 ease-linear"
            style={{ width: `${bufferPercent}%` }}
          />
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {tooltip && hoverValue != null && (
          <div
            data-slot="slider-hover-tooltip"
            className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none z-50 rounded-md bg-foreground px-2 py-1 text-xs text-white"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(isDragging ? (value as number) : hoverValue!)}
          </div>
        )}
        <SliderPrimitive.Thumb
          ref={thumbRef}
          data-slot="slider-thumb"
          className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider, TrackSlider };
