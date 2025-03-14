// src/app/api/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/drive';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Database ID is required' },
        { status: 400 }
      );
    }

    // Log parameters for debugging
    console.log('Deleting file:', { fileId, id });

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // First, get the file details from the database
    const { data: fileRecord, error: fetchError } = await supabase
      .from('kaizen_reports')
      .select('drive_file_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching file record:', fetchError);
      return NextResponse.json(
        { success: false, error: 'File record not found' },
        { status: 404 }
      );
    }

    // Get the fileId from the database if not provided in URL
    const driveFileId = fileId || fileRecord.drive_file_id;

    // Only attempt to delete from Google Drive if we have a valid fileId
    if (driveFileId) {
      try {
        // Initialize Google Drive client
        const drive = google.drive({ version: 'v3', auth });
        
        // Delete the file from Google Drive
        await drive.files.delete({
          fileId: driveFileId
        });
        
        console.log(`File ${driveFileId} deleted from Google Drive`);
      } catch (driveError: unknown) {
        if (driveError instanceof Error) {
            console.error('Google Drive deletion error:', (driveError as any)?.response?.data || driveError.message);
        } else {
            console.error('Google Drive deletion error:', driveError);
        }
        console.log('File not found in Google Drive, proceeding with database deletion');
    }
    
    } else {
      console.log('No Drive file ID available, only removing database record');
    }

    // Delete the record from the database
    const { error: deleteError } = await supabase
      .from('kaizen_reports')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Deletion failed' },
      { status: 500 }
    );
  }
}