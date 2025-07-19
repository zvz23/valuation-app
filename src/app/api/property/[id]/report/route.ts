import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadToOneDrive } from '@/lib/onedrive';
import { generatePDFReport } from '@/lib/pdf';
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

    const filloutSheet = workbook.getWorksheet('Fillout');
    if (!filloutSheet) {
      throw new Error('Fillout sheet not found in template');
    }

    // ✅ Set values directly into specific cells under existing labels
    const overview = property.overview || {};
    const valuationDetails = property.valuationDetails || {};
    const propertyDetails = property.propertyDetails || {};
    const locationAndNeighborhood = property.locationAndNeighborhood || {};
    filloutSheet.getCell('B2').value = overview.jobNumber || '';
    filloutSheet.getCell('C2').value = overview.closedByz || '';
    filloutSheet.getCell('D2').value = overview.propertyValuer || '';
    filloutSheet.getCell('E2').value = overview.reportType || '';
    filloutSheet.getCell('F2').value = overview.valuationType || '';
    filloutSheet.getCell('G2').value = overview.addressStreet || '';
    filloutSheet.getCell('H2').value = overview.addressSuburb || '';
    filloutSheet.getCell('I2').value = overview.addressState || '';
    filloutSheet.getCell('J2').value = overview.addressPostcode || '';
    filloutSheet.getCell('K2').value = overview.propertyType || '';
    filloutSheet.getCell('L2').value = overview.valuationNotes || '';
    filloutSheet.getCell('M2').value = overview.dateOfValuation || '';
    filloutSheet.getCell('N2').value = valuationDetails.clientsExpectedValue || '';
    filloutSheet.getCell('O2').value = overview.surveyType || '';
    filloutSheet.getCell('P2').value = overview.dateOfInspection || '';
    filloutSheet.getCell('Q2').value = valuationDetails.valuersGuaranteedValue || '';
    filloutSheet.getCell('R2').value = valuationDetails.requestedValuationTarget || '';
    filloutSheet.getCell('B22').value = overview.dateOfValuation || '';
    filloutSheet.getCell('B24').value = overview.dateOfValuation || '';
    filloutSheet.getCell('B27').value = propertyDetails.buildYear || '';
    filloutSheet.getCell('B28').value = propertyDetails.titleReference || '';
    filloutSheet.getCell('B29').value = propertyDetails.councilArea || '';
    filloutSheet.getCell('B31').value = propertyDetails.zoning || '';
    filloutSheet.getCell('B32').value = propertyDetails.permissibleUses || '';
    filloutSheet.getCell('B33').value = propertyDetails.landShape || '';
    filloutSheet.getCell('B34').value = propertyDetails.landSlope || '';
    filloutSheet.getCell('B35').value = propertyDetails.frontage || '';
    filloutSheet.getCell('B36').value = propertyDetails.depth || '';
    filloutSheet.getCell('B37').value = propertyDetails.siteArea || '';
    filloutSheet.getCell('B38').value = propertyDetails.livingArea || '';
    filloutSheet.getCell('B39').value = propertyDetails.externalArea || '';
    filloutSheet.getCell('B44').value = locationAndNeighborhood.suburbDescription || '';
    filloutSheet.getCell('B45').value = locationAndNeighborhood.addressStreet || '';
    filloutSheet.getCell('B46').value = locationAndNeighborhood.connectedStreet || '';
    filloutSheet.getCell('B47').value = locationAndNeighborhood.publicTransport?.type || '';
    filloutSheet.getCell('B48').value = locationAndNeighborhood.publicTransport?.name || '';
    filloutSheet.getCell('B49').value = locationAndNeighborhood.publicTransport?.distance || '';
    filloutSheet.getCell('B50').value = locationAndNeighborhood.shop?.type || '';
    filloutSheet.getCell('B51').value = locationAndNeighborhood.shop?.distance || '';
    
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
    const pdfBuffer = await generatePDFReport(property); 

      const pdfFile = {
        buffer: pdfBuffer,
        originalname: `Valuation-Report-${id}.pdf`,
      };

      const pdfUrl = await uploadToOneDrive(pdfFile, id, 'Valuation-PDF');

    return NextResponse.json({
      success: true,
      reportUrl: oneDriveUrl,
      pdfUrl: pdfUrl,
      download: downloadBase64,
      filename: `Valuation-Report-${id}.xlsx`,
    });
  } catch (err: any) {
    console.error('Excel Report Error:', err);
    return NextResponse.json({ error: 'Failed to generate report', message: err.message }, { status: 500 });
  }
}
