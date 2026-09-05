import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/app.js";

describe("Orders API", () => {
  describe("GET /orders", () => {
    it("returns all orders", async () => {
      const res = await request(app).get("/orders");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("filters by status query param", async () => {
      const res = await request(app)
        .get("/orders")
        .query({ status: "pending" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      res.body.forEach((order) => {
        expect(order.status).toBe("pending");
      });
    });
  });

  describe("GET /orders/:id", () => {
    it("returns a single order", async () => {
      const created = await request(app).post("/orders").send({
        customer_id: "CUST-TEST",
        total: 50.55,
        items: 1,
      });

      const res = await request(app).get(`/orders/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", created.body.id);
    });
  });

  describe("POST /orders", () => {
    it("creates a new order", async () => {
      const newOrder = {
        customer_id: "CUST-TEST",
        total: 99.99,
        items: 3,
      };

      const res = await request(app).post("/orders").send(newOrder);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("status", "pending");
      expect(res.body).toHaveProperty("total", 99.99);
    });

    it("returns 400 for invalid data", async () => {
      const res = await request(app)
        .post("/orders")
        .send({ customer_id: "CUST-TEST" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("return 400 for wrong type", async () => {
      const res = await request(app).post("/orders").send({
        customer_id: "CUST-TEST",
        total: "not-a-number",
        items: -5,
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("PATCH /orders/:id", () => {
    it("updates an order partially", async () => {
      const created = await request(app).post("/orders").send({
        customer_id: "CUST-TEST",
        total: 50.55,
        items: 1,
      });

      const res = await request(app)
        .patch(`/orders/${created.body.id}`)
        .send({ status: "processing" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "processing");
    });
  });

  describe("DELETE /orders/:id", () => {
    it("delete an order", async () => {
      const created = await request(app).post("/orders").send({
        customer_id: "CUST-TEST",
        total: 50.55,
        items: 1,
      });

      const res = await request(app).delete(`/orders/${created.body.id}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/orders/${created.body.id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe("404 Handler", () => {
    it("returns 404 for a nonexistent order", async () => {
      const res = await request(app).get("/orders/nonexistent-id");
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });
  });
});
