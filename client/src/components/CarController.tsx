import { useState, useCallback, useRef } from "react";
import { useCarConnection } from "../hooks/useCarConnection";
import { JoystickControl } from "./JoystickControl";
import type { JoystickDirection } from "./JoystickControl";
import { SpeedSlider } from "./SpeedSlider";
import { AiResponseBox } from "./AiResponseBox";
import type { CarCommand } from "../types";

export function CarController() {
  const {
    connectionState,
    aiResponses,
    isAiModeEnabled,
    isRecording,
    connect,
    disconnect,
    sendCarCommand,
    toggleAiMode,
  } = useCarConnection();

  const [isBeeping, setIsBeeping] = useState(false);
  const [led1On, setLed1On] = useState(false);
  const [led2On, setLed2On] = useState(false);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const currentSpeedRef = useRef(120);

  const isConnected = connectionState === "connected";

  // Handle speed change from slider
  const handleSpeedChange = useCallback((speed: number) => {
    currentSpeedRef.current = speed;
  }, []);

  // Handle joystick movement
  const handleJoystickMove = useCallback(
    (direction: JoystickDirection) => {
      const command: CarCommand = {
        type: "move",
        action: direction,
        speed: currentSpeedRef.current,
      };
      sendCarCommand([command]);
    },
    [sendCarCommand],
  );

  const handleJoystickStop = useCallback(() => {
    const command: CarCommand = {
      type: "move",
      action: "stop",
    };
    sendCarCommand([command]);
  }, [sendCarCommand]);

  // Handle beep toggle
  const handleBeepToggle = useCallback(() => {
    const newState = !isBeeping;
    setIsBeeping(newState);
    const command: CarCommand = {
      type: "beep",
      action: newState ? "on" : "off",
    };
    sendCarCommand([command]);
  }, [isBeeping, sendCarCommand]);

  // Handle LED toggles
  const handleLed1Toggle = useCallback(() => {
    const newState = !led1On;
    setLed1On(newState);
    const command: CarCommand = {
      type: "led",
      led: 1,
      action: newState ? "on" : "off",
    };
    sendCarCommand([command]);
  }, [led1On, sendCarCommand]);

  const handleLed2Toggle = useCallback(() => {
    const newState = !led2On;
    setLed2On(newState);
    const command: CarCommand = {
      type: "led",
      led: 2,
      action: newState ? "on" : "off",
    };
    sendCarCommand([command]);
  }, [led2On, sendCarCommand]);

  return (
    <div className="flex flex-col gap-3 max-w-[1000px] min-h-screen mx-auto p-3">
      {/* AI Response Box */}
      <AiResponseBox responses={aiResponses} isConnected={isConnected} />

      {/* Controls Container */}
      <div className="flex items-center gap-3">
        {/* Movement Controls - Joystick (left aligned) */}
        <div className="flex-shrink-0">
          <JoystickControl
            onMove={handleJoystickMove}
            onStop={handleJoystickStop}
            disabled={!isConnected}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Controls or Speed Controls */}
        <div className="gap-1 grid grid-cols-3 shrink-0">
          {showSpeedControls ? (
            <>
              {/* Speed Slider - spans 2 columns */}
              <div className="flex justify-center items-center col-span-2">
                <SpeedSlider
                  onSpeedChange={handleSpeedChange}
                  disabled={!isConnected}
                />
              </div>

              {/* Back Button */}
              <button
                className="flex justify-center items-center self-end w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 hover:from-slate-500 to-slate-700 hover:to-slate-600 shadow-black/30 shadow-lg active:shadow-md text-white active:scale-95 transition-all duration-150 ease-out touch-none cursor-pointer select-none"
                onClick={() => setShowSpeedControls(false)}
                aria-label="Back to controls"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Beep Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 to-slate-700 text-white cursor-pointer flex items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none hover:from-slate-500 hover:to-slate-600 active:scale-95 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  isBeeping
                    ? "from-amber-500! to-amber-600! shadow-amber-500/40"
                    : ""
                }`}
                onClick={handleBeepToggle}
                disabled={!isConnected}
                aria-label="Toggle beep"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12c0-1.771-.578-3.409-1.557-4.743a1 1 0 010-1.414zm-2.829 2.829a1 1 0 011.415 0A5.983 5.983 0 0115 12a5.983 5.983 0 01-.757 2.828 1 1 0 11-1.415-1.656A3.989 3.989 0 0013 12a3.989 3.989 0 00-.172-1.172 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* LED 1 Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 to-slate-700 text-white cursor-pointer flex items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none hover:from-slate-500 hover:to-slate-600 active:scale-95 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  led1On ? "from-blue-500! to-blue-600! shadow-blue-500/40" : ""
                }`}
                onClick={handleLed1Toggle}
                disabled={!isConnected}
                aria-label="Toggle LED 1"
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6 10a1 1 0 01-1 1H4a1 1 0 110-2h1a1 1 0 011 1zM10 16a6 6 0 100-12 6 6 0 000 12z" />
                  </svg>
                  <span className="text-xs">1</span>
                </div>
              </button>

              {/* LED 2 Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 to-slate-700 text-white cursor-pointer flex items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none hover:from-slate-500 hover:to-slate-600 active:scale-95 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  led2On
                    ? "from-green-500! to-green-600! shadow-green-500/40"
                    : ""
                }`}
                onClick={handleLed2Toggle}
                disabled={!isConnected}
                aria-label="Toggle LED 2"
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM6 10a1 1 0 01-1 1H4a1 1 0 110-2h1a1 1 0 011 1zM10 16a6 6 0 100-12 6 6 0 000 12z" />
                  </svg>
                  <span className="text-xs">2</span>
                </div>
              </button>

              {/* AI Mode Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 to-slate-700 text-white cursor-pointer flex items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none hover:from-slate-500 hover:to-slate-600 active:scale-95 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAiModeEnabled
                    ? "from-purple-500! to-purple-600! shadow-purple-500/40"
                    : ""
                } ${isRecording ? "animate-pulse" : ""}`}
                onClick={toggleAiMode}
                disabled={!isConnected}
                aria-label="Toggle AI mode"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Speed Toggle Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl bg-linear-to-br from-slate-600 to-slate-700 text-white cursor-pointer flex flex-col items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none hover:from-slate-500 hover:to-slate-600 active:scale-95 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => setShowSpeedControls(true)}
                disabled={!isConnected}
                aria-label="Show speed controls"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="opacity-70 text-[10px]">Speed</span>
              </button>

              {/* Connection Button */}
              <button
                className={`w-16 h-16 border-none rounded-xl text-white cursor-pointer flex items-center justify-center transition-all duration-150 ease-out shadow-lg shadow-black/30 touch-none select-none active:scale-95 active:shadow-md ${
                  connectionState === "connected"
                    ? "bg-linear-to-br from-red-500 to-red-600 shadow-red-500/40 hover:from-red-400 hover:to-red-500"
                    : connectionState === "connecting"
                      ? "bg-linear-to-br from-gray-500 to-gray-600 shadow-gray-500/40 cursor-wait"
                      : "bg-linear-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/40 hover:from-emerald-400 hover:to-emerald-500"
                }`}
                onClick={connectionState === "connected" ? disconnect : connect}
                disabled={connectionState === "connecting"}
                aria-label={
                  connectionState === "connected" ? "Disconnect" : "Connect"
                }
              >
                {connectionState === "connecting" ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : connectionState === "connected" ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
