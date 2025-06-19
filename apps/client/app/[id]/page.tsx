"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ExcalidrawImperativeAPI, SocketId } from "@excalidraw/excalidraw/types";

import { BufferEvent, BufferEventType, PointerEvent, ExcalidrawElementChange } from "@repo/schemas";

// Import ExcalidrawComponent only on client side to prevent: ReferenceError: window is not defined
const ExcalidrawComponent = dynamic(async () => (await import("@/components/ExcalidrawComponent")).default, { ssr: false });

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const [userId, setUserId] = useState<string | undefined>();
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | undefined>();

	const socketRef = useRef<WebSocket | undefined>(undefined);

	const handleMessage = useCallback(
		(event: BufferEventType) => {
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

			switch (event.type) {
				case "pointer":
					handlePointerEvent(event);
					break;
				case "elementChange":
					handleElementChangeEvent(event);
					break;
			}
		},
		[excalidrawAPI, userId]
	);

	useEffect(() => {
		const socket = new WebSocket(`ws://localhost:8787/api/ws/${id}`);
		socketRef.current = socket;

		socket.onmessage = ({ data }) => {
			if (data !== "setup") {
				handleMessage(BufferEvent.parse(JSON.parse(data)));
			}
		};

		socket.onopen = () => socket.send("setup"); // Call setup functionality

		socket.onclose = () => console.log("socket closed");

		return () => {
			if (socket.readyState === WebSocket.OPEN) {
				socket.close();
			}
		};
	}, [id, handleMessage]);

	useEffect(() => {
		// Try to get userId from localStorage else generate a new one
		let id = localStorage.getItem("userId");
		if (!id) {
			id = Math.random().toString(36).substring(2, 15);
			localStorage.setItem("userId", id);
		}

		setUserId(id);
	}, []);

	const sendEventViaWebSocket = (event: BufferEventType) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(JSON.stringify(event));
		}
	};

	return (
		<ExcalidrawComponent
			userId={userId}
			currentInstance={excalidrawAPI}
			setCurrentInstance={setExcalidrawAPI}
			onEvent={sendEventViaWebSocket}
		/>
	);
}
