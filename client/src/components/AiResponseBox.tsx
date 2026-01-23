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
    <div className="h-24 overflow-hidden border border-white/5 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
      {message || latestResponse?.commands ? (
        <div className="flex gap-2 h-full p-3">
          {/* Left: Message */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-gray-200">
              {message ? (
                <p className="m-0 text-[15px] leading-relaxed">{message}</p>
              ) : (
                <p className="m-0 text-gray-500 text-sm italic">No message</p>
              )}
            </div>
          </div>

          {/* Right: Commands */}
          {latestResponse?.commands && latestResponse.commands.length > 0 && (
            <div className="flex-1 overflow-y-auto pl-2 border-white/10 border-l">
              <code className="block font-mono text-[11px] text-indigo-300 break-all whitespace-pre-wrap">
                {JSON.stringify(latestResponse.commands, null, 2)}
              </code>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full px-4">
          <p className="m-0 text-gray-500 text-sm italic">
            {isConnected
              ? "Enable AI mode and speak to control the car..."
              : "Connect to start controlling the car"}
          </p>
        </div>
      )}
    </div>
  );
}
