// src/app/api/test/route.ts
import {  NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/drive';

export async function GET() {
  try {
    // Test the Google Drive authentication
    const drive = google.drive({ version: 'v3', auth });
    
    // Test listing files (only metadata)
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)'
    });
    
    const files = response.data.files;
    
    return NextResponse.json({
      success: true,
      message: 'Google Drive API connection successful',
      fileCount: files?.length || 0,
      files: files,
      authInfo: {
        type: 'JWT',
        scopes: auth.scopes,
        // Don't include sensitive information
        email: process.env.GOOGLE_CLIENT_EMAIL?.split('@')[0] + '@...' || 'Not configured'
      }
    });
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    let errorDetails: unknown = 'No additional details';


    if (error instanceof Error) {
        errorMessage = error.message;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      errorDetails = (error as { response?: { data?: unknown } }).response?.data;
  }
  

    console.error('Google Drive test error:', error);

    return NextResponse.json({
        success: false,
        error: 'Google Drive API connection failed',
        message: errorMessage,
        details: errorDetails,
        authInfo: {
            type: 'JWT',
            scopes: auth.scopes,
            email: process.env.GOOGLE_CLIENT_EMAIL?.split('@')[0] + '@...' || 'Not configured'
        }
    }, { status: 500 });
}

}