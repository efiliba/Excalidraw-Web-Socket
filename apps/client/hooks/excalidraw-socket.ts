import { useEffect, useRef } from "react";
import { BufferEvent, BufferEventType } from "@repo/schemas";

const useBufferedWebSocket = (handleMessage: (event: BufferEventType) => void, id: string, bufferTime = 10) => {
	const bufferedEvents = useRef<Record<string, BufferEventType>>({});
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		socketRef.current = new WebSocket(`ws://localhost:8787/api/ws/${id}`);

		const socket = socketRef.current;

		console.log("useBufferedWebSocket effect", socket);

		if (socket) {
			socket.onmessage = (event) => {
				console.log("Received event", event);
				handleMessage(BufferEvent.parse(JSON.parse(event.data)));
			};
			socket.onopen = () => {
				console.log("WebSocket opened");
				socket.send("setup");
			};
		}

		const interval = setInterval(() => {
			if (socket && socket.readyState === WebSocket.OPEN && Object.keys(bufferedEvents.current).length > 0) {
				for (const key in bufferedEvents.current) {
					console.log("Sending buffered event", bufferedEvents.current[key]);
					socket.send(JSON.stringify(bufferedEvents.current[key]));
				}

				bufferedEvents.current = {}; // Clear buffer after sending
			}
		}, bufferTime);

		return () => {
			clearInterval(interval);
			if (socket) {
				socket.close();
			}
		};
	});

	const sendEvent = (event: BufferEventType) => {
		if (event.type === "pointer") {
			bufferedEvents.current[event.data.userId] = event;
		} else if (event.type === "elementChange") {
			// For a production ready implementation, you would want to handle
			// specific element changes and not the entire element list.
			// This exmaple just saves the entire element list and batches them to
			// the websocket server
			bufferedEvents.current["all-elements"] = event;
		}
	};

	return sendEvent;
};

export default useBufferedWebSocket;
