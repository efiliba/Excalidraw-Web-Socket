import { useEffect, useRef } from "react";
import { BufferEvent, BufferEventType } from "@repo/schemas";

export const useBufferedWebSocket = (handleMessage: (event: BufferEventType) => void, id: string, bufferTime = 10) => {
	const bufferedEvents = useRef<Record<string, BufferEventType>>({});

	useEffect(() => {
		const socket = new WebSocket(`ws://localhost:8787/api/ws/${id}`);

		if (socket) {
			socket.onmessage = ({ data }) => {
				if (data !== "setup") {
					handleMessage(BufferEvent.parse(JSON.parse(data)));
				}
			};

			socket.onopen = () => socket.send("setup"); // Call setup functionality

			socket.onclose = () => console.log("------>socket closed");
		}

		const interval = setInterval(() => {
			if (socket.readyState === WebSocket.OPEN && Object.keys(bufferedEvents.current).length > 0) {
				Object.values(bufferedEvents.current).forEach((event) => socket.send(JSON.stringify(event)));

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

	return (event: BufferEventType) => {
		switch (event.type) {
			case "pointer":
				bufferedEvents.current[event.data.userId] = event;
				break;
			case "elementChange":
				// For a production ready implementation, you would want to handle specific element changes and not the
				// entire element list. This exmaple just saves the entire element list and batches them to the ws server
				bufferedEvents.current["all-elements"] = event;
				break;
		}
	};
};
