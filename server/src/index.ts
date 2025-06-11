import { Hono } from "hono";
import { z } from "zod";

export { DurableObjectWebSocket } from "./durable-object";

const ArraySchema = z.object({
	data: z.array(z.any()),
});

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c) => {
	// Create a `DurableObjectId` for an instance of the `DurableObjectWebSocket` class named "baz".
	// Requests from all Workers to the instance named "baz" will go to a single globally unique Durable Object instance.
	const id = c.env.DURABLE_OBJECT.idFromName("baz");
	// Create a stub to open a communication channel with the Durable Object instance.
	const stub = c.env.DURABLE_OBJECT.get(id);
	// Call the `inc()` RPC method on the stub to invoke the method on the remote Durable Object instance
	const count = await stub.inc();
	return c.json({ message: "Hello World!", count });
});

app.get("/api/get-elements/:drawingId", async (c) => {
	const drawingId = c.req.param("drawingId");
	const durableObjectId = c.env.DURABLE_OBJECT.idFromName(drawingId);
	const stub = c.env.DURABLE_OBJECT.get(durableObjectId);
	const elements = await stub.getElements();
	return c.json(ArraySchema.parse(elements));
});

app.get("api/ws/:drawingId", (c) => {
	const drawingId = c.req.param("drawingId");
	const upgradeHeader = c.req.header("Upgrade");
	if (!upgradeHeader || upgradeHeader !== "websocket") {
		return c.text("Expected websocket", 400);
	}

	const id = c.env.DURABLE_OBJECT.idFromName(drawingId);
	const stub = c.env.DURABLE_OBJECT.get(id);

	return stub.fetch(c.req.raw);
});

export default app;
