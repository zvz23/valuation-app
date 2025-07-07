import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadToOneDrive } from '@/lib/onedrive';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await  context.params;

  try {
    const property = await PropertyValuation.findById(id);
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const templatePath = path.resolve(process.cwd(), 'public/templates/AAP-Report.xlsx');
    await workbook.xlsx.readFile(templatePath);

    const filloutSheet = workbook.getWorksheet('Fillout');
    const photoSheet = workbook.getWorksheet('Photos');

    if (!filloutSheet || !photoSheet) {
      return NextResponse.json({ error: 'Excel template missing required sheets' }, { status: 500 });
    }
    const overview = property.overview || {};
    const fillMap: Record<string, any> = {
      B3: overview.jobNumber,
      B4: overview.closedBy,
      B5: overview.propertyValuer,
      B6: overview.instructedBy,
      B7: overview.reportType,
      B8: overview.valuationType,
      B9: overview.surveyType,
      B10: overview.dateOfInspection,
      B11: overview.dateOfValuation,
      B12: overview.addressStreet,
      B13: overview.addressSuburb,
      B14: overview.addressState,
      B15: overview.addressPostcode,
      B16: overview.purposeOfReport,
      B17: overview.reportUploaded,
      B18: overview.reportSent,
    };

    for (const [cell, value] of Object.entries(fillMap)) {
      filloutSheet.getCell(cell).value = value || '';
    }

    // Add photo URLs to Photos sheet
    const photos = property.photos || {};
    let row = 4;
    for (let i = 1; i <= 6; i++) {
      const key = `Photo${i}`;
      const urls = photos[key];
      if (Array.isArray(urls) && urls.length > 0) {
        photoSheet.getCell(`B${row}`).value = key;
        photoSheet.getCell(`C${row}`).value = urls[0];
        row++;
      }
    }

    // Save Excel to temp file
    const tempFilePath = path.join(os.tmpdir(), `${id}-valuation-report.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);

    const buffer = fs.readFileSync(tempFilePath);

    const file = {
        buffer,
        originalname: `Valuation-Report-${id}.xlsx`,
    };

    const oneDriveUrl = await uploadToOneDrive(file, id, 'Valuation-Report');


    return NextResponse.json({ success: true, reportUrl: oneDriveUrl });
  } catch (err: any) {
    console.error('Excel Report Error:', err);
    return NextResponse.json({ error: 'Failed to generate report', message: err.message }, { status: 500 });
  }
}
