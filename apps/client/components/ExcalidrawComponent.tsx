import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";

import "@excalidraw/excalidraw/index.css";

type Props = ExcalidrawProps & {
	onClearClicked: () => void;
};

export default function ExcalidrawComponent({ excalidrawAPI, onPointerUpdate, onPointerUp, onClearClicked }: Props) {
	return (
		<div style={{ height: "800px", width: "100%" }}>
			<Excalidraw
				initialData={{
					appState: { activeTool: { type: "freedraw", customType: null, lastActiveTool: null, locked: false } },
				}}
				theme="dark"
				autoFocus
				isCollaborating
				onPointerUpdate={onPointerUpdate}
				onPointerUp={onPointerUp}
				excalidrawAPI={excalidrawAPI}
			>
				<MainMenu>
					<MainMenu.Item onSelect={onClearClicked}>Clear</MainMenu.Item>
				</MainMenu>
			</Excalidraw>
		</div>
	);
}
