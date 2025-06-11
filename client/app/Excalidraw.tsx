"use client";

import dynamic from "next/dynamic";
import { ExcalidrawImperativeAPI, SocketId } from "@excalidraw/excalidraw/types";
import { useEffect, useState } from "react";
import useBufferedWebSocket from "@/hooks/excalidraw-socket";
import { BufferEventType, PointerEventSchema, PointerEvent, ExcalidrawElementChangeSchema, ExcalidrawElementChange } from "../types";
// import { useParams } from "next/navigation";

const Excalidraw = dynamic(
	async () => {
		const mod = await import("@excalidraw/excalidraw");
		return mod.Excalidraw;
	},
	{ ssr: false }
);

function ExcalidrawComponent() {
	const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
	// const { id } = useParams({ from: "/excalidraw/$id" });
	const id = "123";

	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		// Import CSS only on client side
		import("@excalidraw/excalidraw/index.css");
	}, []);

	useEffect(() => {
		// Try to get userId from localStorage first
		const storedId = localStorage.getItem("userId");

		if (storedId) {
			setUserId(storedId);
		} else {
			// Generate a new ID if none exists
			const id = Math.random().toString(36).substring(2, 15);
			// Save the ID to localStorage for future use
			localStorage.setItem("userId", id);
			setUserId(id);
		}
	}, []);

	useEffect(() => {
		// Try to get userId from localStorage first
		const storedId = localStorage.getItem("userId");

		if (storedId) {
			setUserId(storedId);
		} else {
			// Generate a new ID if none exists
			const id = Math.random().toString(36).substring(2, 15);
			// Save the ID to localStorage for future use
			localStorage.setItem("userId", id);
			setUserId(id);
		}
	}, []);

	const handleMessage = (event: BufferEventType) => {
		if (event.type === "pointer") {
			handlePointerEvent(event);
		} else if (event.type === "elementChange") {
			handleElementChangeEvent(event);
		}
	};

	const handlePointerEvent = (event: PointerEvent) => {
		if (excalidrawAPI) {
			const allCollaborators = excalidrawAPI.getAppState().collaborators;
			const colaborator = new Map(allCollaborators);
			colaborator.set(event.data.userId as SocketId, {
				username: event.data.userId,
				pointer: {
					x: event.data.x,
					y: event.data.y,
					tool: "laser",
				},
			});
			if (userId) {
				colaborator.delete(userId as SocketId);
			}
			excalidrawAPI.updateScene({
				collaborators: colaborator,
			});
		}
	};

	const handleElementChangeEvent = (event: ExcalidrawElementChange) => {
		if (excalidrawAPI) {
			// Update the scene with the new elements
			excalidrawAPI.updateScene({
				elements: event.data,
			});
			console.log("Element change received:", event.data);
		}
	};

	const sendEventViaSocket = useBufferedWebSocket(handleMessage, id);

	return (
		<div className="canvas" style={{ height: "800px", width: "100%" }}>
			<Excalidraw
				onPointerUpdate={(payload) => {
					sendEventViaSocket(
						PointerEventSchema.parse({
							type: "pointer",
							data: {
								userId: userId,
								x: payload.pointer.x,
								y: payload.pointer.y,
							},
						})
					);
				}}
				onPointerUp={() => {
					if (excalidrawAPI) {
						sendEventViaSocket(
							ExcalidrawElementChangeSchema.parse({
								type: "elementChange",
								data: excalidrawAPI.getSceneElements(),
							})
						);
					}
				}}
				excalidrawAPI={(api) => setExcalidrawAPI(api)}
			/>
		</div>
	);
}

export default ExcalidrawComponent;
