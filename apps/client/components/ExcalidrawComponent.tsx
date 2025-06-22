import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from "@excalidraw/excalidraw/types";

import { ExcalidrawElementChangeSchema, PointerEventSchema, PointerEvent, BufferEventType } from "@repo/schemas";

import "@excalidraw/excalidraw/index.css";
import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const XO_BOARD = [
	{
		id: "n85zZ-RTU4rocHaei-7lT",
		type: "line",
		x: 10,
		y: 280,
		width: 390,
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
		index: "a1",
		roundness: {
			type: 2,
		},
		seed: 292174838,
		version: 70,
		versionNonce: 15441846,
		isDeleted: false,
		boundElements: null,
		updated: 1750578521368,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[390, 0],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "NEu_qlWAwycV9sWgKNFe2",
		type: "line",
		x: 10,
		y: 480,
		width: 390,
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
		index: "a2",
		roundness: {
			type: 2,
		},
		seed: 2097821942,
		version: 51,
		versionNonce: 873389610,
		isDeleted: false,
		boundElements: null,
		updated: 1750578531935,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[390, 0],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "VId3f2_aLf55UIfz5qhDJ",
		type: "line",
		x: 130,
		y: 100,
		width: 1,
		height: 600,
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
		seed: 329615594,
		version: 124,
		versionNonce: 1377689322,
		isDeleted: false,
		boundElements: null,
		updated: 1750578561017,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[0, 600],
		],
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: null,
	},
	{
		id: "3f9m1kMDg1pfxc006UIlG",
		type: "line",
		x: 260,
		y: 100,
		width: 1,
		height: 600,
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
		seed: 1158997046,
		version: 109,
		versionNonce: 1678458538,
		isDeleted: false,
		boundElements: null,
		updated: 1750578549034,
		link: null,
		locked: false,
		points: [
			[0, 0],
			[0, 600],
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
