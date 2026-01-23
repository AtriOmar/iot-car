import { useCallback, useRef, useState } from "react";
import "./SpeedSlider.css";

interface SpeedSliderProps {
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const MIN_SPEED = 130;
const MAX_SPEED = 255;
const DEFAULT_SPEED = MIN_SPEED;

export function SpeedSlider({ onSpeedChange, disabled }: SpeedSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(DEFAULT_SPEED);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lastSpeedRef = useRef(DEFAULT_SPEED);

  const calculateSpeed = useCallback((clientY: number) => {
    if (!sliderRef.current) return DEFAULT_SPEED;

    const rect = sliderRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = 1 - Math.max(0, Math.min(1, relativeY / rect.height));
    const speed = Math.round(MIN_SPEED + percentage * (MAX_SPEED - MIN_SPEED));
    return speed;
  }, []);

  const handleStart = useCallback(
    (clientY: number) => {
      if (disabled) return;
      setIsDragging(true);
      const speed = calculateSpeed(clientY);
      setCurrentSpeed(speed);
      if (speed !== lastSpeedRef.current) {
        lastSpeedRef.current = speed;
        onSpeedChange(speed);
      }
    },
    [disabled, calculateSpeed, onSpeedChange],
  );

  const handleMove = useCallback(
    (clientY: number) => {
      if (disabled || !isDragging) return;
      const speed = calculateSpeed(clientY);
      setCurrentSpeed(speed);
      if (Math.abs(speed - lastSpeedRef.current) > 5) {
        lastSpeedRef.current = speed;
        onSpeedChange(speed);
      }
    },
    [disabled, isDragging, calculateSpeed, onSpeedChange],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setCurrentSpeed(DEFAULT_SPEED);
    lastSpeedRef.current = DEFAULT_SPEED;
    onSpeedChange(DEFAULT_SPEED);
  }, [isDragging, onSpeedChange]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientY);
    },
    [handleStart],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientY);
    },
    [handleMove],
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleEnd();
    }
  }, [isDragging, handleEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientY);
    },
    [handleStart],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientY);
    },
    [handleMove],
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Calculate the thumb position (inverted: 0% at bottom, 100% at top)
  const thumbPosition =
    ((currentSpeed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100;

  // Get color based on speed
  const getSpeedColor = () => {
    if (currentSpeed < 160) return "from-cyan-500 to-cyan-600";
    if (currentSpeed < 210) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  return (
    <div
      className={`speed-slider-container ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Speed label */}
      <div className="mb-1 text-center">
        <span className="font-medium text-[10px] text-gray-400">SPEED</span>
      </div>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="speed-slider-track"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fill */}
        <div
          className={`speed-slider-fill bg-linear-to-t ${getSpeedColor()}`}
          style={{ height: `${thumbPosition}%` }}
        />

        {/* Thumb */}
        <div
          className={`speed-slider-thumb ${isDragging ? "scale-110" : ""}`}
          style={{ bottom: `${thumbPosition}%` }}
        >
          <span className="font-bold text-[10px]">{currentSpeed}</span>
        </div>

        {/* Markers */}
        <div className="speed-slider-markers">
          <div className="speed-marker" style={{ bottom: "100%" }}>
            <span>255</span>
          </div>
          <div className="speed-marker" style={{ bottom: "50%" }}>
            <span>187</span>
          </div>
          <div className="speed-marker" style={{ bottom: "0%" }}>
            <span>130</span>
          </div>
        </div>
      </div>
    </div>
  );
}
