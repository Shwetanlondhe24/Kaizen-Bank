// src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { auth } from '@/lib/drive';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const recordId = searchParams.get('id'); // Optional database ID as fallback
    let fileName = searchParams.get('fileName');

    // Log parameters for debugging
    console.log('Download request parameters:', { fileId, recordId, fileName });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    let driveFileId = fileId;
    
    // If no fileId provided but we have a recordId, get info from database
    if ((!driveFileId || !fileName) && recordId) {
      const { data: fileRecord, error: fileError } = await supabase
        .from('kaizen_reports')
        .select('drive_file_id, file_name')
        .eq('id', recordId)
        .single();

      if (fileError) {
        console.error('Database lookup error:', fileError);
        return NextResponse.json(
          { success: false, error: 'Record not found in database' },
          { status: 404 }
        );
      }

      driveFileId = driveFileId || fileRecord.drive_file_id;
      fileName = fileName || fileRecord.file_name;
    }

    // Verify we have the necessary parameters
    if (!driveFileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'File name is required' },
        { status: 400 }
      );
    }

    // Log the final parameters being used
    console.log('Downloading file:', { driveFileId, fileName });

    // Initialize Google Drive client
    const drive = google.drive({ version: 'v3', auth });
    
    try {
      // Verify the file exists in Google Drive
      const file = await drive.files.get({
        fileId: driveFileId,
        fields: 'id, name, mimeType'
      });

      if (!file.data) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }

      // Get the file content
      const response = await drive.files.get(
        {
          fileId: driveFileId,
          alt: 'media'
        },
        {
          responseType: 'stream'
        }
      );

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.data as unknown as Readable;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);

      // Determine MIME type based on file extension (fallback to PDF)
      const mimeType = file.data.mimeType || 'application/pdf';

      // Return the file with proper headers
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': buffer.length.toString()
        }
      });
    } catch (driveError: any) {
      console.error('Google Drive error details:', driveError?.response?.data || driveError);
      return NextResponse.json(
        { success: false, error: 'File not found or access denied' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Download failed' },
      { status: 500 }
    );
  }
}