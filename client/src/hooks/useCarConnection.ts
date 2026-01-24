import { useRef, useState, useCallback, useEffect } from "react";
import type { CompactCommand, ConnectionState, AIResponse } from "../types";

const WS_URL =
  (import.meta.env.VITE_WS_URL as string) || "ws://localhost:8080/realtime";

export function useCarConnection() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [isAiModeEnabled, setIsAiModeEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentTextRef = useRef<Map<string, string>>(new Map());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState("connecting");

    try {
      const socket = new WebSocket(WS_URL);
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        console.log("WebSocket connected");
        // Send init message for car-controller
        socket.send(
          JSON.stringify({
            type: "init",
            systemMessageType: "car-controller",
          }),
        );
      };

      socket.onmessage = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          // Binary audio data - ignore for now (we're not playing audio back)
          return;
        }

        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setConnectionState("disconnected");
        setIsRecording(false);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("disconnected");
      };

      socketRef.current = socket;
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionState("disconnected");
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: any) => {
    console.log("-------------------- message --------------------");
    console.log(message);

    switch (message.type) {
      case "control":
        if (message.action === "session_created") {
          console.log("Session created");
          setConnectionState("connected");
        } else if (
          message.action === "function_call_output" &&
          message.functionCallParams
        ) {
          try {
            const params = JSON.parse(message.functionCallParams);
            const response: AIResponse = {
              id: message.id || Date.now().toString(),
              text: "",
              compactCommands: params.c || [],
              timestamp: new Date(),
            };
            setAiResponses((prev) => [...prev.slice(-9), response]); // Keep last 10
          } catch (e) {
            console.error("Failed to parse function call params:", e);
          }
        } else if (message.action === "error") {
          console.error("Server error:", message.error);
        }
        break;

      case "text_delta":
        // Accumulate text deltas
        const currentText = currentTextRef.current.get(message.id) || "";
        currentTextRef.current.set(message.id, currentText + message.delta);
        break;

      case "text_done":
        // Finalize text message
        const finalText = currentTextRef.current.get(message.id);
        if (finalText) {
          setAiResponses((prev) => [
            ...prev.slice(-9),
            {
              id: message.id,
              text: finalText,
              timestamp: new Date(),
            },
          ]);
          currentTextRef.current.delete(message.id);
        }
        break;
    }
  }, []);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    stopRecording();
    socketRef.current?.close();
    socketRef.current = null;
    setConnectionState("disconnected");
    setAiResponses([]);
  }, []);

  // Send direct car control command (compact format)
  const sendCarCommand = useCallback((commands: CompactCommand[]) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "car_direct_control",
        c: commands,
      }),
    );
  }, []);

  // Start recording audio for AI
  const startRecording = useCallback(async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Load audio worklet
      await audioContext.audioWorklet.addModule("/recorder-worklet.js");

      // Create worklet node
      const workletNode = new AudioWorkletNode(
        audioContext,
        "recorder-worklet",
      );
      workletNodeRef.current = workletNode;

      // Handle audio data from worklet
      workletNode.port.onmessage = (event) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const int16Data = event.data as Int16Array;
          socketRef.current.send(int16Data.buffer);
        }
      };

      // Connect microphone to worklet
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);

      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    console.log("Recording stopped");
  }, []);

  // Toggle AI mode
  const toggleAiMode = useCallback(() => {
    if (isAiModeEnabled) {
      stopRecording();
      setIsAiModeEnabled(false);
    } else {
      setIsAiModeEnabled(true);
      if (connectionState === "connected") {
        startRecording();
      }
    }
  }, [isAiModeEnabled, connectionState, startRecording, stopRecording]);

  // Auto-start recording when AI mode is enabled and connected
  useEffect(() => {
    if (isAiModeEnabled && connectionState === "connected" && !isRecording) {
      startRecording();
    }
  }, [isAiModeEnabled, connectionState, isRecording, startRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    aiResponses,
    isAiModeEnabled,
    isRecording,
    connect,
    disconnect,
    sendCarCommand,
    toggleAiMode,
    clearResponses: () => setAiResponses([]),
  };
}
