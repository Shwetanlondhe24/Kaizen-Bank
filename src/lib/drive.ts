// src/lib/drive.ts
import { google } from 'googleapis';
import { Readable } from 'stream';

// Set up auth client with your credentials
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

export async function uploadToDrive(fileBuffer: Buffer, fileName: string): Promise<string> {
  const drive = google.drive({ version: 'v3', auth });
  
  // Create a readable stream from the buffer
  const fileStream = new Readable();
  fileStream.push(fileBuffer);
  fileStream.push(null); // Signal the end of the stream
  
  // Upload file to Google Drive
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: 'application/pdf',
      // Add folder ID if you want to upload to a specific folder
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''],
    },
    media: {
      mimeType: 'application/pdf',
      body: fileStream,
    },
  });

  return res.data.id || '';
}