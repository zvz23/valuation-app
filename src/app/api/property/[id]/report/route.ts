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
  const { id } = await context.params;

  try {
    const property: any = await PropertyValuation.findById(id).lean();
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const templatePath = path.resolve(process.cwd(), 'public/templates/AAP-Report.xlsx');
    await workbook.xlsx.readFile(templatePath);

    // 🧹 Keep only allowed sheets
    const allowedSheets = ['Fillout', 'Photos', 'Report Cover', 'Valuation Summary'];
    workbook.worksheets.forEach(sheet => {
      if (!allowedSheets.includes(sheet.name)) {
        workbook.removeWorksheet(sheet.id);
      }
    });

    // 🧹 Recreate Fillout Sheet
    const existingFillout = workbook.getWorksheet('Fillout');
    if (existingFillout) workbook.removeWorksheet(existingFillout.id);
    const filloutSheet = workbook.addWorksheet('Fillout');

    let row = 1;

    // 📌 Horizontal Overview Section
    const overview = property.overview || {};
    filloutSheet.getCell(`A${row}`).value = 'Overview';
    filloutSheet.getRow(row).font = { bold: true };
    row++;

    let col = 1;
    for (const key in overview) {
      if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
      filloutSheet.getCell(row, col).value = key;
      col++;
    }

    row++;
    col = 1;
    for (const key in overview) {
      if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
      const value = overview[key];
      filloutSheet.getCell(row, col).value =
        value === null || value === undefined
          ? ''
          : typeof value === 'object'
          ? JSON.stringify(value)
          : value;
      col++;
    }
    row += 2; // spacing after overview

    // 📌 Helper for vertical sections
    const writeSection = (title: string, data: Record<string, any>) => {
      filloutSheet.getCell(`A${row}`).value = title;
      filloutSheet.getRow(row).font = { bold: true };
      row++;
      for (const key in data) {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) continue;
        filloutSheet.getCell(`A${row}`).value = key;
        const value = data[key];
        filloutSheet.getCell(`B${row}`).value =
          value === null || value === undefined
            ? ''
            : typeof value === 'object'
            ? JSON.stringify(value)
            : value;
        row++;
      }
      row++;
    };

    // 📌 Vertical sections
    writeSection('Valuation Details', property.valuationDetails || {});
    writeSection('Property Details', property.propertyDetails || {});
    writeSection('Location and Neighborhood', property.locationAndNeighborhood || {});
    writeSection('Room Features and Fixtures', property.roomFeaturesFixtures || {});
    writeSection('Property Descriptors', property.propertyDescriptors || {});
    writeSection('Ancillary Improvements', property.ancillaryImprovements || {});
    writeSection('Statutory Details', property.statutoryDetails || {});
    writeSection('Site Details', property.siteDetails || {});
    writeSection('Planning Details', property.planningDetails || {});
    writeSection('General Comments', property.generalComments || {});

    // 🧹 Recreate Photos Sheet
    const existingPhotosSheet = workbook.getWorksheet('Photos');
    if (existingPhotosSheet) workbook.removeWorksheet(existingPhotosSheet.id);

    const photoSheet = workbook.addWorksheet('Photos');
    let photoRow = 1;

    const photos = property.photos || {};
    const exteriorPhotos = photos.exteriorPhotos || [];
    const interiorPhotos = photos.interiorPhotos || [];
    const additionalPhotos = photos.additionalPhotos || [];

    // ➤ Report Cover Photo (first exterior photo)
    if (exteriorPhotos.length > 0) {
      photoSheet.getCell(`A${photoRow}`).value = 'Report Cover Photo';
      photoSheet.getCell(`B${photoRow}`).value = {
        text: exteriorPhotos[0],
        hyperlink: exteriorPhotos[0],
      };
      photoRow += 2;
    }

    // ➤ Helper for Photo Sections
    const writePhotoSection = (title: string, photoArray: string[]) => {
      if (!photoArray.length) return;
      photoSheet.getCell(`A${photoRow}`).value = `Photos (${title}):`;
      photoSheet.getRow(photoRow).font = { bold: true };
      photoRow++;

      photoArray.forEach((url, index) => {
        photoSheet.getCell(`A${photoRow}`).value = `Photo ${index + 1}`;
        photoSheet.getCell(`B${photoRow}`).value = {
          text: url,
          hyperlink: url,
        };
        photoRow++;
      });

      photoRow++; // spacing
    };

    writePhotoSection('Exterior Photos', exteriorPhotos);
    writePhotoSection('Interior Photos', interiorPhotos);
    writePhotoSection('Additional Photos', additionalPhotos);

    // ✅ Save and return file
    const tempFilePath = path.join(os.tmpdir(), `${id}-valuation-report.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);

    const buffer = fs.readFileSync(tempFilePath);
    const file = {
      buffer,
      originalname: `Valuation-Report-${id}.xlsx`,
    };

    const oneDriveUrl = await uploadToOneDrive(file, id, 'Valuation-Report');
    const downloadBase64 = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      reportUrl: oneDriveUrl,
      download: downloadBase64,
      filename: `Valuation-Report-${id}.xlsx`,
    });
  } catch (err: any) {
    console.error('Excel Report Error:', err);
    return NextResponse.json({ error: 'Failed to generate report', message: err.message }, { status: 500 });
  }
}
