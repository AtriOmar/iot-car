interface ControlButtonsProps {
  isBeeping: boolean;
  led1On: boolean;
  led2On: boolean;
  isAiModeEnabled: boolean;
  isRecording: boolean;
  isConnected: boolean;
  onBeepToggle: () => void;
  onLed1Toggle: () => void;
  onLed2Toggle: () => void;
  onAiModeToggle: () => void;
  disabled?: boolean;
}

export function ControlButtons({
  isBeeping,
  led1On,
  led2On,
  isAiModeEnabled,
  isRecording,
  isConnected,
  onBeepToggle,
  onLed1Toggle,
  onLed2Toggle,
  onAiModeToggle,
  disabled,
}: ControlButtonsProps) {
  const buttonBaseClass = `
    flex items-center gap-2.5 px-5 py-3.5 border-none rounded-xl
    bg-linear-to-br from-slate-600 to-slate-700
    text-white cursor-pointer transition-all duration-200 ease-out
    shadow-lg shadow-black/30 text-sm font-medium min-w-32
    hover:from-slate-500 hover:to-slate-600 hover:-translate-y-0.5 hover:shadow-xl
    active:translate-y-0 active:shadow-md
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
  `;

  return (
    <div
      className={`flex flex-col gap-3 p-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Beep Button */}
      <button
        className={`${buttonBaseClass} ${isBeeping ? "from-amber-500! to-amber-600! shadow-amber-500/40" : ""}`}
        onClick={onBeepToggle}
        disabled={disabled}
        aria-label="Toggle beep"
      >
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <span>Beep</span>
      </button>

      {/* LED 1 Button */}
      <button
        className={`${buttonBaseClass} ${led1On ? "from-emerald-500! to-emerald-600! shadow-emerald-500/40" : ""}`}
        onClick={onLed1Toggle}
        disabled={disabled}
        aria-label="Toggle LED 1"
      >
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
        </svg>
        <span>LED 1</span>
      </button>

      {/* LED 2 Button */}
      <button
        className={`${buttonBaseClass} ${led2On ? "from-emerald-500! to-emerald-600! shadow-emerald-500/40" : ""}`}
        onClick={onLed2Toggle}
        disabled={disabled}
        aria-label="Toggle LED 2"
      >
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
        </svg>
        <span>LED 2</span>
      </button>

      {/* AI Mode Button */}
      <button
        className={`
          ${buttonBaseClass} 
          ${isAiModeEnabled ? "from-indigo-500! to-indigo-600! shadow-indigo-500/40" : ""}
          ${isRecording ? "animate-pulse" : ""}
        `}
        onClick={onAiModeToggle}
        disabled={!isConnected}
        aria-label="Toggle AI voice control"
      >
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
        </svg>
        <span>
          {isAiModeEnabled
            ? isRecording
              ? "Listening..."
              : "AI On"
            : "AI Off"}
        </span>
      </button>
    </div>
  );
}
