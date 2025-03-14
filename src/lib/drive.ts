import { google } from 'googleapis';
import { createReadStream } from 'fs';
// Import only what's needed
//import { JWT } from 'google-auth-library';

// Create a properly initialized JWT auth instance
// JWT is the correct type for service account authentication
export const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
);

// Keep the uploadToDrive function but use the exported auth instance
export async function uploadToDrive(filePath: string, fileName: string): Promise<string> {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const fileStream = createReadStream(filePath);

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''], // Use environment variable
      },
      media: {
        mimeType: 'application/octet-stream',
        body: fileStream,
      },
      fields: 'id',
    });

    if (!response.data.id) {
      throw new Error('Failed to retrieve file ID after upload.');
    }

    console.log(`File uploaded successfully: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('Google Drive upload failed:', error);
    throw new Error('Google Drive upload failed');
  }
}

// If you need to get a new auth instance elsewhere, you can keep this function
export async function getGoogleDriveAuth() {
  return auth;
}