import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import { propertyValuationValidationSchemas } from '@/models/PropertyValuationSchemas';
import mongoose from 'mongoose';



export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const property = await PropertyValuation.findById(context.params.id);
  if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(property);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const deleted = await PropertyValuation.findByIdAndDelete(context.params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();

  for (const [section, schema] of Object.entries(propertyValuationValidationSchemas)) {
    if (data[section]) {
      try {
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

  const updated = await PropertyValuation.findByIdAndUpdate(context.params.id, data, { new: true, upsert: true });
  return NextResponse.json(updated);
}
