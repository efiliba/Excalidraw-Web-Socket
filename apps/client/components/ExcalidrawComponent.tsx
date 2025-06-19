import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from "@excalidraw/excalidraw/types";

import { ExcalidrawElementChangeSchema, PointerEventSchema } from "@repo/schemas";
import type { PointerEvent, BufferEventType } from "@repo/schemas";

import "@excalidraw/excalidraw/index.css";

// Rename excalidrawAPI to setCurrentInstance and use currentInstance as excalidrawAPI's instance
type Props = {
	userId?: string;
	currentInstance?: ExcalidrawImperativeAPI;
	setCurrentInstance: ExcalidrawProps["excalidrawAPI"];
	onEvent: (event: BufferEventType) => void;
};

export default function ExcalidrawComponent({ userId, currentInstance, setCurrentInstance, onEvent }: Props) {
	const handlePointerUpdate = ({ pointer }: { pointer: Partial<PointerEvent["data"]> }) => {
		onEvent(
			PointerEventSchema.parse({
				type: "pointer",
				data: { ...pointer, userId },
			})
		);
	};

	const handlePointerUp = () => {
		if (currentInstance) {
			onEvent(
				ExcalidrawElementChangeSchema.parse({
					type: "elementChange",
					data: currentInstance.getSceneElements(),
				})
			);
		}
	};

	const handleClearClicked = () => {
		if (currentInstance) {
			currentInstance.updateScene({ elements: [] });

			onEvent(
				ExcalidrawElementChangeSchema.parse({
					type: "elementChange",
					data: [],
				})
			);
		}
	};

	return (
		<div style={{ height: "800px", width: "100%" }}>
			<Excalidraw
				initialData={{
					appState: { activeTool: { type: "freedraw", customType: null, lastActiveTool: null, locked: false } },
				}}
				theme="dark"
				autoFocus
				isCollaborating
				onPointerUpdate={handlePointerUpdate}
				onPointerUp={handlePointerUp}
				excalidrawAPI={setCurrentInstance}
			>
				<MainMenu>
					<MainMenu.Item onSelect={handleClearClicked}>Clear</MainMenu.Item>
				</MainMenu>
			</Excalidraw>
		</div>
	);
}
