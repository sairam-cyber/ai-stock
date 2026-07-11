import { io } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";

export const socket = io(WS_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
