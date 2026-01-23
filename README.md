# IoT Car Controller - AI Voice & Joystick Control

Control your ESP32 IoT car with **AI voice commands** or **joystick/keyboard controls**. This project demonstrates real-time control of an autonomous vehicle using Azure OpenAI or OpenAI's Realtime API.

## Features

- 🎙️ **Voice Control**: Command your car with natural language (e.g., "Go forward", "Turn right", "Do a special dance")
- 🕹️ **Joystick Control**: Use an on-screen joystick for precise movement control
- ⌨️ **Keyboard Control**: Use Arrow Keys or WASD for car control
- 🤖 **AI Assistant**: Real-time AI responses and command execution
- 💡 **LED Control**: Turn LEDs on/off via voice
- 🔊 **Beeper Control**: Sound effects and melodies
- 📱 **Progressive Web App**: Install as native app on mobile/desktop
- 📊 **Speed Control**: Dynamic speed slider (Low/Medium speeds for safety)

## Hardware Requirements

- **Microcontroller**: ESP32 with WiFi
- **Motor Driver**: L298N dual motor driver
- **Motors**: 2x DC motors
- **Peripherals**:
  - 2x LEDs (GPIO 2, 4)
  - 1x Buzzer/Beeper (GPIO 15)
  - Melodic sounds support
- **Power**: USB or battery power

## Getting Started

### Prerequisites

- Node.js (latest LTS)
- Azure OpenAI service deployment with `gpt-realtime` model OR OpenAI API key
- Arduino IDE (for ESP32 programming)

### Setup

1. Clone the repository
2. Configure `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Add your API credentials:

   ```
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-realtime
   OPENAI_ENDPOINT=your_azure_endpoint_here
   OPENAI_API_VERSION=2025-04-01-preview
   BACKEND=azure
   ```

4. Install dependencies:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

5. Upload Arduino code to ESP32:
   - Open `arduino/car/car.ino` in Arduino IDE
   - Configure WiFi SSID and password in the sketch
   - Set WebSocket server IP address
   - Upload to your ESP32

6. Start the backend server:

   ```bash
   cd server && npm run dev
   ```

7. Start the frontend (in another terminal):

   ```bash
   cd client && npm start
   ```

8. Open your browser to `http://localhost:4200` and login with:
   - **Username**: `user`
   - **Password**: `1234`

## Controls

### Voice Commands

- "Go forward" / "Move forward for 3 seconds"
- "Turn left" / "Turn right" (90° turns with 500ms duration)
- "Stop"
- "Beep" / "Turn on beeper"
- "Turn on LED 1" / "Turn off LED 2"
- "Play pirates" / "Play game of thrones" / "Play squid game"
- "Do the special dance"

### Joystick Controls

- Drag the joystick to move in 8 directions + diagonals
- Release to stop

### Keyboard Controls

- **Arrow Keys**: ↑↓←→ for movement
- **WASD**: Alternative movement keys (case-insensitive)
- **Combinations**: Press two keys for diagonal movement (e.g., W+A = forward-left)

### Speed Control

- **Slow (130)**: Default speed for safety
- **Medium (180)**: Higher speed for faster movement
- **Note**: Maximum speed is capped at 180 for safety

## Architecture

```
┌─────────────────────────────────────────┐
│         Web Browser (React App)         │
│  - Login Page                           │
│  - Joystick Control                     │
│  - Voice Command Input                  │
│  - Speed Control Slider                 │
│  - LED/Beeper Toggle Buttons            │
│  - AI Response Display                  │
└──────────────┬──────────────────────────┘
               │ WebSocket
               ▼
┌─────────────────────────────────────────┐
│       Node.js Backend (Express)         │
│  - WebSocket Server                     │
│  - Azure OpenAI/OpenAI Integration      │
│  - Command Processing                   │
│  - Session Management                   │
└──────────────┬──────────────────────────┘
               │ Serial/WiFi
               ▼
┌─────────────────────────────────────────┐
│          ESP32 Microcontroller          │
│  - WiFi Connection                      │
│  - Command Parsing                      │
│  - Motor Control (L298N)                │
│  - LED Control                          │
│  - Beeper/Melody Playback               │
│  - Sensor Input                         │
└─────────────────────────────────────────┘
```

## Supported Commands

### Movement

- `forward`, `backward`, `left`, `right`
- `forward_left`, `forward_right`, `backward_left`, `backward_right`
- `stop`
- Turns automatically add 500ms duration

### LEDs

- Turn on/off LED 1 and LED 2

### Beeper

- Turn on/off with optional duration
- Supports multiple melodies: Pirates, Game of Thrones, Squid Game

### Special Dance

- Choreographed sequence with movements, LEDs, and beeper
- Uses moderate speeds (130-180) and short durations for safety

## Speed Configuration

- **Minimum Speed**: 130 (slow, safe movement)
- **Medium Speed**: 180 (moderate movement)
- **Maximum Speed**: 180 (capped for safety, even if user requests higher)

## Azure OpenAI - Keyless Authentication

For enhanced security, use Azure CLI authentication:

```bash
az login
az account list --query "[?isDefault].id" -o tsv
az ad signed-in-user show --query objectId -o tsv
az role assignment create \
  --role "Cognitive Services OpenAI Contributor" \
  --assignee-object-id "<USER_PRINCIPAL_ID>" \
  --scope "/subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP>" \
  --assignee-principal-type User
```

Then remove `OPENAI_API_KEY` from `.env`

## PWA Installation

The app is a Progressive Web App and can be installed on mobile devices:

- **Mobile**: Tap "Add to Home Screen" or app menu
- **Desktop**: Click install button in address bar

## Troubleshooting

- **Car not responding**: Check ESP32 WiFi connection and WebSocket server status
- **Beeper not working after melody**: Firmware handles pin reset automatically
- **Joystick conflicts**: Keyboard is disabled when joystick is in use
- **Authentication loop**: Clear browser storage and login again

## File Structure

```
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.tsx          # Auth & Main app
│   └── public/              # PWA manifest, icons, service worker
├── server/                  # Node.js backend
│   └── src/
│       ├── server.ts        # Express server
│       ├── session.ts       # WebSocket session management
│       └── systemMessages.ts # AI prompts
└── arduino/car/             # ESP32 firmware
    ├── car.ino              # Main code
    └── melodies.h           # Melody definitions
```

## License

MIT
