import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { verifyIdToken, uploadFileToStorage, deleteFileFromStorage } from "./services/firebase";
import { generateChatResponse } from "./services/gemini";
import { extractTextFromPDF, chunkText, countWords } from "./services/pdf-parser";
import { insertDocumentSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

// Authentication middleware
async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(idToken);
    
    // Get or create user
    let user = await storage.getUserByFirebaseUid(decodedToken.uid);
    if (!user) {
      user = await storage.createUser({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || null,
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get current user
  app.get("/api/user", authenticateUser, (req, res) => {
    res.json((req as any).user);
  });

  // Upload document
  app.post("/api/documents/upload", authenticateUser, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      const user = (req as any).user;
      const file = req.file;

      // Upload to Firebase Storage
      const storagePath = await uploadFileToStorage(
        file.buffer,
        file.originalname,
        file.mimetype,
        user.firebaseUid
      );

      // Create document record
      const document = await storage.createDocument({
        userId: user.id,
        fileName: `${Date.now()}_${file.originalname}`,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        firebaseStoragePath: storagePath,
        processingStatus: "processing",
      });

      // Process document asynchronously
      processDocumentAsync(document.id, file.buffer, file.mimetype);

      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get user documents
  app.get("/api/documents", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const documents = await storage.getDocumentsByUserId(user.id);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", authenticateUser, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const user = (req as any).user;
      
      const document = await storage.getDocumentById(documentId);
      if (!document || document.userId !== user.id) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete from Firebase Storage
      await deleteFileFromStorage(document.firebaseStoragePath);
      
      // Delete from storage
      await storage.deleteDocument(documentId);

      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Create chat session
  app.post("/api/chat/sessions", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const { documentId } = req.body;

      // Verify document belongs to user
      const document = await storage.getDocumentById(documentId);
      if (!document || document.userId !== user.id) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.processingStatus !== "completed") {
        return res.status(400).json({ message: "Document is still being processed" });
      }

      const session = await storage.createChatSession({
        userId: user.id,
        documentId,
      });

      res.json(session);
    } catch (error) {
      console.error("Create chat session error:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  // Get chat sessions
  app.get("/api/chat/sessions", authenticateUser, async (req, res) => {
    try {
      const user = (req as any).user;
      const sessions = await storage.getChatSessionsByUserId(user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Get chat sessions error:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Get chat messages
  app.get("/api/chat/sessions/:sessionId/messages", authenticateUser, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = (req as any).user;

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

  // Send chat message
  app.post("/api/chat/sessions/:sessionId/messages", authenticateUser, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const user = (req as any).user;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== user.id) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        role: "user",
        content: content.trim(),
      });

      // Get document chunks for context
      const chunks = await storage.getDocumentChunks(session.documentId);
      const chunkContents = chunks.map(chunk => chunk.content);

      // Get recent chat history
      const recentMessages = await storage.getChatMessages(sessionId);
      const chatHistory = recentMessages
        .slice(-10) // Last 10 messages for context
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Generate AI response
      const aiResponse = await generateChatResponse(content, chunkContents, chatHistory);

      // Save AI message
      const aiMessage = await storage.createChatMessage({
        sessionId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Send chat message error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background document processing
async function processDocumentAsync(documentId: number, buffer: Buffer, mimeType: string) {
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

    // Chunk the text
    const chunks = chunkText(extractedText);
    const documentChunks = chunks.map((chunk, index) => ({
      documentId,
      chunkIndex: index,
      content: chunk,
      wordCount: countWords(chunk),
    }));

    // Save chunks
    await storage.createDocumentChunks(documentChunks);

    // Update document status
    await storage.updateDocumentStatus(documentId, "completed", extractedText);
  } catch (error) {
    console.error("Document processing error:", error);
    await storage.updateDocumentStatus(documentId, "failed");
  }
}
