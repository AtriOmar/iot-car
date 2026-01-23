// Car command types (matching server types)
export type CarMoveAction =
  | "forward"
  | "backward"
  | "left"
  | "right"
  | "forward_left"
  | "forward_right"
  | "backward_left"
  | "backward_right"
  | "stop";
export type CarToggleAction = "on" | "off";
export type CarLedId = 1 | 2;

export type CarMoveCommand = {
  type: "move";
  action: CarMoveAction;
  speed?: number;
  duration?: number;
};

export type CarBeepCommand = {
  type: "beep";
  action: CarToggleAction;
  duration?: number;
};

export type CarLedCommand = {
  type: "led";
  led: CarLedId;
  action: CarToggleAction;
};

export type CarCommand = CarMoveCommand | CarBeepCommand | CarLedCommand;

// WebSocket message types
export type WebSocketMessage = {
  type: "text" | "binary";
  data: string | ArrayBuffer;
};

export type WSControlMessage = {
  type: "control";
  action: string;
  id?: string;
  functionCallParams?: string;
  error?: {
    type: string;
    code?: string;
    message: string;
  };
};

export type WSTextDeltaMessage = {
  type: "text_delta";
  id: string;
  delta: string;
};

export type AIResponse = {
  id: string;
  text: string;
  message?: string;
  commands?: CarCommand[];
  timestamp: Date;
};

export type ConnectionState = "disconnected" | "connecting" | "connected";
