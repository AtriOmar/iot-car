import { useState, useCallback } from "react";
import { useCarConnection } from "../hooks/useCarConnection";
import { DirectionPad } from "./DirectionPad";
import { ControlButtons } from "./ControlButtons";
import { AiResponseBox } from "./AiResponseBox";
import { ConnectionButton } from "./ConnectionButton";
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

  const isConnected = connectionState === "connected";

  // Handle direction pad
  const handleDirectionStart = useCallback(
    (direction: "forward" | "backward" | "left" | "right") => {
      const command: CarCommand = {
        type: "move",
        action: direction,
        speed: 200,
      };
      sendCarCommand([command]);
    },
    [sendCarCommand],
  );

  const handleDirectionEnd = useCallback(() => {
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
    <div className="flex flex-col gap-5 max-w-lg min-h-screen mx-auto p-5">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-white/10 border-b">
        <h1 className="font-bold text-gray-100 text-2xl">🚗 Car Controller</h1>
        <ConnectionButton
          connectionState={connectionState}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </header>

      {/* AI Response Box */}
      <AiResponseBox
        responses={aiResponses}
        isConnected={isConnected}
        isRecording={isRecording}
      />

      {/* Controls Container */}
      <div className="flex flex-1 gap-5">
        {/* Movement Section */}
        <div className="flex-1 p-5 border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
          <h2 className="mb-4 font-semibold text-gray-400 text-sm text-center uppercase tracking-wide">
            Movement
          </h2>
          <DirectionPad
            onDirectionStart={handleDirectionStart}
            onDirectionEnd={handleDirectionEnd}
            disabled={!isConnected}
          />
        </div>

        {/* Actions Section */}
        <div className="flex-1 p-5 border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
          <h2 className="mb-4 font-semibold text-gray-400 text-sm text-center uppercase tracking-wide">
            Actions
          </h2>
          <ControlButtons
            isBeeping={isBeeping}
            led1On={led1On}
            led2On={led2On}
            isAiModeEnabled={isAiModeEnabled}
            isRecording={isRecording}
            isConnected={isConnected}
            onBeepToggle={handleBeepToggle}
            onLed1Toggle={handleLed1Toggle}
            onLed2Toggle={handleLed2Toggle}
            onAiModeToggle={toggleAiMode}
            disabled={!isConnected}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-white/10 border-t text-center">
        <p className="text-gray-500 text-sm">
          {isAiModeEnabled
            ? "🎤 Voice control enabled - speak to control the car"
            : "🎮 Manual control - use buttons to control the car"}
        </p>
      </footer>
    </div>
  );
}
