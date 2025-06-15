"use client";

import dynamic from "next/dynamic";
import { ExcalidrawImperativeAPI, SocketId } from "@excalidraw/excalidraw/types";
import { use, useEffect, useState } from "react";
import { useBufferedWebSocket } from "@/hooks/excalidraw-web-socket";
import { BufferEventType, PointerEventSchema, PointerEvent, ExcalidrawElementChangeSchema, ExcalidrawElementChange } from "@repo/schemas";

import "@excalidraw/excalidraw/index.css";

// Import Excalidraw only on client side to prevent: ReferenceError: window is not defined
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

export default function ExcalidrawComponent({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);

	const [userId, setUserId] = useState<string | null>(null);
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

	const handlePointerEvent = ({ data }: PointerEvent) => {
		if (excalidrawAPI) {
			const allCollaborators = excalidrawAPI.getAppState().collaborators;
			const collaborators = new Map(allCollaborators);

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

	const handleElementChangeEvent = ({ data }: ExcalidrawElementChange) => {
		if (excalidrawAPI) {
			excalidrawAPI.updateScene({ elements: data });
		}
	};

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

	const sendEventViaWebSocket = useBufferedWebSocket(handleMessage, id);

	useEffect(() => {
		// Try to get userId from localStorage else generate a new one
		let id = localStorage.getItem("userId");
		if (!id) {
			id = Math.random().toString(36).substring(2, 15);
			localStorage.setItem("userId", id);
		}

		setUserId(id);
	}, []);

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

	return (
		<div className="canvas" style={{ height: "800px", width: "100%" }}>
			<Excalidraw onPointerUpdate={handlePointerUpdate} onPointerUp={handlePointerUp} excalidrawAPI={setExcalidrawAPI} />
		</div>
	);
}
