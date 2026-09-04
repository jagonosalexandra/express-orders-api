import express from "express";
import { readFile, writeFile } from "fs/promises";

const app = express();
const PORT = 3000;

app.use(express.json());

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

app.use(logger);

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

app.post("/orders", async (req, res, next) => {
  try {
    const { customer_id, total, items } = req.body;

    if (
      !customer_id ||
      typeof total !== "number" ||
      typeof items !== "number"
    ) {
      return res
        .status(400)
        .json({ error: "Missing or invalid required fields" });
    }

    const orders = await getOrders();

    const formatId = `ORD-${String(orders.length + 1).padStart(3, "0")}`;

    const newOrder = {
      id: formatId,
      customer_id,
      status: "pending",
      total,
      items,
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

app.patch("/orders/:id", async (req, res, next) => {
  try {
    const orders = await getOrders();
    let index = orders.findIndex((o) => o.id === req.params.id);

    if (index === -1) return res.status(404).json({ error: "Order not found" });

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
});

app.delete("/orders/:id", async (req, res, next) => {
  try {
    const orders = await getOrders();
    const filtered = orders.filter((o) => o.id !== req.params.id);

    if (filtered.length === orders.length)
      return res.status(404).json({ error: "Error not found" });

    await saveOrders(filtered);

    res.status(204).json(filtered);
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
