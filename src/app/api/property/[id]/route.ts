import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import { propertyValuationValidationSchemas } from '@/models/PropertyValuationSchemas';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const property = await PropertyValuation.findById(id);
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
  const data = await req.json();
  
  for (const [section, schema] of Object.entries(propertyValuationValidationSchemas)) {
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
  
  const updated = await PropertyValuation.findByIdAndUpdate(id, data, { new: true, upsert: true });
  return NextResponse.json(updated);
}
