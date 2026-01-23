import type { AIResponse } from "../types";

interface AiResponseBoxProps {
  responses: AIResponse[];
  isConnected: boolean;
}

export function AiResponseBox({ responses, isConnected }: AiResponseBoxProps) {
  const latestResponse = responses[responses.length - 1];

  // Get the message from commands if available
  const getMessage = () => {
    if (!latestResponse) return null;

    // If there's a message in the response, use it
    if (latestResponse.message) {
      return latestResponse.message;
    }

    // Otherwise fall back to text
    return latestResponse.text;
  };

  const message = getMessage();

  return (
    <div className="min-h-12 max-h-24 overflow-y-auto px-4 py-3 border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
      <div className="text-gray-200">
        {message ? (
          <p className="m-0 text-[15px] leading-relaxed">{message}</p>
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
