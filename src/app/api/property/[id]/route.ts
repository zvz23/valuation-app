import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import { propertyValuationValidationSchemas } from '@/models/PropertyValuationSchemas';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const property = await PropertyValuation.findById(params.id);
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(property);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await PropertyValuation.findByIdAndDelete(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();

  // Validate each section
  for (const [section, schema] of Object.entries(propertyValuationValidationSchemas)) {
    if (data[section]) {
      try {
        // Use Mongoose schema's validateSync for validation
        const Model = mongoose.model('Temp', schema);
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

  // If all validations pass, update
  const updated = await PropertyValuation.findByIdAndUpdate(params.id, data, { new: true, upsert: true });
  return NextResponse.json(updated);
}