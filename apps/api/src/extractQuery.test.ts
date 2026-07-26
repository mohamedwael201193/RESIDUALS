import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Request } from "express";
import { extractQuery } from "./extractQuery.js";

function fakeReq(partial: { query?: object; body?: unknown }): Request {
  return partial as unknown as Request;
}

describe("extractQuery", () => {
  it("reads GET ?q=", () => {
    assert.equal(extractQuery(fakeReq({ query: { q: "  hello world  " } })), "hello world");
  });

  it("reads POST JSON query", () => {
    assert.equal(
      extractQuery(fakeReq({ query: {}, body: { query: "How do I renew a passport?" } })),
      "How do I renew a passport?",
    );
  });

  it("reads POST JSON question", () => {
    assert.equal(
      extractQuery(fakeReq({ body: { question: "How do I tie a necktie?" } })),
      "How do I tie a necktie?",
    );
  });

  it("reads form-style body q", () => {
    assert.equal(extractQuery(fakeReq({ body: { q: "bank account singapore" } })), "bank account singapore");
  });

  it("prefers querystring over body", () => {
    assert.equal(
      extractQuery(fakeReq({ query: { q: "from-get" }, body: { query: "from-body" } })),
      "from-get",
    );
  });

  it("reads nested input.query", () => {
    assert.equal(
      extractQuery(fakeReq({ body: { input: { query: "nested how-to" } } })),
      "nested how-to",
    );
  });

  it("returns empty when missing", () => {
    assert.equal(extractQuery(fakeReq({ query: {}, body: {} })), "");
  });
});
