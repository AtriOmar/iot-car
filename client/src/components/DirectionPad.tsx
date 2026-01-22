import { useCallback } from "react";

type Direction = "forward" | "backward" | "left" | "right";

interface DirectionPadProps {
  onDirectionStart: (direction: Direction) => void;
  onDirectionEnd: () => void;
  disabled?: boolean;
}

export function DirectionPad({
  onDirectionStart,
  onDirectionEnd,
  disabled,
}: DirectionPadProps) {
  const handlePointerDown = useCallback(
    (direction: Direction) => {
      if (disabled) return;
      onDirectionStart(direction);
    },
    [onDirectionStart, disabled],
  );

  const handlePointerUp = useCallback(() => {
    if (disabled) return;
    onDirectionEnd();
  }, [onDirectionEnd, disabled]);

  const handlePointerLeave = useCallback(() => {
    if (disabled) return;
    onDirectionEnd();
  }, [onDirectionEnd, disabled]);

  const buttonBaseClass = `
    w-16 h-16 border-none rounded-xl 
    bg-linear-to-br from-slate-600 to-slate-700
    text-white cursor-pointer flex items-center justify-center
    transition-all duration-150 ease-out
    shadow-lg shadow-black/30
    touch-none select-none
    hover:from-slate-500 hover:to-slate-600
    active:scale-95 active:shadow-md
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-slate-600 disabled:hover:to-slate-700
  `;

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Up Button */}
      <button
        className={buttonBaseClass}
        onPointerDown={() => handlePointerDown("forward")}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        disabled={disabled}
        aria-label="Move forward"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
      </button>

      {/* Middle Row */}
      <div className="flex items-center gap-2">
        {/* Left Button */}
        <button
          className={buttonBaseClass}
          onPointerDown={() => handlePointerDown("left")}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          disabled={disabled}
          aria-label="Turn left"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 12l8-8v5h8v6h-8v5z" />
          </svg>
        </button>

        {/* Center */}
        <div className="flex justify-center items-center w-12 h-12 text-gray-600">
          <svg
            className="w-6 h-6 opacity-30"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>

        {/* Right Button */}
        <button
          className={buttonBaseClass}
          onPointerDown={() => handlePointerDown("right")}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          disabled={disabled}
          aria-label="Turn right"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 12l-8 8v-5h-8v-6h8v-5z" />
          </svg>
        </button>
      </div>

      {/* Down Button */}
      <button
        className={buttonBaseClass}
        onPointerDown={() => handlePointerDown("backward")}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        disabled={disabled}
        aria-label="Move backward"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20l8-8h-5v-8h-6v8h-5z" />
        </svg>
      </button>
    </div>
  );
}
