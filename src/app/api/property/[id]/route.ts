import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import { propertyValuationValidationSchemas } from '@/models/PropertyValuationSchemas';
import mongoose from 'mongoose';
import { uploadToOneDrive } from '@/lib/onedrive';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const property = await PropertyValuation.findById(id);
  if (!property) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(property);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const deleted = await PropertyValuation.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const contentType = req.headers.get('content-type') || '';

  let data: any = {};
  const photoFiles: any = {};

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (!photoFiles[key]) {
          photoFiles[key] = [];
        }
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        photoFiles[key].push({ buffer, originalname: value.name });
      } else if (key === 'data') {
        try {
          const parsed = JSON.parse(value as string);
          data = { ...data, ...parsed };
        } catch {
          data[key] = value;
        }
      } else {
        data[key] = value;
      }
    }
    console.log('Parsed form data:', { fields: data, files: photoFiles });
  } else {
    data = await req.json();
    console.log('Received JSON data:', data);
  }

  // --- Mongoose validation logic (unchanged) ---
  for (const [section, schema] of Object.entries(propertyValuationValidationSchemas)) {
    if (section === 'photos') continue;

    if (data[section]) {
      try {
        const modelName = `Temp_${section}`;
        const Model = mongoose.models[modelName] || mongoose.model(modelName, schema);
        const doc = new Model(data[section]);
        const error = doc.validateSync();
        if (error) {
          return NextResponse.json({ error: error.message, section }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: err.message, section }, { status: 400 });
      }
    }
  }

  // Upload each photo to OneDrive
  if (Object.keys(photoFiles).length > 0) {
    try {
      const uploadedUrls: Record<string, string[]> = {};

      for (const [key, files] of Object.entries(photoFiles)) {
        const urls: string[] = [];

        for (const file of files as { buffer: Buffer; originalname: string }[]) {
          const url = await uploadToOneDrive(file, id, key); // ✅ 3 arguments
          urls.push(url);
        }


        uploadedUrls[key] = urls;
      }

      const existing:any = await PropertyValuation.findById(id).lean();
      if (!existing) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      const mergedPhotos = { ...(existing.photos || {}) };

      for (const [key, newUrls] of Object.entries(uploadedUrls)) {
        mergedPhotos[key] = [...(mergedPhotos[key] || []), ...newUrls];
      }

      data.photos = mergedPhotos;

      console.log('Uploaded to OneDrive:', uploadedUrls);
    } catch (err: any) {
      console.error('Failed to upload photos to OneDrive:', err);
      return NextResponse.json({ error: 'Failed to upload photos to OneDrive', details: err.message }, { status: 500 });
    }
  }

  const updated = await PropertyValuation.findByIdAndUpdate(id, data, { new: true, upsert: true });
  console.log('Updated MongoDB:', updated);
  return NextResponse.json(updated);
}
