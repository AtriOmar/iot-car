import type { ConnectionState } from "../types";

interface ConnectionButtonProps {
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionButton({
  connectionState,
  onConnect,
  onDisconnect,
}: ConnectionButtonProps) {
  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";

  const baseClass = `
    flex items-center justify-center gap-2.5 px-7 py-3.5
    border-none rounded-xl text-base font-semibold cursor-pointer
    transition-all duration-200 ease-out min-w-40
    hover:-translate-y-0.5 hover:shadow-xl
    active:translate-y-0
    disabled:cursor-wait
  `;

  const stateClass = isConnected
    ? "bg-linear-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500"
    : isConnecting
      ? "bg-linear-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30"
      : "bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500";

  return (
    <button
      className={`${baseClass} ${stateClass}`}
      onClick={isConnected ? onDisconnect : onConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
          <span>Disconnect</span>
        </>
      ) : (
        <>
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>Connect</span>
        </>
      )}
    </button>
  );
}
