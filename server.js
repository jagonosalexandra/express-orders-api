import express from "express";
import { readFile, writeFile } from "fs/promises";
import { z } from "zod";

const app = express();
const PORT = 3000;

app.use(express.json());

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

app.use(logger);

const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

const createOrderSchema = z.object({
  customer_id: z.string().min(1),
  status: orderStatusSchema.default("pending"),
  total: z.number().positive(),
  items: z.number().int().positive(),
});

const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  total: z.number().positive().optional(),
  items: z.number().int().positive().optional(),
  shipped: z.iso.date().nullable().optional(),
  delivered: z.iso.date().nullable().optional(),
});

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({ error: result.error.issues });

    req.body = result.data;
    next();
  };
}

async function getOrders() {
  const data = await readFile("./data.json", "utf-8");
  return JSON.parse(data);
}

async function saveOrders(orders) {
  await writeFile("./data.json", JSON.stringify(orders, null, 2));
}

app.get("/orders", async (req, res, next) => {
  try {
    const { status } = req.query;

    const orders = await getOrders();

    if (status) {
      const filtered = orders.filter((o) => o.status === status);
      return res.json(filtered);
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.get("/orders/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const orders = await getOrders();
    const order = orders.find((o) => o.id === id);

    if (!order)
      return res.status(404).json({ error: `Order with ID ${id} not found` });

    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.post("/orders", validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const orders = await getOrders();

    const newOrder = {
      id: crypto.randomUUID(),
      ...req.body,
      created: new Date().toISOString().split("T")[0],
      shipped: null,
      delivered: null,
    };

    orders.push(newOrder);
    await saveOrders(orders);

    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

app.patch(
  "/orders/:id",
  validateBody(updateOrderSchema),
  async (req, res, next) => {
    try {
      const orders = await getOrders();
      let index = orders.findIndex((o) => o.id === req.params.id);

      if (index === -1)
        return res.status(404).json({ error: "Order not found" });

      orders[index] = {
        ...orders[index],
        ...req.body,
        id: orders[index].id,
      };

      await saveOrders(orders);

      res.status(200).json(orders[index]);
    } catch (error) {
      next(error);
    }
  },
);

app.delete("/orders/:id", async (req, res, next) => {
  try {
    const orders = await getOrders();
    const filtered = orders.filter((o) => o.id !== req.params.id);

    if (filtered.length === orders.length)
      return res.status(404).json({ error: "Order not found" });

    await saveOrders(filtered);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: "Sorry can't find that" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
