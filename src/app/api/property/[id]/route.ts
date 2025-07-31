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

function sanitizeForValidation(obj: any) {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}
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
  console.log("📌 PUT handler triggered");

  await connectDB();

  const { id } = await params;
  console.log("📌 Received ID:", id);

  const contentType = req.headers.get('content-type') || '';
  console.log("📌 Content-Type:", contentType);

  let data: any = {};
  const photoFiles: any = {};

  try {
    if (contentType.includes('multipart/form-data')) {
      console.log("📌 Parsing multipart/form-data");

      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`📎 File key: ${key}, name: ${value.name}`);
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
            console.log("✅ Parsed data JSON:", parsed);
          } catch (err) {
            console.warn("⚠️ Failed to parse 'data' JSON, storing raw:", value);
            data[key] = value;
          }
        } else {
          data[key] = value;
          console.log(`📎 Field: ${key} = ${value}`);
        }
      }

      console.log('✅ Final Parsed Form Data:', { fields: data, files: Object.keys(photoFiles) });
    } else {
      data = await req.json();
      console.log("✅ Received JSON data:", data);
    }

    // 🧪 Schema validation
    for (const [section, schema] of Object.entries(propertyValuationValidationSchemas)) {
      if (section === 'photos') continue;

      if (data[section]) {
        console.log(`📋 Validating section: ${section}`);
        const modelName = `Temp_${section}`;
        const Model = mongoose.models[modelName] || mongoose.model(modelName, schema);

        const sanitized = sanitizeForValidation(data[section]);
        const doc = new Model(sanitized);
        const error = doc.validateSync();

        if (error) {
          console.error("❌ Validation error in section:", section, error);
          return NextResponse.json({ error: error.message, section }, { status: 400 });
        }

        console.log(`✅ Section ${section} passed validation`);
      }
    }

    // 📤 Upload to OneDrive
    if (Object.keys(photoFiles).length > 0) {
      console.log("📤 Uploading files to OneDrive");
      const uploadedUrls: Record<string, string[]> = {};

      for (const [key, files] of Object.entries(photoFiles)) {
        const urls: string[] = [];
        for (const file of files as { buffer: Buffer; originalname: string }[]) {
          const url = await uploadToOneDrive(file, id, key);
          urls.push(url);
        }
        uploadedUrls[key] = urls;
      }

      const existing: any = await PropertyValuation.findById(id).lean();
      if (!existing) {
        console.warn("⚠️ Property not found for ID:", id);
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      console.log("📸 Existing photos structure:", existing.photos);
      const mergedPhotos = { ...(existing.photos || {}) };
      console.log("📸 Initial merged photos:", mergedPhotos);
      
      for (const [key, newUrls] of Object.entries(uploadedUrls)) {
        console.log(`📸 Processing ${key}:`, newUrls);
        console.log(`📸 newUrls is array:`, Array.isArray(newUrls));
        console.log(`📸 Existing ${key}:`, mergedPhotos[key]);
        console.log(`📸 Existing ${key} is array:`, Array.isArray(mergedPhotos[key]));
        
        if (key === 'reportCoverPhoto') {
          // For report cover photo, replace existing photo (single upload only)
          mergedPhotos[key] = newUrls;
          console.log(`✅ Report cover photo replaced: ${newUrls.length} photo(s)`);
          console.log(`✅ Final ${key}:`, mergedPhotos[key]);
        } else {
          // For other photo types (exterior, interior, additional, grannyFlat), merge with existing photos (multiple upload)
          const existingPhotos = Array.isArray(mergedPhotos[key]) ? mergedPhotos[key] : [];
          mergedPhotos[key] = [...existingPhotos, ...newUrls];
          console.log(`✅ Photos merged for ${key}: ${newUrls.length} new photo(s) added`);
          console.log(`✅ Final ${key}:`, mergedPhotos[key]);
        }
      }

      data.photos = mergedPhotos;
      console.log("✅ Final uploaded URLs merged into data:", mergedPhotos);
      console.log("📸 Final data.photos structure:", data.photos);
    }

    const updated = await PropertyValuation.findByIdAndUpdate(id, data, { new: true, upsert: true });
    console.log("✅ MongoDB update successful:", updated);
    return NextResponse.json(updated);

  } catch (err: any) {
    console.error("🔥 UNHANDLED ERROR:", err.message, err.stack);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}
