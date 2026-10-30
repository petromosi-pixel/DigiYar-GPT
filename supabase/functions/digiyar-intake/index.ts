import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_bqx_jIKEbJnKOSOGO7u1jA_r88Pe3NY";

const ALLOWED_ORIGINS = new Set([
  "https://digi-yar-core.vercel.app",
  "https://digi-yar-core-digi-yar.vercel.app",
  "https://digi-yar-core-git-main-digi-yar.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

const windows = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function json(data: unknown, status: number, origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "authorization, apikey, content-type, x-client-info");
    headers.set("Access-Control-Max-Age", "86400");
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validOrigin(origin: string | null) {
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function rateLimit(req: Request): boolean {
  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const now = Date.now();
  const entry = windows.get(ip);
  if (!entry || entry.resetAt <= now) {
    windows.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count += 1;
  return true;
}

async function getOptionalUserId(req: Request): Promise<string | null> {
  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return null;
  if (!ANON_KEY) throw new Error("Auth verification is not configured");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authorization }
  });
  if (!response.ok) throw new Error("Invalid or expired session");
  const user = await response.json();
  return typeof user.id === "string" ? user.id : null;
}

async function insertRow(table: string, row: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(row)
  });
  const body = await response.text();
  if (!response.ok) {
    console.error("Database insert failed", table, response.status, body.slice(0, 500));
    throw new Error("Could not save submission");
  }
  const rows = JSON.parse(body);
  return Array.isArray(rows) ? rows[0] : rows;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (!validOrigin(origin)) return json({ error: "Origin not allowed" }, 403, null);

  if (req.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
    return json({ ok: true }, 200, origin);
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({ error: "Server is not configured" }, 503, origin);
  }

  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > 16_384) return json({ error: "Payload too large" }, 413, origin);
  if (!rateLimit(req)) return json({ error: "Too many requests. Try again later." }, 429, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, origin);
  }

  // Honeypot: bots that fill this hidden field are silently rejected.
  if (clean(body.website, 200)) return json({ ok: true }, 202, origin);

  let userId: string | null;
  try {
    userId = await getOptionalUserId(req);
  } catch {
    return json({ error: "Your session is invalid. Sign in again and retry." }, 401, origin);
  }

  const type = clean(body.type, 32);
  try {
    if (type === "support_report") {
      const category = clean(body.category, 100);
      const description = clean(body.description, 4000);
      if (!category || description.length < 8) {
        return json({ error: "Choose a category and enter at least 8 characters." }, 400, origin);
      }
      const diagnosticInput = (body.diagnostic && typeof body.diagnostic === "object")
        ? body.diagnostic as Record<string, unknown> : {};
      const diagnostic = {
        page: clean(diagnosticInput.page, 500),
        appVersion: clean(diagnosticInput.appVersion, 40),
        userAgent: clean(diagnosticInput.userAgent, 500),
        language: clean(diagnosticInput.language, 40),
        online: diagnosticInput.online === true,
        viewport: clean(diagnosticInput.viewport, 40)
      };
      const row = await insertRow("support_reports", {
        user_id: userId,
        category,
        description,
        search_context: clean(body.search_context, 300),
        contact_info: clean(body.contact_info, 200),
        diagnostic
      });
      return json({ ok: true, id: row.id, tracking_code: row.tracking_code, status: row.status }, 201, origin);
    }

    if (type === "contact" || type === "collaboration") {
      const message = clean(body.message, 4000);
      if (message.length < 3) return json({ error: "Enter a message of at least 3 characters." }, 400, origin);
      const contact = clean(body.contact, 200);
      const isEmail = contact.includes("@");
      const row = await insertRow("inquiries", {
        user_id: userId,
        kind: type,
        name: clean(body.name, 120) || null,
        email: isEmail ? contact : null,
        phone: contact && !isEmail ? contact : null,
        subject: clean(body.subject, 160) || null,
        message,
        metadata: {
          source: "digiyar_webapp",
          cooperation_type: clean(body.cooperation_type, 120)
        }
      });
      return json({ ok: true, id: row.id, status: row.status }, 201, origin);
    }

    return json({ error: "Unsupported submission type" }, 400, origin);
  } catch (error) {
    console.error("Submission error", error);
    return json({ error: "ثبت پیام انجام نشد. چند لحظه بعد دوباره تلاش کن." }, 500, origin);
  }
});
