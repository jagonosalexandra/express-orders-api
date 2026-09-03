import express from "express";
import { readFile } from "fs/promises";

const app = express();
const PORT = 3000;

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}

app.use(logger);

app.get("/orders", async (req, res, next) => {
  try {
    const data = await readFile("./data.json", "utf-8");
    const orders = JSON.parse(data);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

app.get("/orders/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await readFile("./data.json", "utf-8");
    const orders = JSON.parse(data);

    const order = orders.find((o) => o.id === id);

    if (!order)
      return res.status(404).json({ error: `Order with ID ${id} not found` });

    res.json(order);
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
