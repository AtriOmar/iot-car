export type WSMessage =
  | { id: string; type: "text_delta"; delta: string }
  | { id?: string; type: "transcription"; text: string }
  | { id: string; type: "user_message"; text: string }
  | {
      type: "control";
      action:
        | "speech_started"
        | "connected"
        | "text_done"
        | "function_call_output";
      functionCallParams?: string;
      id?: string;
    }
  | { type: "control"; action: "session_created"; id?: string }
  | { type: "control"; action: "error"; error: OpenAIError; id?: string }
  | {
      type: "control";
      action: "rate_limits_updated";
      rateLimits: RateLimits;
      id?: string;
    };

export type FunctionCallResponse = {
  type: "function_call_output";
  call_id: string;
  output: string;
};

export type SystemMessageTool = {
  type?: string;
  name?: string;
  description?: string;
  parameters?: any;
};

export type SystemMessage = {
  type:
    | "language-coach"
    | "medical-form"
    | "medical-question-answer"
    | "car-controller";
  initialInstructions: string;
  message: string;
  tools?: SystemMessageTool[];
};

export type AudioMetrics = {
  totalBytesSent: number;
  totalBatchesSent: number;
  maxBatchSize: number;
  lastSendTime: number;
  droppedChunks: number;
  avgLatency: number;
  lastResponseTime: number;
  sessionStartTime: number;
  totalResponses: number;
};

export type OpenAIError = {
  type: string;
  code?: string;
  message: string;
  event_id?: string;
};

export type RateLimits = {
  name: string;
  limit: number;
  remaining: number;
  reset_seconds: number;
};

// ==================== CAR CONTROL TYPES ====================

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
export type CarPlayAction = "pirates" | "got" | "squid" | "stop";

export type CarMoveCommand = {
  type: "move";
  action: CarMoveAction;
  speed?: number; // 130 (slow), 180 (medium), 255 (fast), defaults to 130
  duration?: number; // milliseconds, null = indefinite until stop
};

export type CarBeepCommand = {
  type: "beep";
  action: CarToggleAction;
  duration?: number; // milliseconds, null = indefinite until off
};

export type CarLedCommand = {
  type: "led";
  led: CarLedId;
  action: CarToggleAction;
};

export type CarPlayCommand = {
  type: "play";
  action: CarPlayAction; // "pirates" for Pirates of the Caribbean, "stop" to stop melody
};

export type CarCommand =
  | CarMoveCommand
  | CarBeepCommand
  | CarLedCommand
  | CarPlayCommand;

export type CarCommandSequence = {
  commands: CarCommand[];
};

// Message from frontend to directly control car (bypasses AI)
export type CarDirectControl = {
  type: "car_direct_control";
  commands: CarCommand[];
};

// Message sent to ESP32
export type CarControlMessage = {
  type: "car_control";
  commands: CarCommand[];
};
