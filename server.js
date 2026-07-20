const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "scores.json");
const FRONTEND_DIR = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// ---------- Helpers ----------

function readScores() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeScores(scores) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

function json(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error("Invalid JSON")); }
    });
  });
}

// ---------- Routes ----------

function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;
  const pathname = url.pathname;

  // -------- API routes --------

  // POST /api/scores
  if (method === "POST" && pathname === "/api/scores") {
    return parseBody(req).then(body => {
      const { player, game, score, total } = body;
      if (!player || !game || score === undefined || total === undefined) {
        return json(res, 400, { error: "Missing fields: player, game, score, total" });
      }
      const scores = readScores();
      const entry = {
        id: Date.now(),
        player: player.trim(),
        game,
        score,
        total,
        pct: total > 0 ? Math.round((score / total) * 100) : 0,
        date: new Date().toISOString()
      };
      scores.push(entry);
      writeScores(scores);
      json(res, 201, entry);
    }).catch(e => json(res, 400, { error: "Invalid JSON" }));
  }

  // GET /api/scores/leaderboard/:game
  const leaderMatch = pathname.match(/^\/api\/scores\/leaderboard\/(.+)$/);
  if (method === "GET" && leaderMatch) {
    const scores = readScores();
    const filtered = scores
      .filter(s => s.game.toLowerCase() === leaderMatch[1].toLowerCase())
      .sort((a, b) => b.pct - a.pct || b.score - a.score)
      .slice(0, 10);
    return json(res, 200, filtered);
  }

  // GET /api/scores/recent
  if (method === "GET" && pathname === "/api/scores/recent") {
    const scores = readScores();
    return json(res, 200, scores.reverse().slice(0, 20));
  }

  // GET /api/scores/player/:player
  const playerMatch = pathname.match(/^\/api\/scores\/player\/(.+)$/);
  if (method === "GET" && playerMatch) {
    const scores = readScores();
    const filtered = scores.filter(s => s.player.toLowerCase() === playerMatch[1].toLowerCase()).reverse();
    return json(res, 200, filtered);
  }

  // GET /api/stats
  if (method === "GET" && pathname === "/api/stats") {
    const scores = readScores();
    const totalPlays = scores.length;
    const uniquePlayers = new Set(scores.map(s => s.player.toLowerCase())).size;
    const totalCorrect = scores.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
    return json(res, 200, {
      totalPlays,
      uniquePlayers,
      totalCorrect,
      totalQuestions,
      avgPct: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    });
  }

  // -------- Static files --------

  let filePath = pathname === "/" ? "/l.html" : pathname;
  filePath = path.join(FRONTEND_DIR, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to index.html
      fs.readFile(path.join(FRONTEND_DIR, "l.html"), (err2, data2) => {
        if (err2) {
          res.writeHead(500);
          return res.end("Server error");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data2);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(router);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
