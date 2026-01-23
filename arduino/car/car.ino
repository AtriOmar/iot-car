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
const char *WS_HOST = "car.api.omaratri.com"; // Your server IP address
const uint16_t WS_PORT = 50005;
const char *WS_PATH = "/realtime";

// Car ID for registration
const char *CAR_ID = "esp32_car_001";

// ==================== PIN DEFINITIONS ====================
// L298N Motor Driver Pins
const int MOTOR_ENA = 13; // PWM speed control for Motor A (right motor)
const int MOTOR_IN1 = 27; // Motor A direction pin 1 // I (Omar) reversed the (IN1, IN2) and (IN3, IN4) because the code used to move in the wrong direction
const int MOTOR_IN2 = 26; // Motor A direction pin 2
const int MOTOR_IN3 = 12; // Motor B direction pin 1
const int MOTOR_IN4 = 14; // Motor B direction pin 2
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
struct QueuedCommand
{
  String type;
  String action;
  int speed;
  int led;
  unsigned long duration;
  bool hasDuration;
};

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
    JsonArray commands = doc["commands"];

    Serial.printf("Received %d commands\n", commands.size());

    // Clear existing queue
    queueHead = 0;
    queueTail = 0;
    queueCount = 0;

    // Stop current actions
    stopMotors();
    commandState.moveActive = false;
    commandState.moveEndTime = 0;

    // Queue all commands
    for (JsonObject cmd : commands)
    {
      QueuedCommand qCmd;
      qCmd.type = cmd["type"].as<String>();
      qCmd.action = cmd["action"].as<String>();
      qCmd.speed = cmd["speed"] | 200; // Default speed 200
      qCmd.led = cmd["led"] | 1;
      qCmd.duration = cmd["duration"] | 0;
      qCmd.hasDuration = cmd.containsKey("duration");

      enqueueCommand(qCmd);

      Serial.printf("  Queued: type=%s, action=%s, speed=%d, duration=%lu\n",
                    qCmd.type.c_str(), qCmd.action.c_str(), qCmd.speed, qCmd.duration);
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
    Serial.printf("Executing: type=%s, action=%s\n", cmd.type.c_str(), cmd.action.c_str());

    if (cmd.type == "move")
    {
      // Execute move command
      if (cmd.action == "forward")
      {
        moveForward(cmd.speed);
      }
      else if (cmd.action == "backward")
      {
        moveBackward(cmd.speed);
      }
      else if (cmd.action == "left")
      {
        turnLeft(cmd.speed);
      }
      else if (cmd.action == "right")
      {
        turnRight(cmd.speed);
      }
      else if (cmd.action == "forward_left")
      {
        moveForwardLeft(cmd.speed);
      }
      else if (cmd.action == "forward_right")
      {
        moveForwardRight(cmd.speed);
      }
      else if (cmd.action == "backward_left")
      {
        moveBackwardLeft(cmd.speed);
      }
      else if (cmd.action == "backward_right")
      {
        moveBackwardRight(cmd.speed);
      }
      else if (cmd.action == "stop")
      {
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
    }
    else if (cmd.type == "beep")
    {
      if (cmd.action == "on")
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
      else if (cmd.action == "off")
      {
        setBeeper(false);
        commandState.beepActive = false;
        commandState.beepEndTime = 0;
      }
      // Continue to next command (LEDs and beeps are non-blocking)
    }
    else if (cmd.type == "led")
    {
      setLED(cmd.led, cmd.action == "on");
      // Continue to next command (LEDs are non-blocking)
    }
    else if (cmd.type == "play")
    {
      // Play a melody
      playSong(cmd.action.c_str());
      // Continue to next command (melody plays in background)
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

  // Motor A (Right) - Forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Backward (or stop for gentle turn)
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  setMotorSpeed(speed, speed);
}

void turnRight(int speed)
{
  Serial.printf("Turning RIGHT at speed %d\n", speed);

  // Motor A (Right) - Backward (or stop for gentle turn)
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Forward
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

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

  // Motor A (Right) - Full speed forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Reduced speed forward (creates arc to the left)
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  // Right motor faster, left motor slower for forward-left arc
  setMotorSpeed(speed, speed * 0.4);
}

void moveForwardRight(int speed)
{
  Serial.printf("Moving FORWARD-RIGHT at speed %d\n", speed);

  // Motor A (Right) - Reduced speed forward
  digitalWrite(MOTOR_IN1, HIGH);
  digitalWrite(MOTOR_IN2, LOW);

  // Motor B (Left) - Full speed forward (creates arc to the right)
  digitalWrite(MOTOR_IN3, HIGH);
  digitalWrite(MOTOR_IN4, LOW);

  // Left motor faster, right motor slower for forward-right arc
  setMotorSpeed(speed * 0.4, speed);
}

void moveBackwardLeft(int speed)
{
  Serial.printf("Moving BACKWARD-LEFT at speed %d\n", speed);

  // Motor A (Right) - Full speed backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Reduced speed backward (creates arc to the left)
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  // Right motor faster, left motor slower
  setMotorSpeed(speed, speed * 0.4);
}

void moveBackwardRight(int speed)
{
  Serial.printf("Moving BACKWARD-RIGHT at speed %d\n", speed);

  // Motor A (Right) - Reduced speed backward
  digitalWrite(MOTOR_IN1, LOW);
  digitalWrite(MOTOR_IN2, HIGH);

  // Motor B (Left) - Full speed backward (creates arc to the right)
  digitalWrite(MOTOR_IN3, LOW);
  digitalWrite(MOTOR_IN4, HIGH);

  // Left motor faster, right motor slower
  setMotorSpeed(speed * 0.4, speed);
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