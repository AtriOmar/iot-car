import { useCallback, useRef } from "react";
import Joystick, { Direction, DirectionCount } from "rc-joystick";

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
  onMove: (direction: JoystickDirection, speed: number) => void;
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

// Map distance (0-1) to speed (120-255)
function getSpeed(distance: number): number {
  const minSpeed = 120;
  const maxSpeed = 255;
  // Clamp distance between 0 and 1
  const clampedDistance = Math.min(1, Math.max(0, distance));
  return Math.round(minSpeed + clampedDistance * (maxSpeed - minSpeed));
}

export function JoystickControl({
  onMove,
  onStop,
  disabled,
}: JoystickControlProps) {
  const lastDirectionRef = useRef<JoystickDirection>("stop");
  const lastSpeedRef = useRef<number>(0);
  const isMovingRef = useRef(false);

  const handleChange = useCallback(
    (event: { direction: Direction; distance: number }) => {
      if (disabled) return;

      const { direction, distance } = event;

      console.log(
        "-------------------- direction, distance --------------------",
      );
      console.log(direction, distance);

      // If center or very small distance, treat as stop
      if (direction === Direction.Center || distance < 0.15) {
        if (isMovingRef.current) {
          isMovingRef.current = false;
          lastDirectionRef.current = "stop";
          lastSpeedRef.current = 0;
          onStop();
        }
        return;
      }

      const mappedDirection = mapDirection(direction);
      const speed = getSpeed(distance);

      // Only send command if direction or speed changed significantly
      const speedChanged = Math.abs(speed - lastSpeedRef.current) > 10;
      const directionChanged = mappedDirection !== lastDirectionRef.current;

      if (directionChanged || speedChanged) {
        lastDirectionRef.current = mappedDirection;
        lastSpeedRef.current = speed;
        isMovingRef.current = true;
        onMove(mappedDirection, speed);
      }
    },
    [disabled, onMove, onStop],
  );

  return (
    <div
      className={`flex items-center justify-center ${disabled ? "opacity-50 pointer-events-none" : ""}`}
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
