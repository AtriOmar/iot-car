import { useCallback, useRef, useEffect } from "react";
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

interface JoystickControlProps {
  onMove: (direction: JoystickDirection) => void;
  onStop: () => void;
  disabled?: boolean;
}

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
        onMove(mappedDirection);
      }
    },
    [disabled, onMove, onStop],
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
      const validKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "W",
        "a",
        "A",
        "s",
        "S",
        "d",
        "D",
      ];

      if (!validKeys.includes(key)) return;

      e.preventDefault();

      if (pressedKeysRef.current.has(key)) return;

      pressedKeysRef.current.add(key);
      const direction = getKeyboardDirection();

      if (direction !== "stop" && direction !== lastDirectionRef.current) {
        lastDirectionRef.current = direction;
        isMovingRef.current = true;
        onMove(direction);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key;
      const validKeys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "W",
        "a",
        "A",
        "s",
        "S",
        "d",
        "D",
      ];

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
        onMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, onMove, onStop, getKeyboardDirection]);

  return (
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
  );
}
