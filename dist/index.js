var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import multer from "multer";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  chatMessagesRelations: () => chatMessagesRelations,
  chatSessions: () => chatSessions,
  chatSessionsRelations: () => chatSessionsRelations,
  documentChunks: () => documentChunks,
  documentChunksRelations: () => documentChunksRelations,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertChatSessionSchema: () => insertChatSessionSchema,
  insertDocumentChunkSchema: () => insertDocumentChunkSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  firebaseStoragePath: text("firebase_storage_path").notNull(),
  extractedText: text("extracted_text"),
  processingStatus: text("processing_status").notNull().default("pending"),
  // pending, processing, completed, failed
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull()
});
var documentChunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull()
});
var chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentId: integer("document_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(),
  // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true
});
var insertDocumentChunkSchema = createInsertSchema(documentChunks).omit({
  id: true
});
var insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true
});
var usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  chatSessions: many(chatSessions)
}));
var documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  }),
  chunks: many(documentChunks),
  chatSessions: many(chatSessions)
}));
var documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id]
  })
}));
var chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id]
  }),
  document: one(documents, {
    fields: [chatSessions.documentId],
    references: [documents.id]
  }),
  messages: many(chatMessages)
}));
var chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUserByFirebaseUid(firebaseUid) {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async createDocument(insertDocument) {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }
  async getDocumentsByUserId(userId) {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
  async getDocumentById(id) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || void 0;
  }
  async updateDocumentStatus(id, status, extractedText) {
    const updateData = { processingStatus: status };
    if (extractedText) {
      updateData.extractedText = extractedText;
    }
    await db.update(documents).set(updateData).where(eq(documents.id, id));
  }
  async deleteDocument(id) {
    await db.delete(documentChunks).where(eq(documentChunks.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));
  }
  async createDocumentChunks(insertChunks) {
    const chunks = await db.insert(documentChunks).values(insertChunks).returning();
    return chunks;
  }
  async getDocumentChunks(documentId) {
    return await db.select().from(documentChunks).where(eq(documentChunks.documentId, documentId));
  }
  async createChatSession(insertSession) {
    const [session] = await db.insert(chatSessions).values(insertSession).returning();
    return session;
  }
  async getChatSessionsByUserId(userId) {
    return await db.select().from(chatSessions).where(eq(chatSessions.userId, userId));
  }
  async getChatSession(id) {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session || void 0;
  }
  async createChatMessage(insertMessage) {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }
  async getChatMessages(sessionId) {
    return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.timestamp);
  }
};
var storage = new DatabaseStorage();

// server/services/firebase.ts
async function verifyIdToken(idToken) {
  try {
    const payload = JSON.parse(atob(idToken.split(".")[1]));
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      name: payload.name
    };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
async function uploadFileToStorage(buffer, fileName, mimeType, userId) {
  const filePath = `documents/${userId}/${Date.now()}_${fileName}`;
  return filePath;
}
async function deleteFileFromStorage(filePath) {
  console.log(`Would delete file: ${filePath}`);
}

// server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
var genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function generateChatResponse(userQuery, documentChunks2, chatHistory) {
  try {
    const context = documentChunks2.length > 0 ? `Based on the following document content:

${documentChunks2.join("\n\n")}

` : "";
    const historyContext = chatHistory.length > 0 ? `Previous conversation:
${chatHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

` : "";
    const prompt = `${historyContext}${context}User question: ${userQuery}

Please provide a helpful and accurate response based on the document content provided. If the question cannot be answered from the document content, politely explain that the information is not available in the provided documents.`;
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response. Please try again later.");
  }
}

// server/services/pdf-parser.ts
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
async function extractTextFromPDF(buffer) {
  try {
    console.log(`Attempting to parse PDF: ${buffer.length} bytes`);
    const pdfParseLib = require2("pdf-parse/lib/pdf-parse.js");
    const data = await pdfParseLib(buffer, {
      max: 0
      // Maximum number of pages to parse (0 = all pages)
    });
    if (data.text && data.text.trim().length > 0) {
      const extractedText = data.text.trim();
      console.log(`PDF parsing successful: ${extractedText.length} characters extracted`);
      console.log(`First 200 characters: ${extractedText.substring(0, 200)}...`);
      return extractedText;
    } else {
      console.log("PDF parsing: No text content found");
      return `This PDF appears to contain primarily images or scanned content. Text extraction was not successful. Please ensure the PDF contains selectable text or consider using OCR processing for image-based documents.`;
    }
  } catch (error) {
    console.error("PDF parsing error:", error);
    try {
      console.log("Attempting fallback PDF parsing...");
      const pdfParseLib = require2("pdf-parse/lib/pdf-parse.js");
      const data = await pdfParseLib(buffer);
      if (data.text && data.text.trim().length > 0) {
        const extractedText = data.text.trim();
        console.log(`PDF parsing (fallback) successful: ${extractedText.length} characters extracted`);
        return extractedText;
      }
    } catch (secondError) {
      console.error("Secondary PDF parsing also failed:", secondError);
    }
    return `Unable to extract text from this PDF file. This could be due to:
1. The PDF contains only images/scanned content (requires OCR)
2. The PDF is password protected  
3. The PDF format is not supported
4. The file may be corrupted

Please try uploading a text-based PDF or a .txt file instead.`;
  }
}
function chunkText(text2, maxChunkSize = 2e3) {
  if (text2.length <= maxChunkSize) {
    return [text2];
  }
  const chunks = [];
  const sentences = text2.split(/[.!?]+/);
  let currentChunk = "";
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    const potentialChunk = currentChunk + (currentChunk ? ". " : "") + trimmedSentence;
    if (potentialChunk.length <= maxChunkSize) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + ".");
      }
      if (trimmedSentence.length > maxChunkSize) {
        const words = trimmedSentence.split(" ");
        let wordChunk = "";
        for (const word of words) {
          const potentialWordChunk = wordChunk + (wordChunk ? " " : "") + word;
          if (potentialWordChunk.length <= maxChunkSize) {
            wordChunk = potentialWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk);
            }
            wordChunk = word;
          }
        }
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = trimmedSentence;
      }
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk + (currentChunk.endsWith(".") ? "" : "."));
  }
  return chunks;
}
function countWords(text2) {
  return text2.trim().split(/\s+/).length;
}

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  }
});
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(idToken);
    let user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      user = await storage.createUser({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || null
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.get("/api/user", authenticateUser, (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/documents/upload", authenticateUser, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      const user = req.user;
      const file = req.file;
      const storagePath = await uploadFileToStorage(
        file.buffer,
        file.originalname,
        file.mimetype,
        user.firebaseUid
      );
      const document = await storage.createDocument({
        userId: user.id,
        fileName: `${Date.now()}_${file.originalname}`,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        firebaseStoragePath: storagePath,
        processingStatus: "processing"
      });
      processDocumentAsync(document.id, file.buffer, file.mimetype);
      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });
  app2.get("/api/documents", authenticateUser, async (req, res) => {
    try {
      const user = req.user;
      const documents2 = await storage.getDocumentsByUserId(user.id);
      res.json(documents2);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.delete("/api/documents/:id", authenticateUser, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const user = req.user;
      const document = await storage.getDocumentById(documentId);
      if (!document || document.userId !== user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      await deleteFileFromStorage(document.firebaseStoragePath);
      await storage.deleteDocument(documentId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  app2.post("/api/chat/sessions", authenticateUser, async (req, res) => {
    try {
      const user = req.user;
      const { documentId } = req.body;
      const document = await storage.getDocumentById(documentId);
      if (!document || document.userId !== user.id) {
        return res.status(404).json({ message: "Document not found" });
      }
      if (document.processingStatus !== "completed") {
        return res.status(400).json({ message: "Document is still being processed" });
      }
      const session = await storage.createChatSession({
        userId: user.id,
        documentId
      });
      res.json(session);
    } catch (error) {
      console.error("Create chat session error:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });
  app2.get("/api/chat/sessions", authenticateUser, async (req, res) => {
    try {
      const user = req.user;
      const sessions = await storage.getChatSessionsByUserId(user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Get chat sessions error:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });
  app2.get("/api/chat/sessions/:sessionId/messages", authenticateUser, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user;
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== user.id) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get chat messages error:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/chat/sessions/:sessionId/messages", authenticateUser, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = req.user;
      const { content } = req.body;
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== user.id) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      const userMessage = await storage.createChatMessage({
        sessionId,
        role: "user",
        content: content.trim()
      });
      const chunks = await storage.getDocumentChunks(session.documentId);
      const chunkContents = chunks.map((chunk) => chunk.content);
      const recentMessages = await storage.getChatMessages(sessionId);
      const chatHistory = recentMessages.slice(-10).map((msg) => ({ role: msg.role, content: msg.content }));
      const aiResponse = await generateChatResponse(content, chunkContents, chatHistory);
      const aiMessage = await storage.createChatMessage({
        sessionId,
        role: "assistant",
        content: aiResponse
      });
      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Send chat message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function processDocumentAsync(documentId, buffer, mimeType) {
  try {
    let extractedText = "";
    if (mimeType === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (mimeType === "text/plain") {
      extractedText = buffer.toString("utf-8");
    }
    if (!extractedText.trim()) {
      await storage.updateDocumentStatus(documentId, "failed");
      return;
    }
    const chunks = chunkText(extractedText);
    const documentChunks2 = chunks.map((chunk, index) => ({
      documentId,
      chunkIndex: index,
      content: chunk,
      wordCount: countWords(chunk)
    }));
    await storage.createDocumentChunks(documentChunks2);
    await storage.updateDocumentStatus(documentId, "completed", extractedText);
  } catch (error) {
    console.error("Document processing error:", error);
    await storage.updateDocumentStatus(documentId, "failed");
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
