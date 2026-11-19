import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface MockTransaction {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface MockNotification {
  id: number;
  user_id: number;
  message: string;
  reply: string | null;
  created_at: string;
  replied_at: string | null;
  read: boolean;
}

interface MockUserLimit {
  id: number;
  user_id: number;
  daily_limit: number | null;
  monthly_limit: number | null;
  daily_limit_enabled: boolean;
  monthly_limit_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// In-memory store used when DATABASE_URL is not configured or unavailable
const nowIso = () => new Date().toISOString();
const adminPasswordHash = bcrypt.hashSync("Siyanbola2468@@", 10);

const mockStore = {
  users: [
    {
      id: 1,
      name: "Admin",
      email: "victortobi2000@gmail.com",
      password: adminPasswordHash,
      active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ] as MockUser[],
  transactions: [] as MockTransaction[],
  notifications: [] as MockNotification[],
  userLimits: [] as MockUserLimit[],
  seq: {
    users: 2,
    transactions: 1,
    notifications: 1,
    userLimits: 1,
  },
};

function runMockQuery(sql: string, params: any[] = []): { rows: any[]; rowCount: number } {
  const q = sql.replace(/\s+/g, " ").trim();
  const upper = q.toUpperCase();

  // Connection health check
  if (upper.startsWith("SELECT NOW()")) {
    const ts = nowIso();
    return { rows: [{ now: ts, current_time: ts }], rowCount: 1 };
  }

  // Transaction control statements
  if (upper === "BEGIN" || upper === "COMMIT" || upper === "ROLLBACK") {
    return { rows: [], rowCount: 0 };
  }

  // USERS
  if (upper.includes("SELECT * FROM USERS WHERE EMAIL = $1")) {
    const email = String(params[0] ?? "").toLowerCase();
    const rows = mockStore.users.filter((u) => u.email.toLowerCase() === email);
    return { rows, rowCount: rows.length };
  }

  if (upper.includes("SELECT * FROM USERS WHERE NAME = $1 OR EMAIL = $2")) {
    const name = String(params[0] ?? "").toLowerCase();
    const email = String(params[1] ?? "").toLowerCase();
    const rows = mockStore.users.filter(
      (u) => u.name.toLowerCase() === name || u.email.toLowerCase() === email
    );
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("INSERT INTO USERS")) {
    const [name, email, password] = params;
    const newUser: MockUser = {
      id: mockStore.seq.users++,
      name: String(name),
      email: String(email),
      password: String(password),
      active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    mockStore.users.push(newUser);
    return {
      rows: [{ id: newUser.id, name: newUser.name, email: newUser.email }],
      rowCount: 1,
    };
  }

  if (upper.includes("FROM USERS U") && upper.includes("LEFT JOIN TRANSACTIONS T")) {
    const rows = [...mockStore.users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((u) => {
        const txCount = mockStore.transactions.filter((t) => t.user_id === u.id).length;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          active: u.active,
          created_at: u.created_at,
          transaction_count: String(txCount),
          has_subscription: txCount > 10,
        };
      });
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("UPDATE USERS SET ACTIVE = $1 WHERE ID = $2")) {
    const active = Boolean(params[0]);
    const userId = Number(params[1]);
    const user = mockStore.users.find((u) => u.id === userId);
    if (!user) return { rows: [], rowCount: 0 };
    user.active = active;
    user.updated_at = nowIso();
    return { rows: [user], rowCount: 1 };
  }

  if (upper.includes("SELECT ID, EMAIL, ACTIVE FROM USERS WHERE ID = $1")) {
    const userId = Number(params[0]);
    const user = mockStore.users.find((u) => u.id === userId);
    if (!user) return { rows: [], rowCount: 0 };
    return {
      rows: [{ id: user.id, email: user.email, active: user.active }],
      rowCount: 1,
    };
  }

  // TRANSACTIONS
  if (upper.includes("SELECT * FROM TRANSACTIONS WHERE USER_ID = $1")) {
    const userId = Number(params[0]);
    const rows = mockStore.transactions
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("INSERT INTO TRANSACTIONS")) {
    const [user_id, type, amount, date, description] = params;
    const tx: MockTransaction = {
      id: mockStore.seq.transactions++,
      user_id: Number(user_id),
      type: String(type),
      amount: Number(amount),
      date: date ? String(date) : nowIso(),
      description: String(description ?? ""),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    mockStore.transactions.push(tx);
    return { rows: [tx], rowCount: 1 };
  }

  if (upper.includes("SELECT * FROM TRANSACTIONS WHERE ID = $1")) {
    const id = Number(params[0]);
    const rows = mockStore.transactions.filter((t) => t.id === id);
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("UPDATE TRANSACTIONS SET")) {
    const [type, amount, date, description, id] = params;
    const tx = mockStore.transactions.find((t) => t.id === Number(id));
    if (!tx) return { rows: [], rowCount: 0 };
    tx.type = String(type);
    tx.amount = Number(amount);
    tx.date = date ? String(date) : tx.date;
    tx.description = String(description ?? "");
    tx.updated_at = nowIso();
    return { rows: [tx], rowCount: 1 };
  }

  if (upper.startsWith("DELETE FROM TRANSACTIONS WHERE ID = $1")) {
    const id = Number(params[0]);
    const idx = mockStore.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return { rows: [], rowCount: 0 };
    const [removed] = mockStore.transactions.splice(idx, 1);
    return { rows: [removed], rowCount: 1 };
  }

  if (upper.startsWith("DELETE FROM TRANSACTIONS WHERE USER_ID = $1")) {
    const userId = Number(params[0]);
    const before = mockStore.transactions.length;
    mockStore.transactions = mockStore.transactions.filter((t) => t.user_id !== userId);
    return { rows: [], rowCount: before - mockStore.transactions.length };
  }

  // NOTIFICATIONS
  if (upper.startsWith("INSERT INTO NOTIFICATIONS")) {
    const [user_id, message] = params;
    const notif: MockNotification = {
      id: mockStore.seq.notifications++,
      user_id: Number(user_id),
      message: String(message),
      reply: null,
      created_at: nowIso(),
      replied_at: null,
      read: false,
    };
    mockStore.notifications.push(notif);
    return { rows: [notif], rowCount: 1 };
  }

  if (upper.includes("SELECT * FROM NOTIFICATIONS WHERE USER_ID = $1")) {
    const userId = Number(params[0]);
    const rows = mockStore.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows, rowCount: rows.length };
  }

  if (upper.includes("SELECT * FROM NOTIFICATIONS")) {
    const rows = [...mockStore.notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("UPDATE NOTIFICATIONS SET REPLY = $1")) {
    const [reply, id] = params;
    const notif = mockStore.notifications.find((n) => n.id === Number(id));
    if (!notif) return { rows: [], rowCount: 0 };
    notif.reply = String(reply);
    notif.replied_at = nowIso();
    notif.read = true;
    return { rows: [notif], rowCount: 1 };
  }

  if (upper.startsWith("UPDATE NOTIFICATIONS SET READ = TRUE WHERE ID = $1")) {
    const id = Number(params[0]);
    const notif = mockStore.notifications.find((n) => n.id === id);
    if (!notif) return { rows: [], rowCount: 0 };
    notif.read = true;
    return { rows: [notif], rowCount: 1 };
  }

  // USER LIMITS
  if (upper.includes("SELECT * FROM USER_LIMITS WHERE USER_ID = $1")) {
    const userId = Number(params[0]);
    const rows = mockStore.userLimits.filter((l) => l.user_id === userId);
    return { rows, rowCount: rows.length };
  }

  if (upper.startsWith("INSERT INTO USER_LIMITS")) {
    const [user_id, daily_limit, monthly_limit, daily_limit_enabled, monthly_limit_enabled] = params;
    const uid = Number(user_id);
    let existing = mockStore.userLimits.find((l) => l.user_id === uid);
    if (existing) {
      existing.daily_limit = daily_limit !== null && daily_limit !== undefined ? Number(daily_limit) : null;
      existing.monthly_limit = monthly_limit !== null && monthly_limit !== undefined ? Number(monthly_limit) : null;
      existing.daily_limit_enabled = Boolean(daily_limit_enabled);
      existing.monthly_limit_enabled = Boolean(monthly_limit_enabled);
      existing.updated_at = nowIso();
      return { rows: [existing], rowCount: 1 };
    }
    const newLimit: MockUserLimit = {
      id: mockStore.seq.userLimits++,
      user_id: uid,
      daily_limit: daily_limit !== null && daily_limit !== undefined ? Number(daily_limit) : null,
      monthly_limit: monthly_limit !== null && monthly_limit !== undefined ? Number(monthly_limit) : null,
      daily_limit_enabled: Boolean(daily_limit_enabled),
      monthly_limit_enabled: Boolean(monthly_limit_enabled),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    mockStore.userLimits.push(newLimit);
    return { rows: [newLimit], rowCount: 1 };
  }

  if (upper.startsWith("DELETE FROM USER_LIMITS WHERE USER_ID = $1")) {
    const userId = Number(params[0]);
    const before = mockStore.userLimits.length;
    mockStore.userLimits = mockStore.userLimits.filter((l) => l.user_id !== userId);
    return { rows: [], rowCount: before - mockStore.userLimits.length };
  }

  return { rows: [], rowCount: 0 };
}

function createMockPool() {
  const mockClient = {
    query: async (sql: string, params?: any[]) => runMockQuery(sql, params),
    release: () => {},
  };

  return {
    query: async (sql: string, params?: any[]) => runMockQuery(sql, params),
    connect: async () => mockClient,
    on: () => {},
    end: async () => {},
  } as unknown as Pool;
}

let pool: Pool;

if (process.env.DATABASE_URL) {
  try {
    const dbConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.SSL_ENABLED === "true" ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    };
    pool = new Pool(dbConfig);
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client:", err.message);
    });
  } catch (err) {
    console.warn("[AI Studio] DB not connected — using in-memory mock:", err);
    pool = createMockPool();
  }
} else {
  console.warn("[AI Studio] DATABASE_URL not set — using in-memory mock database");
  pool = createMockPool();
}

export default pool;
