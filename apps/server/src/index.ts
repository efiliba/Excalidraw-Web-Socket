import { Hono } from "hono";
import type { Context } from "hono";

export { DurableObjectWebSocket } from "./durable-object-ws";

// Worker
const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c: Context) => {
	const id = c.env.DURABLE_OBJECT_WS.idFromName("baz");
	const stub = c.env.DURABLE_OBJECT_WS.get(id);
	const count = await stub.inc();
	return c.json({ message: "Hello World!", count });
});

app.get("api/ws/:drawingId", (c) => {
	const drawingId = c.req.param("drawingId");
	const upgradeHeader = c.req.header("Upgrade");
	if (upgradeHeader !== "websocket") {
		return c.text("Expected websocket", 426);
	}

	const id = c.env.DURABLE_OBJECT_WS.idFromName(drawingId);
	const stub = c.env.DURABLE_OBJECT_WS.get(id);

	return stub.fetch(c.req.raw);
});

export default app;
