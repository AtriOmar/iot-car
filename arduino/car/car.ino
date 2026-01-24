/*
 * ESP32 IoT Car Controller
 * Connects to WebSocket server and receives JSON commands to control:
 * - DC Motors via L298N motor driver
 * - Two LEDs
 * - Beeper/Buzzer
 * - Melody playback (Pirates of the Caribbean, etc.)
 *
 * Required Libraries:
 * - WiFi (built-in for ESP32)
 * - WebSocketsClient by Markus Sattler (install via Library Manager)
 * - ArduinoJson by Benoit Blanchon (install via Library Manager)
 */

// Beeper Pin
const int BEEPER_PIN = 15;

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "melodies.h"

// ==================== CONFIGURATION ====================
// WiFi Configuration
const char *WIFI_SSID = "Atri";
const char *WIFI_PASSWORD = "omar1234";

// WebSocket Server Configuration
// const char *WS_HOST = "car.api.omaratri.com"; // Your server IP address
// const uint16_t WS_PORT = 50005;
const char *WS_HOST = "192.168.43.9"; // Your server IP address
const uint16_t WS_PORT = 8080;
const char *WS_PATH = "/realtime";

// Car ID for registration
const char *CAR_ID = "esp32_car_001";

// ==================== PIN DEFINITIONS ====================
// L298N Motor Driver Pins
const int MOTOR_ENA = 13; // PWM speed control for Motor A (right motor)
const int MOTOR_IN1 = 12; // Motor A direction pin 1
const int MOTOR_IN2 = 14; // Motor A direction pin 2
const int MOTOR_IN3 = 27; // Motor B direction pin 1
const int MOTOR_IN4 = 26; // Motor B direction pin 2
const int MOTOR_ENB = 25; // PWM speed control for Motor B (left motor)

// LED Pins
const int LED1_PIN = 2; // LED 1 (often built-in LED on GPIO2)
const int LED2_PIN = 4; // LED 2

// ==================== PWM CONFIGURATION ====================
const int PWM_FREQ = 5000;    // PWM frequency in Hz
const int PWM_RESOLUTION = 8; // 8-bit resolution (0-255)
const int PWM_CHANNEL_A = 0;  // PWM channel for Motor A
const int PWM_CHANNEL_B = 1;  // PWM channel for Motor B

// ==================== GLOBAL VARIABLES ====================
WebSocketsClient webSocket;
bool isConnected = false;
unsigned long lastReconnectAttempt = 0;
const unsigned long RECONNECT_INTERVAL = 5000; // 5 seconds

// Command execution state
struct CommandState
{
  bool moveActive;
  bool beepActive;
  unsigned long moveEndTime;
  unsigned long beepEndTime;
  String pendingAction;
  int pendingSpeed;
} commandState = {false, false, 0, 0, "", 200};

// Command queue for sequential execution
// Uses compact numeric codes for efficiency
struct QueuedCommand
{
  int cmdType; // 1=move, 2=led, 3=beep, 4=play
  int action;  // Depends on type (see below)
  int speed;   // For move commands
  int led;     // For LED commands (1 or 2)
  unsigned long duration;
  bool hasDuration;
};

/*
 * COMPACT COMMAND PROTOCOL
 *
 * Commands are arrays: [msg, type, ...params]
 *
 * Type codes:
 *   1 = move
 *   2 = led
 *   3 = beep
 *   4 = play
 *
 * Move action codes (type=1): [msg, 1, action, speed, duration?]
 *   0=stop, 1=forward, 2=backward, 3=left, 4=right
 *   5=forward_left, 6=forward_right, 7=backward_left, 8=backward_right
 *
 * LED (type=2): [msg, 2, led_num, on_off]
 *   on_off: 1=on, 0=off
 *
 * Beep (type=3): [msg, 3, on_off, duration?]
 *   on_off: 1=on, 0=off
 *
 * Play (type=4): [msg, 4, song]
 *   Songs: 0=stop, 1=pirates, 2=got, 3=squid
 */

// Type codes
const int CMD_MOVE = 1;
const int CMD_LED = 2;
const int CMD_BEEP = 3;
const int CMD_PLAY = 4;
const int CMD_DANCE = 5;

// Move action codes
const int ACT_STOP = 0;
const int ACT_FORWARD = 1;
const int ACT_BACKWARD = 2;
const int ACT_LEFT = 3;
const int ACT_RIGHT = 4;
const int ACT_FORWARD_LEFT = 5;
const int ACT_FORWARD_RIGHT = 6;
const int ACT_BACKWARD_LEFT = 7;
const int ACT_BACKWARD_RIGHT = 8;

// Play action codes
const int PLAY_STOP = 0;
const int PLAY_PIRATES = 1;
const int PLAY_GOT = 2;
const int PLAY_SQUID = 3;

// Dance codes (with approximate durations in ms)
// 1 = spin (3 seconds)
// 2 = zigzag (4 seconds)
// 3 = disco (5 seconds)
// 4 = crazy (6 seconds)
// 5 = celebration (8 seconds)
const int DANCE_SPIN = 1;        // ~3000ms
const int DANCE_ZIGZAG = 2;      // ~4000ms
const int DANCE_DISCO = 3;       // ~5000ms
const int DANCE_CRAZY = 4;       // ~6000ms
const int DANCE_CELEBRATION = 5; // ~8000ms

const int MAX_QUEUE_SIZE = 20;
QueuedCommand commandQueue[MAX_QUEUE_SIZE];
int queueHead = 0;
int queueTail = 0;
int queueCount = 0;

// ==================== FUNCTION DECLARATIONS ====================
void setupMotors();
void setupLEDs();
void setupBeeper();
void connectWiFi();
void connectWebSocket();
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length);
void processMessage(const char *payload);
void executeCommand(JsonObject &cmd);
void processCommandQueue();
void setMotorSpeed(int speedA, int speedB);
void moveForward(int speed);
void moveBackward(int speed);
void turnLeft(int speed);
void turnRight(int speed);
void moveForwardLeft(int speed);
void moveForwardRight(int speed);
void moveBackwardLeft(int speed);
void moveBackwardRight(int speed);
void stopMotors();
void setLED(int led, bool state);
void setBeeper(bool state);
void enqueueCommand(QueuedCommand cmd);
bool dequeueCommand(QueuedCommand &cmd);
void playSong(const char *songName);
void executeDance(int danceId);

// ==================== SETUP ====================
void setup()
{
  Serial.begin(115200);
  Serial.println("\n\n========================================");
  Serial.println("ESP32 IoT Car Controller Starting...");
  Serial.println("========================================\n");

  setupMotors();
  setupLEDs();
  setupBeeper();

  // Initial state - everything off
  stopMotors();
  setLED(1, false);
  setLED(2, false);
  setBeeper(false);

  // Blink LED to indicate startup
  for (int i = 0; i < 3; i++)
  {
    setLED(1, true);
    delay(100);
    setLED(1, false);
    delay(100);
  }

  connectWiFi();
  connectWebSocket();
}

// ==================== MAIN LOOP ====================
void loop()
{
  webSocket.loop();

  // Handle timed commands (duration-based)
  unsigned long currentTime = millis();

  // Check if move duration has elapsed
  if (commandState.moveActive && commandState.moveEndTime > 0 && currentTime >= commandState.moveEndTime)
  {
    Serial.println("Move duration elapsed, stopping motors");
    stopMotors();
    commandState.moveActive = false;
    commandState.moveEndTime = 0;

    // Process next command in queue
    processCommandQueue();
  }

  // Check if beep duration has elapsed
  if (commandState.beepActive && commandState.beepEndTime > 0 && currentTime >= commandState.beepEndTime)
  {
    Serial.println("Beep duration elapsed, stopping beeper");
    setBeeper(false);
    commandState.beepActive = false;
    commandState.beepEndTime = 0;

    // Process next command in queue if no active move
    if (!commandState.moveActive || commandState.moveEndTime == 0)
    {
      processCommandQueue();
    }
  }

  // Update melody playback (non-blocking)
  updateMelody();

  // Reconnect if disconnected
  if (!isConnected && (currentTime - lastReconnectAttempt > RECONNECT_INTERVAL))
  {
    lastReconnectAttempt = currentTime;
    Serial.println("Attempting to reconnect WebSocket...");
    webSocket.disconnect();
    connectWebSocket();
  }
}

// ==================== MOTOR SETUP ====================
void setupMotors()
{
  // Setup PWM and attach to enable pins (ESP32 Arduino Core 3.0+ API)
  // ledcAttach(pin, freq, resolution) replaces ledcSetup + ledcAttachPin
  ledcAttach(MOTOR_ENA, PWM_FREQ, PWM_RESOLUTION);
  ledcAttach(MOTOR_ENB, PWM_FREQ, PWM_RESOLUTION);

  // Setup direction control pins
  pinMode(MOTOR_IN1, OUTPUT);
  pinMode(MOTOR_IN2, OUTPUT);
  pinMode(MOTOR_IN3, OUTPUT);
  pinMode(MOTOR_IN4, OUTPUT);

  Serial.println("✓ Motors initialized");
}

// ==================== LED SETUP ====================
void setupLEDs()
{
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  Serial.println("✓ LEDs initialized");
}

// ==================== BEEPER SETUP ====================
void setupBeeper()
{
  pinMode(BEEPER_PIN, OUTPUT);
  Serial.println("✓ Beeper initialized");
}

// ==================== WIFI CONNECTION ====================
void connectWiFi()
{
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30)
  {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("\n✓ WiFi Connected!");
    Serial.printf("  IP Address: %s\n", WiFi.localIP().toString().c_str());
  }
  else
  {
    Serial.println("\n✗ WiFi Connection Failed! Restarting...");
    delay(3000);
    ESP.restart();
  }
}

// ==================== WEBSOCKET CONNECTION ====================
void connectWebSocket()
{
  Serial.printf("Connecting to WebSocket: ws://%s:%d%s\n", WS_HOST, WS_PORT, WS_PATH);

  webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

// ==================== WEBSOCKET EVENT HANDLER ====================
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.println("WebSocket Disconnected");
    isConnected = false;
    // Visual indicator - blink LED
    setLED(1, true);
    delay(100);
    setLED(1, false);
    break;

  case WStype_CONNECTED:
    Serial.printf("WebSocket Connected to: %s\n", payload);
    isConnected = true;

    // Register this car with the server
    {
      StaticJsonDocument<200> doc;
      doc["type"] = "car_register";
      doc["carId"] = CAR_ID;

      String message;
      serializeJson(doc, message);
      webSocket.sendTXT(message);
      Serial.printf("Sent registration: %s\n", message.c_str());
    }

    // Visual indicator - double blink
    for (int i = 0; i < 2; i++)
    {
      setLED(1, true);
      setLED(2, true);
      delay(150);
      setLED(1, false);
      setLED(2, false);
      delay(150);
    }
    break;

  case WStype_TEXT:
    Serial.printf("Received message: %s\n", payload);
    processMessage((const char *)payload);
    break;

  case WStype_ERROR:
    Serial.printf("WebSocket Error: %s\n", payload);
    break;

  default:
    break;
  }
}

// ==================== MESSAGE PROCESSING ====================
void processMessage(const char *payload)
{
  StaticJsonDocument<2048> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error)
  {
    Serial.printf("JSON parse error: %s\n", error.c_str());
    return;
  }

  const char *msgType = doc["type"];

  if (strcmp(msgType, "car_registered") == 0)
  {
    Serial.println("✓ Successfully registered with server");
    return;
  }

  if (strcmp(msgType, "car_control") == 0)
  {
    // Clear existing queue
    queueHead = 0;
    queueTail = 0;
    queueCount = 0;

    // Stop current actions
    stopMotors();
    commandState.moveActive = false;
    commandState.moveEndTime = 0;

    // Compact format only: { "c": [[...], [...], ...] }
    if (!doc.containsKey("c"))
    {
      Serial.println("Error: Missing 'c' array in car_control message");
      return;
    }

    JsonArray compactCommands = doc["c"];
    Serial.printf("Received %d compact commands\n", compactCommands.size());

    for (JsonArray cmd : compactCommands)
    {
      if (cmd.size() < 2)
        continue;

      // Format: [msg, type, ...params]
      // msg is at index 0 (string, for display only)
      int cmdType = cmd[1].as<int>();

      QueuedCommand qCmd;
      qCmd.cmdType = cmdType;
      qCmd.action = 0;
      qCmd.speed = 130;
      qCmd.led = 1;
      qCmd.duration = 0;
      qCmd.hasDuration = false;

      switch (cmdType)
      {
      case CMD_MOVE:
        // [msg, 1, action, speed, duration?]
        qCmd.action = cmd[2].as<int>();
        qCmd.speed = cmd.size() > 3 ? cmd[3].as<int>() : 130;
        if (cmd.size() > 4)
        {
          qCmd.duration = cmd[4].as<unsigned long>();
          qCmd.hasDuration = true;
        }
        Serial.printf("  Queued MOVE: action=%d, speed=%d, dur=%lu\n",
                      qCmd.action, qCmd.speed, qCmd.duration);
        break;

      case CMD_LED:
        // [msg, 2, led_num, on_off]
        qCmd.led = cmd[2].as<int>();
        qCmd.action = cmd[3].as<int>(); // 1=on, 0=off
        Serial.printf("  Queued LED: led=%d, on=%d\n", qCmd.led, qCmd.action);
        break;

      case CMD_BEEP:
        // [msg, 3, on_off, duration?]
        qCmd.action = cmd[2].as<int>(); // 1=on, 0=off
        if (cmd.size() > 3)
        {
          qCmd.duration = cmd[3].as<unsigned long>();
          qCmd.hasDuration = true;
        }
        Serial.printf("  Queued BEEP: on=%d, dur=%lu\n", qCmd.action, qCmd.duration);
        break;

      case CMD_PLAY:
        // [msg, 4, song]
        qCmd.action = cmd[2].as<int>(); // 0=stop, 1=pirates, 2=got, 3=squid
        Serial.printf("  Queued PLAY: song=%d\n", qCmd.action);
        break;

      case CMD_DANCE:
        // [msg, 5, dance_id]
        qCmd.action = cmd[2].as<int>(); // 1=spin, 2=zigzag, 3=disco, 4=crazy, 5=celebration
        Serial.printf("  Queued DANCE: id=%d\n", qCmd.action);
        break;

      default:
        Serial.printf("  Unknown command type: %d\n", cmdType);
        continue;
      }

      enqueueCommand(qCmd);
    }

    // Start processing queue
    processCommandQueue();
  }
}

// ==================== COMMAND QUEUE MANAGEMENT ====================
void enqueueCommand(QueuedCommand cmd)
{
  if (queueCount >= MAX_QUEUE_SIZE)
  {
    Serial.println("Command queue full!");
    return;
  }

  commandQueue[queueTail] = cmd;
  queueTail = (queueTail + 1) % MAX_QUEUE_SIZE;
  queueCount++;
}

bool dequeueCommand(QueuedCommand &cmd)
{
  if (queueCount == 0)
  {
    return false;
  }

  cmd = commandQueue[queueHead];
  queueHead = (queueHead + 1) % MAX_QUEUE_SIZE;
  queueCount--;
  return true;
}

// ==================== COMMAND QUEUE PROCESSING ====================
void processCommandQueue()
{
  QueuedCommand cmd;

  while (dequeueCommand(cmd))
  {
    Serial.printf("Executing: type=%d, action=%d\n", cmd.cmdType, cmd.action);

    switch (cmd.cmdType)
    {
    case CMD_MOVE:
      // Execute move command using action code
      switch (cmd.action)
      {
      case ACT_FORWARD:
        moveForward(cmd.speed);
        break;
      case ACT_BACKWARD:
        moveBackward(cmd.speed);
        break;
      case ACT_LEFT:
        turnLeft(cmd.speed);
        break;
      case ACT_RIGHT:
        turnRight(cmd.speed);
        break;
      case ACT_FORWARD_LEFT:
        moveForwardLeft(cmd.speed);
        break;
      case ACT_FORWARD_RIGHT:
        moveForwardRight(cmd.speed);
        break;
      case ACT_BACKWARD_LEFT:
        moveBackwardLeft(cmd.speed);
        break;
      case ACT_BACKWARD_RIGHT:
        moveBackwardRight(cmd.speed);
        break;
      case ACT_STOP:
      default:
        stopMotors();
        commandState.moveActive = false;
        commandState.moveEndTime = 0;
        continue; // Process next command immediately
      }

      commandState.moveActive = true;

      if (cmd.hasDuration && cmd.duration > 0)
      {
        commandState.moveEndTime = millis() + cmd.duration;
        Serial.printf("Move will end in %lu ms\n", cmd.duration);
        return; // Wait for duration to elapse
      }
      else
      {
        commandState.moveEndTime = 0; // Indefinite movement
        // Continue to next command (might be beep or LED)
      }
      break;

    case CMD_BEEP:
      if (cmd.action == 1) // on
      {
        setBeeper(true);
        commandState.beepActive = true;

        if (cmd.hasDuration && cmd.duration > 0)
        {
          commandState.beepEndTime = millis() + cmd.duration;
          Serial.printf("Beep will end in %lu ms\n", cmd.duration);
          // Don't return - beep can run concurrently with movement
        }
        else
        {
          commandState.beepEndTime = 0; // Indefinite beeping
        }
      }
      else // off
      {
        setBeeper(false);
        commandState.beepActive = false;
        commandState.beepEndTime = 0;
      }
      // Continue to next command (beeps are non-blocking)
      break;

    case CMD_LED:
      setLED(cmd.led, cmd.action == 1);
      // Continue to next command (LEDs are non-blocking)
      break;

    case CMD_PLAY:
      // Play a melody using song code
      switch (cmd.action)
      {
      case PLAY_PIRATES:
        playSong("pirates");
        break;
      case PLAY_GOT:
        playSong("got");
        break;
      case PLAY_SQUID:
        playSong("squid");
        break;
      case PLAY_STOP:
      default:
        playSong("stop");
        break;
      }
      // Continue to next command (melody plays in background)
      break;

    case CMD_DANCE:
      // Execute a predefined dance routine
      executeDance(cmd.action);
      // Dance blocks until complete
      break;
    }
  }

  Serial.println("Command queue empty");
}

// ==================== MOTOR CONTROL FUNCTIONS ====================
void setMotorSpeed(int speedA, int speedB)
{
  // ESP32 Arduino Core 3.0+: ledcWrite uses pin, not channel
  ledcWrite(MOTOR_ENA, abs(speedA));
  ledcWrite(MOTOR_ENB, abs(speedB));
}

void moveForward(int speed)
{
  Serial.printf("Moving FORWARD at speed %d\n", speed);

  // Motor A (Right) - Forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Forward
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  setMotorSpeed(speed, speed);
}

void moveBackward(int speed)
{
  Serial.printf("Moving BACKWARD at speed %d\n", speed);

  // Motor A (Right) - Backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Backward
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  setMotorSpeed(speed, speed);
}

void turnLeft(int speed)
{
  Serial.printf("Turning LEFT at speed %d\n", speed);

  // Motor A (Right) - Backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Forward
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  setMotorSpeed(speed, speed);
}

void turnRight(int speed)
{
  Serial.printf("Turning RIGHT at speed %d\n", speed);

  // Motor A (Right) - Forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Backward
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  setMotorSpeed(speed, speed);
}

void stopMotors()
{
  Serial.println("STOPPING motors");

  // Stop both motors
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, LOW);
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, LOW);

  setMotorSpeed(0, 0);
}

// ==================== DIAGONAL MOVEMENT FUNCTIONS ====================
void moveForwardLeft(int speed)
{
  Serial.printf("Moving FORWARD-LEFT at speed %d\n", speed);

  // Motor A (Right) - Reduced speed forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Full speed forward (creates arc to the left)
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  // Left motor faster, right motor slower for forward-left arc
  setMotorSpeed(speed * 0.4, speed);
}

void moveForwardRight(int speed)
{
  Serial.printf("Moving FORWARD-RIGHT at speed %d\n", speed);

  // Motor A (Right) - Full speed forward (creates arc to the right)
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Reduced speed forward
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  // Right motor faster, left motor slower for forward-right arc
  setMotorSpeed(speed, speed * 0.4);
}

void moveBackwardLeft(int speed)
{
  Serial.printf("Moving BACKWARD-LEFT at speed %d\n", speed);

  // Motor A (Right) - Reduced speed backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Full speed backward (creates arc to the left)
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  // Left motor faster, right motor slower
  setMotorSpeed(speed * 0.4, speed);
}

void moveBackwardRight(int speed)
{
  Serial.printf("Moving BACKWARD-RIGHT at speed %d\n", speed);

  // Motor A (Right) - Full speed backward (creates arc to the right)
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Reduced speed backward
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  // Right motor faster, left motor slower
  setMotorSpeed(speed, speed * 0.4);
}

// ==================== LED CONTROL ====================
void setLED(int led, bool state)
{
  Serial.printf("LED %d: %s\n", led, state ? "ON" : "OFF");

  if (led == 1)
  {
    digitalWrite(LED1_PIN, state ? HIGH : LOW);
  }
  else if (led == 2)
  {
    digitalWrite(LED2_PIN, state ? HIGH : LOW);
  }
}

// ==================== BEEPER CONTROL ====================
void setBeeper(bool state)
{
  Serial.printf("Beeper: %s\n", state ? "ON" : "OFF");
  // Stop any playing melody when beeper is controlled directly
  if (melodyPlaying)
  {
    stopMelody();
  }
  digitalWrite(BEEPER_PIN, state ? HIGH : LOW);
}

// ==================== MELODY CONTROL ====================
void playSong(const char *songName)
{
  Serial.printf("Playing song: %s\n", songName);

  // Stop beeper if active
  if (commandState.beepActive)
  {
    setBeeper(false);
    commandState.beepActive = false;
    commandState.beepEndTime = 0;
  }

  if (strcmp(songName, "pirates") == 0 || strcmp(songName, "pirates_of_caribbean") == 0)
  {
    startMelody(SONG_PIRATES);
  }
  else if (strcmp(songName, "got") == 0 || strcmp(songName, "gameofthrones") == 0 || strcmp(songName, "game_of_thrones") == 0)
  {
    startMelody(SONG_GOT);
  }
  else if (strcmp(songName, "squid") == 0 || strcmp(songName, "squidgame") == 0 || strcmp(songName, "squid_game") == 0)
  {
    startMelody(SONG_SQUID);
  }
  else if (strcmp(songName, "stop") == 0)
  {
    stopMelody();
  }
  else
  {
    Serial.printf("Unknown song: %s\n", songName);
  }
}

// ==================== DANCE ROUTINES ====================
// Each dance has a predefined duration:
// 1 = spin (~3s), 2 = zigzag (~4s), 3 = disco (~5s), 4 = crazy (~6s), 5 = celebration (~8s)

void executeDance(int danceId)
{
  Serial.printf("Executing dance: %d\n", danceId);

  // Stop any current movement
  stopMotors();
  commandState.moveActive = false;
  commandState.moveEndTime = 0;

  switch (danceId)
  {
  case DANCE_SPIN: // ~3 seconds - Quick spin dance
    Serial.println("Dance: SPIN (3s)");
    setLED(1, true);
    setLED(2, true);
    // Spin right
    turnRight(160);
    delay(1000);
    // Spin left
    turnLeft(160);
    delay(1000);
    // Spin right again
    turnRight(180);
    delay(800);
    // Stop and flash
    stopMotors();
    setLED(1, false);
    delay(100);
    setLED(1, true);
    delay(100);
    setLED(2, false);
    stopMotors();
    setLED(1, false);
    setLED(2, false);
    break;

  case DANCE_ZIGZAG: // ~4 seconds - Zigzag pattern
    Serial.println("Dance: ZIGZAG (4s)");
    setLED(1, true);
    // Forward-right
    moveForwardRight(150);
    delay(600);
    // Forward-left
    moveForwardLeft(150);
    delay(600);
    setLED(2, true);
    setLED(1, false);
    // Forward-right
    moveForwardRight(150);
    delay(600);
    // Forward-left
    moveForwardLeft(150);
    delay(600);
    // Backward
    moveBackward(140);
    delay(600);
    // Beep
    setBeeper(true);
    delay(200);
    setBeeper(false);
    // Stop
    stopMotors();
    setLED(1, false);
    setLED(2, false);
    break;

  case DANCE_DISCO: // ~5 seconds - Disco with lights and beeps
    Serial.println("Dance: DISCO (5s)");
    for (int i = 0; i < 5; i++)
    {
      setLED(1, i % 2 == 0);
      setLED(2, i % 2 == 1);
      if (i % 2 == 0)
      {
        turnRight(150);
      }
      else
      {
        turnLeft(150);
      }
      delay(400);
      setBeeper(true);
      delay(100);
      setBeeper(false);
      delay(400);
    }
    stopMotors();
    setLED(1, false);
    setLED(2, false);
    break;

  case DANCE_CRAZY: // ~6 seconds - Crazy random movements
    Serial.println("Dance: CRAZY (6s)");
    setLED(1, true);
    setLED(2, true);
    // Quick movements
    moveForward(170);
    delay(400);
    turnRight(180);
    delay(500);
    moveBackward(160);
    delay(400);
    setBeeper(true);
    delay(150);
    setBeeper(false);
    turnLeft(180);
    delay(600);
    moveForwardRight(150);
    delay(500);
    moveBackwardLeft(150);
    delay(500);
    setBeeper(true);
    delay(150);
    setBeeper(false);
    turnRight(170);
    delay(700);
    // Spin finish
    turnLeft(180);
    delay(1000);
    setBeeper(true);
    delay(200);
    setBeeper(false);
    stopMotors();
    setLED(1, false);
    setLED(2, false);
    break;

  case DANCE_CELEBRATION: // ~8 seconds - Victory celebration
    Serial.println("Dance: CELEBRATION (8s)");
    // Opening spin
    setLED(1, true);
    turnRight(160);
    delay(800);
    setLED(2, true);
    turnLeft(160);
    delay(800);
    // Forward backward
    setLED(1, false);
    moveForward(150);
    delay(500);
    moveBackward(150);
    delay(500);
    setLED(1, true);
    setLED(2, false);
    // Zigzag
    moveForwardLeft(140);
    delay(400);
    moveForwardRight(140);
    delay(400);
    moveForwardLeft(140);
    delay(400);
    // Beep pattern
    setBeeper(true);
    delay(200);
    setBeeper(false);
    delay(100);
    setBeeper(true);
    delay(200);
    setBeeper(false);
    // Final spin
    setLED(1, true);
    setLED(2, true);
    turnRight(180);
    delay(1200);
    turnLeft(180);
    delay(1200);
    // Finish
    stopMotors();
    for (int i = 0; i < 3; i++)
    {
      setLED(1, true);
      setLED(2, false);
      setBeeper(true);
      delay(150);
      setLED(1, false);
      setLED(2, true);
      setBeeper(false);
      delay(150);
    }
    setLED(1, false);
    setLED(2, false);
    break;

  default:
    Serial.printf("Unknown dance: %d\n", danceId);
    // Default to spin
    executeDance(DANCE_SPIN);
    break;
  }

  Serial.println("Dance complete");
}