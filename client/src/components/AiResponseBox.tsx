import type { AIResponse } from "../types";

interface AiResponseBoxProps {
  responses: AIResponse[];
  isConnected: boolean;
  isRecording: boolean;
}

export function AiResponseBox({
  responses,
  isConnected,
  isRecording,
}: AiResponseBoxProps) {
  const latestResponse = responses[responses.length - 1];

  return (
    <div className="min-h-25 max-h-50 overflow-y-auto p-4 border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2.5 border-white/10 border-b">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isConnected
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : "bg-gray-500"
            }`}
          />
          <span className="font-medium text-gray-400 text-xs">
            {isConnected
              ? isRecording
                ? "Listening..."
                : "Connected"
              : "Disconnected"}
          </span>
        </div>
        <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
          AI Assistant
        </span>
      </div>

      {/* Content */}
      <div className="text-gray-200">
        {latestResponse ? (
          <>
            <p className="m-0 text-[15px] leading-relaxed">
              {latestResponse.text}
            </p>
            {latestResponse.commands && latestResponse.commands.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-black/30 text-xs">
                <span className="block mb-1.5 font-medium text-gray-400">
                  Commands sent:
                </span>
                <code className="block max-h-15 overflow-y-auto font-mono text-[11px] text-indigo-300 break-all whitespace-pre-wrap">
                  {JSON.stringify(latestResponse.commands, null, 2)}
                </code>
              </div>
            )}
          </>
        ) : (
          <p className="m-0 text-gray-500 text-sm italic">
            {isConnected
              ? "Enable AI mode and speak to control the car..."
              : "Connect to start controlling the car"}
          </p>
        )}
      </div>
    </div>
  );
}
