import { DurableObject } from "cloudflare:workers";
import { BufferEvent, ExcalidrawElementChangeSchema } from "../types";

export class DurableObjectWebSocket extends DurableObject<Cloudflare> {
	elements: any[] = [];

	constructor(ctx: DurableObjectState, env: Cloudflare) {
		super(ctx, env);

		ctx.blockConcurrencyWhile(async () => {
			this.elements = (await ctx.storage.get("elements")) || [];
		});
	}

	async fetch(request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const client = webSocketPair[1];
		const server = webSocketPair[0];
		// const { 0: server, 1: client } = new WebSocketPair();

		this.ctx.acceptWebSocket(server);
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		if (message === "setup") {
			ws.send(
				JSON.stringify(
					ExcalidrawElementChangeSchema.parse({
						type: "elementChange",
						data: this.elements,
					})
				)
			);
			return;
		}

		this.broadcastMsg(ws, message);
	}

	webSocketClose(ws: WebSocket) {
		console.log("WebSocket closed");
	}

	webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
		console.log("Error:", error);
	}

	broadcastMsg(ws: WebSocket, message: string | ArrayBuffer) {
		for (const session of this.ctx.getWebSockets()) {
			if (session !== ws) {
				session.send(message);
			}
		}
		if (typeof message === "string") {
			const event = BufferEvent.parse(JSON.parse(message));
			if (event.type === "elementChange") {
				this.elements = event.data;
				this.ctx.storage.put("elements", this.elements);
			}
		}
	}

	async getElements() {
		return {
			data: this.elements,
		};
	}

	count = 0;
	async inc() {
		return ++this.count;
	}
}
