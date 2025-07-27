import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIdToken } from "@/lib/firebase";
import type { ChatSession, ChatMessage } from "@shared/schema";

async function createChatSession(documentId: number): Promise<ChatSession> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ documentId }),
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to create chat session";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_) {
      const fallback = await response.text();
      message = fallback || message;
    }
    throw new Error(message);
  }

  return response.json();
}

async function fetchChatMessages(sessionId: number): Promise<ChatMessage[]> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch chat messages";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_) {
      const fallback = await response.text();
      message = fallback || message;
    }
    throw new Error(message);
  }

  return response.json();
}

async function sendMessage(
  sessionId: number,
  content: string
): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to send message";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_) {
      const fallback = await response.text();
      message = fallback || message;
    }
    throw new Error(message);
  }

  return response.json();
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChatSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
    },
  });
}

export function useChatMessages(sessionId: number | null) {
  return useQuery<ChatMessage[], Error>({
    queryKey: ["/api/chat/sessions", sessionId, "messages"],
    queryFn: () => fetchChatMessages(sessionId!),
    enabled: !!sessionId,
    onError(error) {
      console.error("Chat fetch error:", error);
    },
  });
}


export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: number; content: string }) =>
      sendMessage(sessionId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat/sessions", variables.sessionId, "messages"],
      });
    },
  });
}
