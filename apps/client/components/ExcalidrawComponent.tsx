import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from "@excalidraw/excalidraw/types";

import { ExcalidrawElementChangeSchema, PointerEventSchema, PointerEvent, BufferEventType } from "@repo/schemas";

import "@excalidraw/excalidraw/index.css";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const XO_BOARD = [
	{
		id: "UB1k-j8B3UKXz7_OhgynT",
		type: "line",
		x: 560,
		y: 100,
		width: 1,
		height: 660,
		angle: 0,
		strokeColor: "#1e1e1e",
		backgroundColor: "transparent",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 1,
		opacity: 100,
		groupIds: [],
		frameId: null,
		index: "a2",
		roundness: {
			type: 2,
		},
		seed: 753148208,
		version: 112,
		versionNonce: 1563087152,
		isDeleted: false,
		boundElements: null,
		updated: 1750571733423,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[-1, 660],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "zA0NnuWHbOxhQ_gsuwLQi",
		type: "line",
		x: 840,
		y: 100,
		width: 1,
		height: 660,
		angle: 0,
		strokeColor: "#1e1e1e",
		backgroundColor: "transparent",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 1,
		opacity: 100,
		groupIds: [],
		frameId: null,
		index: "a3",
		roundness: {
			type: 2,
		},
		seed: 2082024240,
		version: 145,
		versionNonce: 604442576,
		isDeleted: false,
		boundElements: null,
		updated: 1750571746256,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[-1, 660],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "UWxS5YILUaGA70aNiLcMZ",
		type: "line",
		x: 290,
		y: 300,
		width: 850,
		height: 1,
		angle: 0,
		strokeColor: "#1e1e1e",
		backgroundColor: "transparent",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 1,
		opacity: 100,
		groupIds: [],
		frameId: null,
		index: "a4",
		roundness: {
			type: 2,
		},
		seed: 640980432,
		version: 182,
		versionNonce: 1308604368,
		isDeleted: false,
		boundElements: null,
		updated: 1750571758456,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[850, -1],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "jX74hymdvjMdnR2pNI8p9",
		type: "line",
		x: 290,
		y: 520,
		width: 850,
		height: 1,
		angle: 0,
		strokeColor: "#1e1e1e",
		backgroundColor: "transparent",
		fillStyle: "solid",
		strokeWidth: 2,
		strokeStyle: "solid",
		roughness: 1,
		opacity: 100,
		groupIds: [],
		frameId: null,
		index: "a5",
		roundness: {
			type: 2,
		},
		seed: 1524121040,
		version: 221,
		versionNonce: 2078782256,
		isDeleted: false,
		boundElements: null,
		updated: 1750571771706,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[850, -1],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
] as unknown as ExcalidrawElement[];

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

	const handleCreateXoBoardClicked = () => {
		if (currentInstance) {
			currentInstance.updateScene({ elements: XO_BOARD });

			onEvent(
				ExcalidrawElementChangeSchema.parse({
					type: "elementChange",
					data: XO_BOARD,
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
					<MainMenu.Item onSelect={handleCreateXoBoardClicked}>Create Board</MainMenu.Item>
				</MainMenu>
			</Excalidraw>
		</div>
	);
}
