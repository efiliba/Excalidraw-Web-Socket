import { DurableObject } from "cloudflare:workers";
import { BufferEvent, ExcalidrawElementChangeSchema } from "@repo/schemas";

export class DurableObjectWebSocket extends DurableObject<Cloudflare> {
	elements: unknown[] = [];

	constructor(ctx: DurableObjectState, env: Cloudflare) {
		super(ctx, env);

		ctx.blockConcurrencyWhile(async () => {
			this.elements = (await ctx.storage.get("elements")) || [];
		});
	}

	async fetch(request: Request): Promise<Response> {
		const { 0: server, 1: client } = new WebSocketPair();
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
		this.ctx.getWebSockets().forEach((socket) => {
			if (socket !== ws) {
				socket.send(message);
			}
		});

		// Handle initial elements population when app starts by recieving the "setup" command
		if (message === "setup") {
			ws.send(
				JSON.stringify(
					ExcalidrawElementChangeSchema.parse({
						type: "elementChange",
						data: this.elements,
					})
				)
			);
		} else {
			this.broadcastMsg(ws, message);
		}
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, "Durable Object is closing WebSocket");
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
			const { type, data } = BufferEvent.parse(JSON.parse(message));

			if (type === "elementChange") {
				this.elements = data;
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
