const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = process.env.TEST_DB || path.join(__dirname, "app.db");
const JWT_SECRET = process.env.JWT_SECRET || "tal-portal-secret-key-change-in-production";
const JWT_EXPIRY = "7d";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(uploadsDir));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || "general";
    const dest = path.join(uploadsDir, folder);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ---------- DATABASE SETUP ----------

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
console.log("Connected to SQLite database");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'volunteer',
    preferences TEXT DEFAULT '{}',
    reset_token TEXT,
    reset_token_expires INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS student_form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    volunteer_email TEXT,
    volunteer_name TEXT,
    volunteer_contact TEXT,

    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,

    dob TEXT,
    age INTEGER,
    pob TEXT,

    camp_name TEXT,
    camp_date TEXT,

    nationality TEXT,
    address TEXT,

    class TEXT,
    educationcategory TEXT,
    educationsubcategory TEXT,
    educationyear TEXT,

    school TEXT,
    branch TEXT,

    prev_percent REAL,
    present_percent REAL,

    email TEXT,
    contact TEXT,
    whatsapp TEXT,
    student_contact TEXT,

    num_family_members INTEGER DEFAULT 0,
    family_members_details TEXT DEFAULT '[]',

    earning_members INTEGER DEFAULT 0,
    earning_members_details TEXT DEFAULT '[]',

    fee TEXT,
    fee_structure TEXT,

    is_single_parent INTEGER DEFAULT 0,
    does_work INTEGER DEFAULT 0,
    job TEXT,
    has_scholarship INTEGER DEFAULT 0,
    scholarship TEXT,

    aspiration TEXT,
    academic_achievements TEXT,
    non_academic_achievements TEXT,

    years_area TEXT,

    account_no TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    ifsc_code TEXT,

    special_remarks TEXT,

    school_id_url TEXT,
    aadhaar_url TEXT,
    income_proof_url TEXT,
    marksheet_url TEXT,
    passport_photo_url TEXT,
    fees_receipt_url TEXT,
    volunteer_signature_url TEXT,
    student_signature_url TEXT,

    status TEXT DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Fee payments table
db.exec(`
  CREATE TABLE IF NOT EXISTS fee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    paid_by TEXT DEFAULT 'TAL',
    receipt_url TEXT,
    term_number INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE
  );
`);

// Donor-student mapping table
db.exec(`
  CREATE TABLE IF NOT EXISTS donor_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    year_of_support TEXT,
    amount REAL DEFAULT 0,
    is_current_sponsor INTEGER DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE
  );
`);

// Notifications table
db.exec(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient_email TEXT,
    recipient_role TEXT,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    is_read INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Donations table
db.exec(`
  CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER,
    donor_name TEXT,
    donor_email TEXT,
    student_id INTEGER,
    amount REAL NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'online',
    receipt_number TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE SET NULL
  );
`);

// Fee structures table (term-wise installment tracking)
db.exec(`
  CREATE TABLE IF NOT EXISTS fee_structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL UNIQUE,
    total_fee REAL NOT NULL DEFAULT 0,
    num_terms INTEGER NOT NULL DEFAULT 1,
    term_fees TEXT DEFAULT '[]',
    academic_year TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE
  );
`);

// Documents table (file metadata linked to students)
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    uploaded_by TEXT,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE
  );
`);

// Camps table
db.exec(`
  CREATE TABLE IF NOT EXISTS camps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT,
    location TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Camp participation table
db.exec(`
  CREATE TABLE IF NOT EXISTS camp_participation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    camp_id INTEGER NOT NULL,
    status TEXT DEFAULT 'registered',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (camp_id) REFERENCES camps(id) ON DELETE CASCADE,
    UNIQUE(student_id, camp_id)
  );
`);

// Academic records table (subject-wise)
db.exec(`
  CREATE TABLE IF NOT EXISTS academic_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    academic_year TEXT,
    semester TEXT,
    subject_name TEXT NOT NULL,
    marks_obtained REAL,
    max_marks REAL DEFAULT 100,
    grade TEXT,
    certificate_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_form_submissions(id) ON DELETE CASCADE
  );
`);

// Add missing columns to student_form_submissions if they don't exist
const existingColumns = db.prepare("PRAGMA table_info(student_form_submissions)").all().map(c => c.name);
const newColumns = [
  ["father_name", "TEXT"],
  ["mother_name", "TEXT"],
  ["guardian_name", "TEXT"],
  ["head_of_family", "TEXT"],
  ["income_source", "TEXT"],
  ["monthly_income", "REAL"],
  ["num_dependents", "INTEGER"],
  ["school_address", "TEXT"],
  ["submitted_by", "TEXT DEFAULT 'volunteer'"],
];
for (const [col, type] of newColumns) {
  if (!existingColumns.includes(col)) {
    db.exec(`ALTER TABLE student_form_submissions ADD COLUMN ${col} ${type}`);
  }
}

// ---------- HELPERS ----------

// Create a Supabase-shaped user object from DB row
const makeUserObject = (row) => ({
  id: row.id,
  email: row.email,
  user_metadata: {
    name: row.name,
    user_type: row.role,
    contact_number: "",
    preferences: (() => {
      try { return JSON.parse(row.preferences || "{}"); } catch { return {}; }
    })(),
  },
  created_at: row.created_at,
});

// Parse JSON fields and convert booleans on read
const transformStudentRow = (row) => {
  if (!row) return row;
  const r = { ...row };
  try { r.family_members_details = JSON.parse(r.family_members_details || "[]"); } catch { r.family_members_details = []; }
  try { r.earning_members_details = JSON.parse(r.earning_members_details || "[]"); } catch { r.earning_members_details = []; }
  r.is_single_parent = !!r.is_single_parent;
  r.does_work = !!r.does_work;
  r.has_scholarship = !!r.has_scholarship;
  return r;
};

// Prepare row for insert/update (stringify JSON, convert bools)
const prepareStudentPayload = (payload) => {
  const p = { ...payload };
  if (Array.isArray(p.family_members_details)) p.family_members_details = JSON.stringify(p.family_members_details);
  if (Array.isArray(p.earning_members_details)) p.earning_members_details = JSON.stringify(p.earning_members_details);
  if (typeof p.is_single_parent === "boolean") p.is_single_parent = p.is_single_parent ? 1 : 0;
  if (typeof p.does_work === "boolean") p.does_work = p.does_work ? 1 : 0;
  if (typeof p.has_scholarship === "boolean") p.has_scholarship = p.has_scholarship ? 1 : 0;
  delete p.id;
  delete p.created_at;
  return p;
};

// ---------- AUTH ENDPOINTS ----------

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, options } = req.body;
  const name = options?.data?.name || req.body.name || "";
  const user_type = options?.data?.user_type || req.body.user_type || "volunteer";

  if (!email || !password) {
    return res.json({ data: { user: null }, error: { message: "Email and password required" } });
  }

  try {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.json({ data: { user: null }, error: { message: "User already registered" } });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run(name, email, password_hash, user_type);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    console.log(`User registered: ${email} (${user_type})`);
    return res.json({ data: { user: makeUserObject(user) }, error: null });
  } catch (err) {
    console.error("Signup error:", err);
    return res.json({ data: { user: null }, error: { message: err.message } });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ data: { user: null, session: null }, error: { message: "Email and password required" } });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.json({ data: { user: null, session: null }, error: { message: "Invalid login credentials" } });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.json({ data: { user: null, session: null }, error: { message: "Invalid login credentials" } });
    }

    const userObj = makeUserObject(user);
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    console.log(`Login: ${email} (${user.role})`);
    return res.json({
      data: {
        user: userObj,
        session: { access_token: token, user: userObj },
      },
      error: null,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.json({ data: { user: null, session: null }, error: { message: err.message } });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  res.json({ error: null });
});

// GET /api/auth/session
app.get("/api/auth/session", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.json({ data: { session: null }, error: null });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.json({ data: { session: null }, error: null });

    const userObj = makeUserObject(user);
    return res.json({
      data: { session: { access_token: token, user: userObj } },
      error: null,
    });
  } catch {
    return res.json({ data: { session: null }, error: null });
  }
});

// GET /api/auth/user
app.get("/api/auth/user", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.json({ data: { user: null }, error: { message: "Not authenticated" } });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.json({ data: { user: null }, error: { message: "User not found" } });
    return res.json({ data: { user: makeUserObject(user) }, error: null });
  } catch {
    return res.json({ data: { user: null }, error: { message: "Invalid token" } });
  }
});

// PUT /api/auth/user — update password and/or metadata
app.put("/api/auth/user", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.json({ data: { user: null }, error: { message: "Not authenticated" } });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.json({ data: { user: null }, error: { message: "User not found" } });

    const { password, data: metadata } = req.body;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);
    }

    if (metadata) {
      if (metadata.name !== undefined) {
        db.prepare("UPDATE users SET name = ? WHERE id = ?").run(metadata.name, user.id);
      }
      if (metadata.preferences || metadata.contact_number !== undefined) {
        const existing = (() => {
          try { return JSON.parse(user.preferences || "{}"); } catch { return {}; }
        })();
        const merged = { ...existing };
        if (metadata.preferences) Object.assign(merged, metadata.preferences);
        if (metadata.contact_number !== undefined) merged.contact_number = metadata.contact_number;
        db.prepare("UPDATE users SET preferences = ? WHERE id = ?").run(JSON.stringify(merged), user.id);
      }
    }

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
    return res.json({ data: { user: makeUserObject(updated) }, error: null });
  } catch (err) {
    console.error("Update user error:", err);
    return res.json({ data: { user: null }, error: { message: err.message } });
  }
});

// POST /api/auth/reset-password
app.post("/api/auth/reset-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ data: {}, error: { message: "Email required" } });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.json({ data: {}, error: null }); // Don't reveal if user exists

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 3600000; // 1 hour
  db.prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?").run(resetToken, expires, user.id);

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&role=${user.role}`;
  console.log(`\n=== PASSWORD RESET ===`);
  console.log(`Email: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`======================\n`);

  return res.json({ data: {}, error: null });
});

// POST /api/auth/reset-password/confirm
app.post("/api/auth/reset-password/confirm", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.json({ data: {}, error: { message: "Token and password required" } });

  try {
    const user = db.prepare(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?"
    ).get(token, Date.now());

    if (!user) return res.json({ data: {}, error: { message: "Invalid or expired reset token" } });

    const hash = await bcrypt.hash(password, 10);
    db.prepare(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?"
    ).run(hash, user.id);

    return res.json({ data: {}, error: null });
  } catch (err) {
    console.error("Confirm reset error:", err);
    return res.json({ data: {}, error: { message: err.message } });
  }
});

// ---------- STUDENT FORM ENDPOINTS ----------

// GET /api/student-forms
app.get("/api/student-forms", (req, res) => {
  try {
    const { volunteer_email, email, id, single, select: selectFields, eq_field, eq_value, order_field, order_ascending, status } = req.query;

    if (id && single === "true") {
      const row = db.prepare("SELECT * FROM student_form_submissions WHERE id = ?").get(id);
      return res.json({ data: transformStudentRow(row), error: null });
    }

    let sql = "SELECT";
    sql += (selectFields && selectFields !== "*") ? ` ${selectFields}` : " *";
    sql += " FROM student_form_submissions";

    const conditions = [];
    const params = [];

    if (volunteer_email) { conditions.push("volunteer_email = ?"); params.push(volunteer_email); }
    if (email) { conditions.push("email = ?"); params.push(email); }
    if (status) { conditions.push("status = ?"); params.push(status); }
    if (eq_field && eq_value !== undefined) { conditions.push(`${eq_field} = ?`); params.push(eq_value); }
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");

    const orderCol = order_field || "created_at";
    const orderDir = order_ascending === "true" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderCol} ${orderDir}`;

    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows.map(transformStudentRow), error: null });
  } catch (err) {
    console.error("GET student-forms error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/student-forms
app.post("/api/student-forms", (req, res) => {
  try {
    const payloadArray = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const rawPayload of payloadArray) {
      const payload = prepareStudentPayload(rawPayload);
      const columns = Object.keys(payload);
      const placeholders = columns.map(() => "?").join(", ");
      const values = columns.map((c) => payload[c] ?? null);

      const result = db.prepare(
        `INSERT INTO student_form_submissions (${columns.join(", ")}) VALUES (${placeholders})`
      ).run(...values);

      const inserted = db.prepare("SELECT * FROM student_form_submissions WHERE id = ?").get(result.lastInsertRowid);
      results.push(transformStudentRow(inserted));
    }

    console.log(`Student form(s) inserted: ${results.map(r => r.id).join(", ")}`);
    return res.json({ data: results, error: null });
  } catch (err) {
    console.error("POST student-forms error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/student-forms/:id
app.put("/api/student-forms/:id", (req, res) => {
  try {
    const { id } = req.params;
    const payload = prepareStudentPayload(req.body);
    const columns = Object.keys(payload);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });

    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map((c) => payload[c] ?? null);

    db.prepare(`UPDATE student_form_submissions SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM student_form_submissions WHERE id = ?").get(id);
    console.log(`Student form updated: ${id}`);
    return res.json({ data: transformStudentRow(updated), error: null });
  } catch (err) {
    console.error("PUT student-forms error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/student-forms/:id
app.delete("/api/student-forms/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM student_form_submissions WHERE id = ?").run(id);
    console.log(`Student form deleted: ${id}`);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE student-forms error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- ADMIN ENDPOINTS ----------

app.get("/api/admin/students", (req, res) => {
  try {
    const { select: selectFields, order_field, order_ascending } = req.query;
    let sql = "SELECT";
    sql += (selectFields && selectFields !== "*") ? ` ${selectFields}` : " *";
    sql += " FROM student_form_submissions";

    const orderCol = order_field || "created_at";
    const orderDir = order_ascending === "true" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderCol} ${orderDir}`;

    const rows = db.prepare(sql).all();
    return res.json({ data: rows.map(transformStudentRow), error: null });
  } catch (err) {
    console.error("GET admin/students error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

app.put("/api/admin/students/:id", (req, res) => {
  try {
    const { id } = req.params;
    const payload = prepareStudentPayload(req.body);
    const columns = Object.keys(payload);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });

    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map((c) => payload[c] ?? null);

    db.prepare(`UPDATE student_form_submissions SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM student_form_submissions WHERE id = ?").get(id);
    return res.json({ data: transformStudentRow(updated), error: null });
  } catch (err) {
    console.error("PUT admin/students error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

app.get("/api/admin/eligible", (req, res) => {
  try {
    const { count_only, order_field, order_ascending } = req.query;

    if (count_only === "true") {
      const row = db.prepare("SELECT COUNT(*) as count FROM student_form_submissions WHERE status = 'eligible'").get();
      return res.json({ count: row.count, data: null, error: null });
    }

    let sql = "SELECT * FROM student_form_submissions WHERE status = 'eligible'";
    const orderCol = order_field || "created_at";
    const orderDir = order_ascending === "true" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderCol} ${orderDir}`;

    const rows = db.prepare(sql).all();
    return res.json({ data: rows.map(transformStudentRow), error: null, count: rows.length });
  } catch (err) {
    console.error("GET admin/eligible error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

app.get("/api/admin/non-eligible", (req, res) => {
  try {
    const { count_only, order_field, order_ascending } = req.query;

    if (count_only === "true") {
      const row = db.prepare("SELECT COUNT(*) as count FROM student_form_submissions WHERE status = 'non_eligible'").get();
      return res.json({ count: row.count, data: null, error: null });
    }

    let sql = "SELECT * FROM student_form_submissions WHERE status = 'non_eligible'";
    const orderCol = order_field || "created_at";
    const orderDir = order_ascending === "true" ? "ASC" : "DESC";
    sql += ` ORDER BY ${orderCol} ${orderDir}`;

    const rows = db.prepare(sql).all();
    return res.json({ data: rows.map(transformStudentRow), error: null, count: rows.length });
  } catch (err) {
    console.error("GET admin/non-eligible error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// GET /api/students/available-for-adoption — students without a current sponsor
app.get("/api/students/available-for-adoption", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT s.id, s.first_name, s.last_name, s.educationcategory, s.educationyear, s.school, s.fee_structure
      FROM student_form_submissions s
      WHERE s.status IN ('eligible', 'pending')
        AND s.id NOT IN (
          SELECT dm.student_id FROM donor_mapping dm WHERE dm.is_current_sponsor = 1
        )
      ORDER BY s.first_name
    `).all();
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET students/available-for-adoption error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- FEE PAYMENTS ENDPOINTS ----------

// GET /api/fee-payments
app.get("/api/fee-payments", (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = "SELECT * FROM fee_payments";
    const params = [];
    if (student_id) {
      sql += " WHERE student_id = ?";
      params.push(student_id);
    }
    sql += " ORDER BY payment_date DESC";
    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET fee-payments error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/fee-payments
app.post("/api/fee-payments", (req, res) => {
  try {
    const { student_id, amount, payment_date, payment_method, paid_by, receipt_url, term_number, notes } = req.body;
    if (!student_id || !amount || !payment_date) {
      return res.json({ data: null, error: { message: "student_id, amount, and payment_date are required" } });
    }
    const result = db.prepare(
      `INSERT INTO fee_payments (student_id, amount, payment_date, payment_method, paid_by, receipt_url, term_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(student_id, amount, payment_date, payment_method || "cash", paid_by || "TAL", receipt_url || null, term_number || null, notes || null);
    const inserted = db.prepare("SELECT * FROM fee_payments WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST fee-payments error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/fee-payments/:id
app.put("/api/fee-payments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.created_at;
    const columns = Object.keys(fields);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    const setClause = columns.map(c => `${c} = ?`).join(", ");
    const values = columns.map(c => fields[c] ?? null);
    db.prepare(`UPDATE fee_payments SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM fee_payments WHERE id = ?").get(id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT fee-payments error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/fee-payments/:id
app.delete("/api/fee-payments/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM fee_payments WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE fee-payments error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// GET /api/fee-payments/summary — fee paid vs pending for all students
app.get("/api/fee-payments/summary", (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let dateFilter = "";
    const params = [];
    if (start_date) { dateFilter += " AND fp.payment_date >= ?"; params.push(start_date); }
    if (end_date) { dateFilter += " AND fp.payment_date <= ?"; params.push(end_date); }

    const rows = db.prepare(`
      SELECT s.id as student_id,
             s.first_name || ' ' || COALESCE(s.last_name, '') as student_name,
             s.fee_structure as total_fee,
             s.educationcategory as study_category,
             COALESCE(SUM(fp.amount), 0) as total_paid
      FROM student_form_submissions s
      LEFT JOIN fee_payments fp ON fp.student_id = s.id${dateFilter ? " AND 1=1" + dateFilter : ""}
      GROUP BY s.id
      ORDER BY s.first_name
    `).all(...params);
    const data = rows.map(r => ({
      ...r,
      total_fee: parseFloat(r.total_fee) || 0,
      balance: (parseFloat(r.total_fee) || 0) - r.total_paid,
      status: r.total_paid >= (parseFloat(r.total_fee) || 0) ? "paid" : r.total_paid > 0 ? "partial" : "pending",
    }));
    return res.json({ data, error: null });
  } catch (err) {
    console.error("GET fee-payments/summary error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- FEE STRUCTURES ENDPOINTS ----------

const transformFeeStructure = (row) => {
  if (!row) return row;
  const r = { ...row };
  try { r.term_fees = JSON.parse(r.term_fees || "[]"); } catch { r.term_fees = []; }
  return r;
};

// GET /api/fee-structures
app.get("/api/fee-structures", (req, res) => {
  try {
    const { student_id } = req.query;
    if (student_id) {
      const row = db.prepare("SELECT * FROM fee_structures WHERE student_id = ?").get(student_id);
      return res.json({ data: transformFeeStructure(row) || null, error: null });
    }
    const rows = db.prepare("SELECT fs.*, s.first_name || ' ' || COALESCE(s.last_name, '') as student_name FROM fee_structures fs LEFT JOIN student_form_submissions s ON s.id = fs.student_id ORDER BY fs.created_at DESC").all();
    return res.json({ data: rows.map(transformFeeStructure), error: null });
  } catch (err) {
    console.error("GET fee-structures error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/fee-structures
app.post("/api/fee-structures", (req, res) => {
  try {
    const { student_id, total_fee, num_terms, term_fees, academic_year, notes } = req.body;
    if (!student_id || total_fee === undefined) {
      return res.json({ data: null, error: { message: "student_id and total_fee are required" } });
    }
    const termFeesJson = Array.isArray(term_fees) ? JSON.stringify(term_fees) : (term_fees || "[]");
    const result = db.prepare(
      `INSERT INTO fee_structures (student_id, total_fee, num_terms, term_fees, academic_year, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(student_id) DO UPDATE SET
         total_fee = excluded.total_fee,
         num_terms = excluded.num_terms,
         term_fees = excluded.term_fees,
         academic_year = excluded.academic_year,
         notes = excluded.notes,
         updated_at = CURRENT_TIMESTAMP`
    ).run(student_id, total_fee, num_terms || 1, termFeesJson, academic_year || null, notes || null);
    const inserted = db.prepare("SELECT * FROM fee_structures WHERE student_id = ?").get(student_id);
    return res.json({ data: transformFeeStructure(inserted), error: null });
  } catch (err) {
    console.error("POST fee-structures error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/fee-structures/:id
app.put("/api/fee-structures/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.created_at;
    delete fields.student_name;
    if (Array.isArray(fields.term_fees)) fields.term_fees = JSON.stringify(fields.term_fees);
    fields.updated_at = new Date().toISOString();
    const columns = Object.keys(fields);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    const setClause = columns.map(c => `${c} = ?`).join(", ");
    const values = columns.map(c => fields[c] ?? null);
    db.prepare(`UPDATE fee_structures SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM fee_structures WHERE id = ?").get(id);
    return res.json({ data: transformFeeStructure(updated), error: null });
  } catch (err) {
    console.error("PUT fee-structures error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/fee-structures/:id
app.delete("/api/fee-structures/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM fee_structures WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE fee-structures error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- DONOR MAPPING ENDPOINTS ----------

// GET /api/donor-mappings
app.get("/api/donor-mappings", (req, res) => {
  try {
    const { student_id, donor_email } = req.query;
    let sql = "SELECT dm.*, s.first_name || ' ' || COALESCE(s.last_name, '') as student_name FROM donor_mapping dm LEFT JOIN student_form_submissions s ON s.id = dm.student_id";
    const conditions = [];
    const params = [];
    if (student_id) { conditions.push("dm.student_id = ?"); params.push(student_id); }
    if (donor_email) { conditions.push("dm.donor_email = ?"); params.push(donor_email); }
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY dm.created_at DESC";
    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET donor-mappings error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/donor-mappings
app.post("/api/donor-mappings", (req, res) => {
  try {
    const { student_id, donor_name, donor_email, year_of_support, amount, is_current_sponsor, notes } = req.body;
    if (!student_id || !donor_name) {
      return res.json({ data: null, error: { message: "student_id and donor_name are required" } });
    }
    const result = db.prepare(
      `INSERT INTO donor_mapping (student_id, donor_name, donor_email, year_of_support, amount, is_current_sponsor, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(student_id, donor_name, donor_email || null, year_of_support || null, amount || 0, is_current_sponsor ?? 1, notes || null);
    const inserted = db.prepare("SELECT * FROM donor_mapping WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST donor-mappings error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/donor-mappings/:id
app.put("/api/donor-mappings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.created_at;
    delete fields.student_name;
    const columns = Object.keys(fields);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    const setClause = columns.map(c => `${c} = ?`).join(", ");
    const values = columns.map(c => fields[c] ?? null);
    db.prepare(`UPDATE donor_mapping SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM donor_mapping WHERE id = ?").get(id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT donor-mappings error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/donor-mappings/:id
app.delete("/api/donor-mappings/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM donor_mapping WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE donor-mappings error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- NOTIFICATION ENDPOINTS ----------

// GET /api/notifications
app.get("/api/notifications", (req, res) => {
  try {
    const { recipient_email, recipient_role, unread_only } = req.query;
    let sql = "SELECT * FROM notifications";
    const conditions = [];
    const params = [];
    if (recipient_email) { conditions.push("(recipient_email = ? OR recipient_email IS NULL)"); params.push(recipient_email); }
    if (recipient_role) { conditions.push("(recipient_role = ? OR recipient_role IS NULL)"); params.push(recipient_role); }
    if (unread_only === "true") { conditions.push("is_read = 0"); }
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY created_at DESC";
    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET notifications error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/notifications
app.post("/api/notifications", (req, res) => {
  try {
    const { recipient_email, recipient_role, title, message, type, priority, created_by } = req.body;
    if (!title) return res.json({ data: null, error: { message: "title is required" } });
    const result = db.prepare(
      `INSERT INTO notifications (recipient_email, recipient_role, title, message, type, priority, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(recipient_email || null, recipient_role || null, title, message || null, type || "general", priority || "medium", created_by || null);
    const inserted = db.prepare("SELECT * FROM notifications WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST notifications error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/notifications/broadcast — send to multiple recipients
app.post("/api/notifications/broadcast", (req, res) => {
  try {
    const { recipient_role, recipient_emails, title, message, type, priority, created_by } = req.body;
    if (!title) return res.json({ data: null, error: { message: "title is required" } });

    const results = [];
    if (recipient_emails && Array.isArray(recipient_emails)) {
      for (const email of recipient_emails) {
        const result = db.prepare(
          `INSERT INTO notifications (recipient_email, recipient_role, title, message, type, priority, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(email, recipient_role || null, title, message || null, type || "broadcast", priority || "medium", created_by || null);
        results.push(result.lastInsertRowid);
      }
    } else if (recipient_role) {
      // Broadcast to all users of a role
      const users = db.prepare("SELECT email FROM users WHERE role = ?").all(recipient_role);
      for (const u of users) {
        const result = db.prepare(
          `INSERT INTO notifications (recipient_email, recipient_role, title, message, type, priority, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(u.email, recipient_role, title, message || null, type || "broadcast", priority || "medium", created_by || null);
        results.push(result.lastInsertRowid);
      }
    } else {
      // Broadcast to everyone
      const users = db.prepare("SELECT email FROM users").all();
      for (const u of users) {
        const result = db.prepare(
          `INSERT INTO notifications (recipient_email, recipient_role, title, message, type, priority, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(u.email, null, title, message || null, type || "broadcast", priority || "medium", created_by || null);
        results.push(result.lastInsertRowid);
      }
    }
    return res.json({ data: { count: results.length, ids: results }, error: null });
  } catch (err) {
    console.error("POST notifications/broadcast error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/notifications/:id/read
app.put("/api/notifications/:id/read", (req, res) => {
  try {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    const updated = db.prepare("SELECT * FROM notifications WHERE id = ?").get(req.params.id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT notifications read error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/notifications/:id
app.delete("/api/notifications/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM notifications WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE notifications error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- DONATION ENDPOINTS ----------

// GET /api/donations
app.get("/api/donations", (req, res) => {
  try {
    const { donor_email, student_id } = req.query;
    let sql = "SELECT d.*, s.first_name || ' ' || COALESCE(s.last_name, '') as student_name FROM donations d LEFT JOIN student_form_submissions s ON s.id = d.student_id";
    const conditions = [];
    const params = [];
    if (donor_email) { conditions.push("d.donor_email = ?"); params.push(donor_email); }
    if (student_id) { conditions.push("d.student_id = ?"); params.push(student_id); }
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY d.payment_date DESC";
    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET donations error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/donations
app.post("/api/donations", (req, res) => {
  try {
    const { donor_id, donor_name, donor_email, student_id, amount, payment_date, payment_method, receipt_number, notes } = req.body;
    if (!amount || !payment_date) {
      return res.json({ data: null, error: { message: "amount and payment_date are required" } });
    }
    const receiptNo = receipt_number || `DON-${Date.now()}`;
    const result = db.prepare(
      `INSERT INTO donations (donor_id, donor_name, donor_email, student_id, amount, payment_date, payment_method, receipt_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(donor_id || null, donor_name || null, donor_email || null, student_id || null, amount, payment_date, payment_method || "online", receiptNo, notes || null);
    const inserted = db.prepare("SELECT * FROM donations WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST donations error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// GET /api/donations/summary — total donations collected, grouped
app.get("/api/donations/summary", (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let dateCondition = "";
    const params = [];
    if (start_date) { dateCondition += (dateCondition ? " AND" : " WHERE") + " payment_date >= ?"; params.push(start_date); }
    if (end_date) { dateCondition += (dateCondition ? " AND" : " WHERE") + " payment_date <= ?"; params.push(end_date); }

    const total = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM donations${dateCondition}`).get(...params);
    const byDonor = db.prepare(
      `SELECT donor_name, donor_email, SUM(amount) as total, COUNT(*) as count FROM donations${dateCondition} GROUP BY donor_email ORDER BY total DESC`
    ).all(...params);
    const byMonth = db.prepare(
      `SELECT strftime('%Y-%m', payment_date) as month, SUM(amount) as total FROM donations${dateCondition} GROUP BY month ORDER BY month DESC`
    ).all(...params);
    return res.json({ data: { total: total.total, byDonor, byMonth }, error: null });
  } catch (err) {
    console.error("GET donations/summary error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/donations/:id
app.delete("/api/donations/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM donations WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE donations error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- FILE UPLOAD ----------

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const folder = req.body.folder || "general";
  const publicUrl = `http://localhost:${PORT}/uploads/${folder}/${req.file.filename}`;
  return res.json({ publicUrl });
});

// ---------- DOCUMENT ENDPOINTS ----------

// POST /api/documents — upload & save metadata
app.post("/api/documents", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.json({ data: null, error: { message: "No file uploaded" } });
    const { student_id, uploaded_by, category } = req.body;
    const folder = req.body.folder || "documents";
    const fileUrl = `http://localhost:${PORT}/uploads/${folder}/${req.file.filename}`;
    const result = db.prepare(
      "INSERT INTO documents (student_id, uploaded_by, file_name, file_url, file_type, category) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(student_id ? parseInt(student_id) : null, uploaded_by || null, req.file.originalname, fileUrl, req.file.mimetype, category || "general");
    const inserted = db.prepare("SELECT * FROM documents WHERE id = ?").get(result.lastInsertRowid);

    // Auto-create upload notification
    if (student_id && uploaded_by) {
      const student = db.prepare("SELECT first_name, last_name, email FROM student_form_submissions WHERE id = ?").get(parseInt(student_id));
      if (student) {
        const studentName = `${student.first_name || ""} ${student.last_name || ""}`.trim();
        const uploaderIsStudent = uploaded_by === student.email;
        if (uploaderIsStudent) {
          // Student uploaded → notify admins
          db.prepare(
            "INSERT INTO notifications (recipient_role, title, message, type, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)"
          ).run("admin", "New Document Upload", `${studentName} uploaded "${req.file.originalname}".`, "document", "low", uploaded_by);
        } else {
          // Admin/volunteer uploaded → notify student
          db.prepare(
            "INSERT INTO notifications (recipient_email, title, message, type, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)"
          ).run(student.email, "New Document Added", `A new document "${req.file.originalname}" has been uploaded to your profile.`, "document", "low", uploaded_by);
        }
      }
    }

    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST documents error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// GET /api/documents — list, optionally filter by student_id
app.get("/api/documents", (req, res) => {
  try {
    const { student_id } = req.query;
    if (student_id) {
      const rows = db.prepare("SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC").all(student_id);
      return res.json({ data: rows, error: null });
    }
    const rows = db.prepare(
      `SELECT d.*, s.first_name || ' ' || COALESCE(s.last_name, '') as student_name
       FROM documents d LEFT JOIN student_form_submissions s ON s.id = d.student_id
       ORDER BY d.created_at DESC`
    ).all();
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET documents error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/documents/:id
app.delete("/api/documents/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM documents WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE documents error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- ACADEMIC RECORDS ENDPOINTS ----------

// GET /api/academic-records — list, optionally filter by student_id
app.get("/api/academic-records", (req, res) => {
  try {
    const { student_id } = req.query;
    if (student_id) {
      const rows = db.prepare("SELECT * FROM academic_records WHERE student_id = ? ORDER BY academic_year DESC, semester, subject_name").all(student_id);
      return res.json({ data: rows, error: null });
    }
    const rows = db.prepare(
      `SELECT ar.*, s.first_name || ' ' || COALESCE(s.last_name, '') as student_name
       FROM academic_records ar LEFT JOIN student_form_submissions s ON s.id = ar.student_id
       ORDER BY ar.academic_year DESC, ar.semester, ar.subject_name`
    ).all();
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET academic-records error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/academic-records — add a record
app.post("/api/academic-records", (req, res) => {
  try {
    const { student_id, academic_year, semester, subject_name, marks_obtained, max_marks, grade, certificate_url } = req.body;
    if (!student_id || !subject_name) return res.json({ data: null, error: { message: "student_id and subject_name are required" } });
    const result = db.prepare(
      `INSERT INTO academic_records (student_id, academic_year, semester, subject_name, marks_obtained, max_marks, grade, certificate_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(student_id, academic_year || null, semester || null, subject_name, marks_obtained ?? null, max_marks || 100, grade || null, certificate_url || null);
    const inserted = db.prepare("SELECT * FROM academic_records WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST academic-records error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/academic-records/:id
app.put("/api/academic-records/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.created_at;
    delete fields.student_name;
    const columns = Object.keys(fields);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    const setClause = columns.map(c => `${c} = ?`).join(", ");
    const values = columns.map(c => fields[c] ?? null);
    db.prepare(`UPDATE academic_records SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM academic_records WHERE id = ?").get(id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT academic-records error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/academic-records/:id
app.delete("/api/academic-records/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM academic_records WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE academic-records error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- CAMP ENDPOINTS ----------

// GET /api/camps — list all camps
app.get("/api/camps", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM camps ORDER BY date DESC").all();
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET camps error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/camps — create a camp
app.post("/api/camps", (req, res) => {
  try {
    const { name, date, location, description } = req.body;
    if (!name) return res.json({ data: null, error: { message: "name is required" } });
    const result = db.prepare(
      "INSERT INTO camps (name, date, location, description) VALUES (?, ?, ?, ?)"
    ).run(name, date || null, location || null, description || null);
    const inserted = db.prepare("SELECT * FROM camps WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    console.error("POST camps error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/camps/:id
app.put("/api/camps/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    delete fields.id;
    delete fields.created_at;
    const columns = Object.keys(fields);
    if (columns.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    const setClause = columns.map(c => `${c} = ?`).join(", ");
    const values = columns.map(c => fields[c] ?? null);
    db.prepare(`UPDATE camps SET ${setClause} WHERE id = ?`).run(...values, id);
    const updated = db.prepare("SELECT * FROM camps WHERE id = ?").get(id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT camps error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/camps/:id
app.delete("/api/camps/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM camps WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE camps error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- CAMP PARTICIPATION ENDPOINTS ----------

// GET /api/camp-participation — list, optionally filter by student_id or camp_id
app.get("/api/camp-participation", (req, res) => {
  try {
    const { student_id, camp_id } = req.query;
    let sql = `SELECT cp.*, c.name as camp_name, c.date as camp_date, c.location as camp_location,
               s.first_name || ' ' || COALESCE(s.last_name, '') as student_name
               FROM camp_participation cp
               LEFT JOIN camps c ON c.id = cp.camp_id
               LEFT JOIN student_form_submissions s ON s.id = cp.student_id`;
    const conditions = [];
    const params = [];
    if (student_id) { conditions.push("cp.student_id = ?"); params.push(student_id); }
    if (camp_id) { conditions.push("cp.camp_id = ?"); params.push(camp_id); }
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY c.date DESC";
    const rows = db.prepare(sql).all(...params);
    return res.json({ data: rows, error: null });
  } catch (err) {
    console.error("GET camp-participation error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// POST /api/camp-participation — register student for camp
app.post("/api/camp-participation", (req, res) => {
  try {
    const { student_id, camp_id, status, notes } = req.body;
    if (!student_id || !camp_id) return res.json({ data: null, error: { message: "student_id and camp_id are required" } });
    const result = db.prepare(
      "INSERT INTO camp_participation (student_id, camp_id, status, notes) VALUES (?, ?, ?, ?)"
    ).run(student_id, camp_id, status || "registered", notes || null);
    const inserted = db.prepare("SELECT * FROM camp_participation WHERE id = ?").get(result.lastInsertRowid);
    return res.json({ data: inserted, error: null });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint")) {
      return res.json({ data: null, error: { message: "Student is already registered for this camp" } });
    }
    console.error("POST camp-participation error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// PUT /api/camp-participation/:id — update status
app.put("/api/camp-participation/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updates = [];
    const params = [];
    if (status) { updates.push("status = ?"); params.push(status); }
    if (notes !== undefined) { updates.push("notes = ?"); params.push(notes); }
    if (updates.length === 0) return res.json({ data: null, error: { message: "No fields to update" } });
    db.prepare(`UPDATE camp_participation SET ${updates.join(", ")} WHERE id = ?`).run(...params, id);
    const updated = db.prepare("SELECT * FROM camp_participation WHERE id = ?").get(id);
    return res.json({ data: updated, error: null });
  } catch (err) {
    console.error("PUT camp-participation error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// DELETE /api/camp-participation/:id
app.delete("/api/camp-participation/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM camp_participation WHERE id = ?").run(req.params.id);
    return res.json({ data: null, error: null });
  } catch (err) {
    console.error("DELETE camp-participation error:", err);
    return res.json({ data: null, error: { message: err.message } });
  }
});

// ---------- LEGACY ENDPOINT (backward compat with register.js) ----------

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: "All fields required" });

  try {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) return res.json({ success: false, message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run(name, email, password_hash, "volunteer");
    console.log(`Volunteer registered (legacy): ${email}`);
    return res.json({ success: true, message: "Registered", volunteer_id: result.lastInsertRowid });
  } catch (e) {
    console.error("Registration error:", e);
    return res.json({ success: false, message: "Server error" });
  }
});

// ---------- START SERVER ----------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, db };
