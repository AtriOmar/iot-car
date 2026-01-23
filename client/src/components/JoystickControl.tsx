import { useCallback, useRef } from "react";
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
