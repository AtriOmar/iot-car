// ==================== COMPACT COMMAND PROTOCOL ====================
/*
 * Compact array format: [msg, type, ...params]
 *
 * Type codes: 1=move, 2=led, 3=beep, 4=play, 5=dance
 *
 * Move (type=1): [msg, 1, action, speed, duration?]
 *   Actions: 0=stop, 1=forward, 2=backward, 3=left, 4=right, 5=fl, 6=fr, 7=bl, 8=br
 *
 * LED (type=2): [msg, 2, led_num, on_off]
 *
 * Beep (type=3): [msg, 3, on_off, duration?]
 *
 * Play (type=4): [msg, 4, song]
 *   Songs: 0=stop, 1=pirates, 2=got, 3=squid
 *
 * Dance (type=5): [msg, 5, dance_id]
 *   Dances: 1=spin(3s), 2=zigzag(4s), 3=disco(5s), 4=crazy(6s), 5=celebration(8s)
 */
export type CompactCommand = (string | number)[];

// Command type codes
export const CMD_MOVE = 1;
export const CMD_LED = 2;
export const CMD_BEEP = 3;
export const CMD_PLAY = 4;
export const CMD_DANCE = 5;

// Move action codes
export const ACT_STOP = 0;
export const ACT_FORWARD = 1;
export const ACT_BACKWARD = 2;
export const ACT_LEFT = 3;
export const ACT_RIGHT = 4;
export const ACT_FORWARD_LEFT = 5;
export const ACT_FORWARD_RIGHT = 6;
export const ACT_BACKWARD_LEFT = 7;
export const ACT_BACKWARD_RIGHT = 8;

// Play action codes
export const PLAY_STOP = 0;
export const PLAY_PIRATES = 1;
export const PLAY_GOT = 2;
export const PLAY_SQUID = 3;

// Dance codes (with durations)
export const DANCE_SPIN = 1; // 3 seconds
export const DANCE_ZIGZAG = 2; // 4 seconds
export const DANCE_DISCO = 3; // 5 seconds
export const DANCE_CRAZY = 4; // 6 seconds
export const DANCE_CELEBRATION = 5; // 8 seconds

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
  compactCommands?: CompactCommand[];
  timestamp: Date;
};

export type ConnectionState = "disconnected" | "connecting" | "connected";
