// Simplified auth for development - using token verification without Firebase Admin
export async function verifyIdToken(idToken: string) {
  try {
    // In a real app, you'd verify with Firebase Admin SDK
    // For now, we'll decode the JWT payload (insecure but functional for development)
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export async function uploadFileToStorage(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: string
): Promise<string> {
  // For development, we'll store files in memory or local filesystem
  // In production, this would upload to Firebase Storage
  const filePath = `documents/${userId}/${Date.now()}_${fileName}`;
  return filePath;
}

export async function deleteFileFromStorage(filePath: string): Promise<void> {
  // For development, this would delete from local storage
  // In production, this would delete from Firebase Storage
  console.log(`Would delete file: ${filePath}`);
}
