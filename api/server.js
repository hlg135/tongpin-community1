const http = require("http");
const { readData, writeData } = require("./store");

const PORT = process.env.PORT || 3000;

const sendJson = (res, code, obj) => {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(obj));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/community") {
    if (req.method === "GET") {
      return sendJson(res, 200, readData());
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const current = readData();
      const merged = {
        ...current,
        likes: { ...current.likes, ...(body.likes || {}) },
        bookmarks: { ...current.bookmarks, ...(body.bookmarks || {}) },
        comments: { ...current.comments, ...(body.comments || {}) },
        createdPosts: Array.isArray(body.createdPosts) ? [...new Set([...current.createdPosts, ...body.createdPosts])] : current.createdPosts,
        joinedMembers: Array.isArray(body.joinedMembers) ? [...new Set([...current.joinedMembers, ...body.joinedMembers])] : current.joinedMembers,
        likedMembers: Array.isArray(body.likedMembers) ? [...new Set([...current.likedMembers, ...body.likedMembers])] : current.likedMembers,
        likedBoards: Array.isArray(body.likedBoards) ? [...new Set([...current.likedBoards, ...body.likedBoards])] : current.likedBoards,
        version: (current.version || 1) + 1
      };
      writeData(merged);
      return sendJson(res, 200, { ok: true, version: merged.version, data: merged });
    }
    return sendJson(res, 405, { error: "method not allowed" });
  }

  if (url.pathname === "/" || url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", service: "tongpin-community-api" });
  }

  return sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`tongpin-community-api listening on http://localhost:${PORT}`);
});
