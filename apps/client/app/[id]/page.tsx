"use client";

import { use, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawImperativeAPI, SocketId } from "@excalidraw/excalidraw/types";

import {
	BufferEvent,
	BufferEventType,
	PointerEvent,
	PointerEventSchema,
	ExcalidrawElementChange,
	ExcalidrawElementChangeSchema,
} from "@repo/schemas";

// Import ExcalidrawComponent only on client side to prevent: ReferenceError: window is not defined
const ExcalidrawComponent = dynamic(async () => (await import("@/components/ExcalidrawComponent")).default, { ssr: false });

const BUFFER_TIME = 10;

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const [userId, setUserId] = useState<string | null>(null);
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

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

			socket.onclose = () => console.log("socket closed");
		}

		const interval = setInterval(() => {
			const events = Object.values(bufferedEvents.current);
			if (socket.readyState === WebSocket.OPEN) {
				events.forEach((event) => socket.send(JSON.stringify(event)));

				bufferedEvents.current = {}; // Clear buffer after sending
			}
		}, BUFFER_TIME);

		return () => {
			clearInterval(interval);

			if (socket?.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	});

	useEffect(() => {
		// Try to get userId from localStorage else generate a new one
		let id = localStorage.getItem("userId");
		if (!id) {
			id = Math.random().toString(36).substring(2, 15);
			localStorage.setItem("userId", id);
		}

		setUserId(id);
	}, []);

	const handleMessage = (event: BufferEventType) => {
		switch (event.type) {
			case "pointer":
				handlePointerEvent(event);
				break;
			case "elementChange":
				handleElementChangeEvent(event);
				break;
		}
	};

	const handlePointerEvent = ({ data }: PointerEvent) => {
		if (excalidrawAPI) {
			const collaborators = new Map(excalidrawAPI.getAppState().collaborators);

			collaborators.set(data.userId as SocketId, {
				username: data.userId,
				pointer: {
					x: data.x,
					y: data.y,
					tool: "laser",
				},
			});

			if (userId) {
				collaborators.delete(userId as SocketId);
			}

			excalidrawAPI.updateScene({ collaborators });
		}
	};

	const handleElementChangeEvent = ({ data }: ExcalidrawElementChange) => excalidrawAPI?.updateScene({ elements: data });

	const sendEventViaWebSocket = (event: BufferEventType) => {
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

	const handlePointerUpdate = ({ pointer }: { pointer: Partial<PointerEvent["data"]> }) => {
		sendEventViaWebSocket(
			PointerEventSchema.parse({
				type: "pointer",
				data: { ...pointer, userId },
			})
		);
	};

	const handlePointerUp = () => {
		if (excalidrawAPI) {
			sendEventViaWebSocket(
				ExcalidrawElementChangeSchema.parse({
					type: "elementChange",
					data: excalidrawAPI.getSceneElements(),
				})
			);
		}
	};

	const handleClearClicked = () => {
		if (excalidrawAPI) {
			excalidrawAPI.updateScene({ elements: [] });

			sendEventViaWebSocket(
				ExcalidrawElementChangeSchema.parse({
					type: "elementChange",
					data: excalidrawAPI.getSceneElements(),
				})
			);
		}
	};

	return (
		<ExcalidrawComponent
			excalidrawAPI={setExcalidrawAPI}
			onPointerUpdate={handlePointerUpdate}
			onPointerUp={handlePointerUp}
			onClearClicked={handleClearClicked}
		/>
	);
}
