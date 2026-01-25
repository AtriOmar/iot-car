import { useCallback, useRef, useEffect, useState } from "react";
import Joystick, { Direction, DirectionCount } from "rc-joystick";
// import "./JoystickControl.css";

export type JoystickDirection =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "forward_left"
  | "forward_right"
  | "backward_left"
  | "backward_right"
  | "stop";

export type SpeedLevel = "low" | "medium" | "fast";

interface JoystickControlProps {
  onMove: (direction: JoystickDirection, speed: number) => void;
  onStop: () => void;
  disabled?: boolean;
}

// Speed mappings
const SPEED_VALUES: Record<SpeedLevel, number> = {
  low: 130,
  medium: 180,
  fast: 255,
};

// Map rc-joystick Direction to our CarMoveAction
function mapDirection(direction: Direction): JoystickDirection {
  switch (direction) {
    case Direction.Top:
      return "forward";
    case Direction.Bottom:
      return "backward";
    case Direction.Left:
      return "left";
    case Direction.Right:
      return "right";
    case Direction.TopLeft:
      return "forward_left";
    case Direction.RightTop:
      return "forward_right";
    case Direction.LeftBottom:
      return "backward_left";
    case Direction.BottomRight:
      return "backward_right";
    case Direction.Center:
    default:
      return "stop";
  }
}

export function JoystickControl({
  onMove,
  onStop,
  disabled,
}: JoystickControlProps) {
  const lastDirectionRef = useRef<JoystickDirection>("stop");
  const isMovingRef = useRef(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [currentSpeed, setCurrentSpeed] = useState<SpeedLevel>("low");

  const handleChange = useCallback(
    (event: { direction: Direction; distance: number }) => {
      if (disabled) return;

      const { direction, distance } = event;

      // If center or very small distance, treat as stop
      if (direction === Direction.Center || distance < 0.15) {
        if (isMovingRef.current) {
          isMovingRef.current = false;
          lastDirectionRef.current = "stop";
          onStop();
        }
        return;
      }

      const mappedDirection = mapDirection(direction);

      // Only send command if direction changed
      if (mappedDirection !== lastDirectionRef.current) {
        lastDirectionRef.current = mappedDirection;
        isMovingRef.current = true;
        onMove(mappedDirection, SPEED_VALUES[currentSpeed]);
      }
    },
    [disabled, onMove, onStop, currentSpeed],
  );

  // Determine direction based on pressed keys
  const getKeyboardDirection = useCallback((): JoystickDirection => {
    const keys = pressedKeysRef.current;
    const up = keys.has("ArrowUp") || keys.has("w") || keys.has("W");
    const down = keys.has("ArrowDown") || keys.has("s") || keys.has("S");
    const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
    const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");

    if (up && left) return "forward_left";
    if (up && right) return "forward_right";
    if (down && left) return "backward_left";
    if (down && right) return "backward_right";
    if (up) return "forward";
    if (down) return "backward";
    if (left) return "left";
    if (right) return "right";
    return "stop";
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      // Handle speed control keys
      if (key === "q") {
        e.preventDefault();
        setCurrentSpeed("low");
        return;
      }
      if (key === "s") {
        e.preventDefault();
        setCurrentSpeed("medium");
        return;
      }
      if (key === "d") {
        e.preventDefault();
        setCurrentSpeed("fast");
        return;
      }

      const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (!validKeys.includes(key)) return;

      e.preventDefault();

      if (pressedKeysRef.current.has(key)) return;

      pressedKeysRef.current.add(key);
      const direction = getKeyboardDirection();

      if (direction !== "stop" && direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        isMovingRef.current = true;
        onMove(direction, SPEED_VALUES[currentSpeed]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (!validKeys.includes(key)) return;

      e.preventDefault();

      pressedKeysRef.current.delete(key);
      const direction = getKeyboardDirection();

      if (direction === "stop") {
        if (isMovingRef.current) {
          isMovingRef.current = false;
          lastDirectionRef.current = "stop";
          onStop();
        }
      } else if (direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        onMove(direction, SPEED_VALUES[currentSpeed]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, onMove, onStop, getKeyboardDirection, currentSpeed]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Speed Indicator */}
      <div className="flex gap-1 text-xs">
        <div className="text-gray-400">Speed:</div>
        <button
          onClick={() => setCurrentSpeed("low")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            currentSpeed === "low"
              ? "bg-blue-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          1: Low
        </button>
        <button
          onClick={() => setCurrentSpeed("medium")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            currentSpeed === "medium"
              ? "bg-yellow-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          2: Medium
        </button>
        <button
          onClick={() => setCurrentSpeed("fast")}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            currentSpeed === "fast"
              ? "bg-red-500 text-white"
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          3: Fast
        </button>
      </div>

      {/* Joystick */}
      <div
        className={`joystick-dark flex items-center ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Joystick
          baseRadius={70}
          controllerRadius={35}
          directionCount={DirectionCount.Nine}
          throttle={50}
          onChange={handleChange}
        />
      </div>

      {/* Current Speed Value */}
      <div className="text-gray-400 text-xs">
        Speed: {SPEED_VALUES[currentSpeed]}
      </div>
    </div>
  );
}
