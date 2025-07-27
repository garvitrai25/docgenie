import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getIdToken } from "@/lib/firebase";
import type { Document } from "@shared/schema";

async function fetchDocuments(): Promise<Document[]> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch("/api/documents", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to fetch documents";
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

async function uploadDocument(file: File): Promise<Document> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to upload document";
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

async function deleteDocument(documentId: number): Promise<void> {
  const token = await getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`/api/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to delete document";
    try {
      const error = await response.json();
      message = error.message || message;
    } catch (_) {
      const fallback = await response.text();
      message = fallback || message;
    }
    throw new Error(message);
  }
}

export function useDocuments() {
  return useQuery({
    queryKey: ["/api/documents"],
    queryFn: fetchDocuments,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}
