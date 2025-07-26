import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/db';
import PropertyValuation from '@/models/PropertyValuation';
import * as ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { uploadToOneDrive } from '@/lib/onedrive';
import { generatePDFReport } from '@/lib/pdf';
import sharp from 'sharp';
import { Buffer } from 'buffer';
import { getOneDriveDownloadUrl, tokenManager } from '@/lib/onedrive-token';

async function generateCustomMapImage(address: string, apiKey: string, fullAddressLabel: string): Promise<Buffer> {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${encodeURIComponent(address)}&key=${apiKey}`;

  const arrayBuffer = await fetch(mapUrl).then(res => res.arrayBuffer());

  const nodeBuffer = Buffer.from(arrayBuffer); 

  const svgText = `
    <svg width="600" height="60">
      <rect x="0" y="0" width="600" height="60" fill="white"/>
      <text x="50%" y="50%" font-size="20" font-family="Arial" fill="black" text-anchor="middle" alignment-baseline="middle">
        ${fullAddressLabel}
      </text>
    </svg>
  `;

  const finalBuffer = await sharp(nodeBuffer)
    .extend({ top: 60, background: 'white' })
    .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
    .png()
    .toBuffer();

  return finalBuffer;
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;

  try {
    const property: any = await PropertyValuation.findById(id).lean();
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const workbook = new ExcelJS.Workbook();
    const templatePath = path.resolve(process.cwd(), 'public/templates/AAP-Report.xlsx');
    await workbook.xlsx.readFile(templatePath);
    workbook.calcProperties.fullCalcOnLoad = true;

    const filloutSheet = workbook.getWorksheet('Fillout');
    if (!filloutSheet) {
      throw new Error('Fillout sheet not found in template');
    }

    // ✅ Set values directly into specific cells under existing labels
    const overview = property.overview || {};
    const valuationDetails = property.valuationDetails || {};
    const propertyDetails = property.propertyDetails || {};
    const propertyDescriptors = property.propertyDescriptors || {};
    const locationAndNeighborhood = property.locationAndNeighborhood || {};
    const siteDetails = property.siteDetails || {};
    const ancillaryImprovements = property.ancillaryImprovements || {};
    const generalComments = property.generalComments || {};
    
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
    filloutSheet.getCell('B46').value = locationAndNeighborhood.connectedStreet?.name || '';
    filloutSheet.getCell('B47').value = locationAndNeighborhood.publicTransport?.type || '';
    filloutSheet.getCell('B48').value = locationAndNeighborhood.publicTransport?.name || '';
    filloutSheet.getCell('B49').value = locationAndNeighborhood.publicTransport?.distance || '';
    filloutSheet.getCell('B50').value = locationAndNeighborhood.shop?.type || '';
    filloutSheet.getCell('B51').value = locationAndNeighborhood.shop?.distance || '';
    filloutSheet.getCell('B52').value = locationAndNeighborhood.primarySchool?.name || '';
    filloutSheet.getCell('B53').value = locationAndNeighborhood.primarySchool?.distance || '';
    filloutSheet.getCell('B54').value = locationAndNeighborhood.highSchool?.name || '';
    filloutSheet.getCell('B55').value = locationAndNeighborhood.highSchool?.distance || '';
    filloutSheet.getCell('B56').value = locationAndNeighborhood.cbd?.name || '';
    filloutSheet.getCell('B57').value = locationAndNeighborhood.cbd?.distance || '';
    filloutSheet.getCell('B58').value = locationAndNeighborhood.includesGas || '';
    filloutSheet.getCell('B63').value = siteDetails.mapSource || '';
    filloutSheet.getCell('B66').value = propertyDescriptors.mainBuildingType || '';
    filloutSheet.getCell('B67').value = propertyDescriptors.externalWalls || '';
    filloutSheet.getCell('B68').value = propertyDescriptors.internalWalls || '';
    filloutSheet.getCell('B69').value = propertyDescriptors.roofing || '';
    filloutSheet.getCell('B70').value = propertyDescriptors.numberOfBedrooms || '';
    filloutSheet.getCell('B71').value = propertyDescriptors.numberOfBathrooms || '';
    filloutSheet.getCell('B72').value = propertyDescriptors.parkingType || '';
    filloutSheet.getCell('B75').value = propertyDescriptors.internalCondition || '';
    filloutSheet.getCell('B76').value = propertyDescriptors.externalCondition || '';
    filloutSheet.getCell('B77').value = propertyDescriptors.repairRequirements || '';
    filloutSheet.getCell('B78').value = propertyDescriptors.defects || '';
    filloutSheet.getCell('B83').value = ancillaryImprovements.driveway || '';
    filloutSheet.getCell('B84').value = ancillaryImprovements.fencing || '';
    filloutSheet.getCell('B85').value = ancillaryImprovements.otherImprovements || '';
    filloutSheet.getCell('B143').value = generalComments.marketOverview || '';
    filloutSheet.getCell('B182').value = valuationDetails.landValue || '';
    filloutSheet.getCell('B183').value = valuationDetails.improvements || '';
    filloutSheet.getCell('B184').value = valuationDetails.marketValue || '';

    // 🧹 Photos Sheet
    const photoSheet = workbook.getWorksheet('Photos');
    if (!photoSheet) {
      throw new Error('Photos sheet not found in template');
    }

    const photos = property.photos || {};
    const exteriorPhotos = photos.exteriorPhotos || [];
    const interiorPhotos = photos.interiorPhotos || [];
    const additionalPhotos = photos.additionalPhotos || [];
    const reportCoverPhoto = photos.reportCoverPhoto || [];

    const fullAddressLabel = `${overview.addressStreet}, ${overview.addressSuburb}, ${overview.addressState} ${overview.addressPostcode}`;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    // Generate and add map image
    const mapImageBuffer = await generateCustomMapImage(fullAddressLabel, apiKey, fullAddressLabel);
    const imageId = workbook.addImage({
      buffer: mapImageBuffer as any,
      extension: 'png',
    });

    photoSheet.addImage(imageId, {
      tl: { col: 2, row: 16 }, 
      ext: { width: 550, height: 230 },
    });

    // Photo grid settings
    const maxRows = 31;
    const startingRow = 4;
    const photosPerRow = 2;
    const imageWidth = 250;
    const imageHeight = 150;

    // Add report cover photo link
    photoSheet.getCell('C4').value = {text: reportCoverPhoto[0], hyperlink: reportCoverPhoto[0] || ''};

    // Process all photos
    const allPhotos: { type: string; url: string }[] = [
      ...exteriorPhotos.map((url: string) => ({ type: 'Exterior', url })),
      ...interiorPhotos.map((url: string) => ({ type: 'Interior', url })),
      ...additionalPhotos.map((url: string) => ({ type: 'Additional', url })),
    ];

    for (let i = 0; i < Math.min(allPhotos.length, maxRows); i++) {
      const rowIndex = Math.floor(i / photosPerRow);
      const colIndex = i % photosPerRow;
      
      const col = 28 + (colIndex * 4);
      const row = 5 + (rowIndex * 8);

      try {
        // ✅ Use new token manager (no manual token needed)
        const downloadUrl = await getOneDriveDownloadUrl(allPhotos[i].url);
        const response = await fetch(downloadUrl);
        const imageBuffer = await response.arrayBuffer();

        const imageId = workbook.addImage({
          buffer: Buffer.from(imageBuffer) as any,
          extension: 'png', 
        });

        photoSheet.addImage(imageId, {
          tl: { col: col, row: row }, 
          ext: { width: imageWidth, height: imageHeight },
        });
      } catch (error) {
        console.error(`Failed to embed image at position ${i}:`, error);
      }
    }
    
    // Clear remaining cells
    for (let i = allPhotos.length; i < maxRows; i++) {
      const row = startingRow + i;
      photoSheet.getCell(`AB${row}`).value = '';
    }

    // 📊 Valuation Summary Sheet
    const valuationSummarySheet = workbook.getWorksheet('Valuation Summary');
    if (!valuationSummarySheet) {
      throw new Error('Valuation sheet not found in template');
    }

    // Generate and add map image for valuation summary
    const mapImageBuffer1 = await generateCustomMapImage(fullAddressLabel, apiKey, fullAddressLabel);
    const imageId1 = workbook.addImage({
      buffer: mapImageBuffer1 as any,
      extension: 'png',
    });

    valuationSummarySheet.addImage(imageId1, {
      tl: { col: 29, row: 13 }, 
      ext: { width: 550, height: 200 },
    });

    // ✨ Valuation Summary photos - FIXED positioning
    const maxRows1 = 31;
    const photosPerRow1 = 2;
    const imageWidth1 = 180; // Reduced size to fit better
    const imageHeight1 = 90;  // Reduced size to fit better

    const allPhotos1: { type: string; url: string }[] = [
      ...exteriorPhotos.map((url: string) => ({ type: 'Exterior', url })),
      ...interiorPhotos.map((url: string) => ({ type: 'Interior', url })),
      ...additionalPhotos.map((url: string) => ({ type: 'Additional', url })),
    ];

    for (let i = 0; i < Math.min(allPhotos1.length, maxRows1); i++) {
      const rowIndex = Math.floor(i / photosPerRow1);
      const colIndex = i % photosPerRow1;
      
      // ✅ FIXED: Better positioning to stay within page bounds
      const col = 119 + (colIndex * 3); // More conservative starting position
      const row = 7 + (rowIndex * 5);   // Tighter vertical spacing

      try {
        // ✅ Use new token manager
        const downloadUrl = await getOneDriveDownloadUrl(allPhotos1[i].url);
        const response = await fetch(downloadUrl);
        const imageBuffer = await response.arrayBuffer();

        const imageId = workbook.addImage({
          buffer: Buffer.from(imageBuffer) as any,
          extension: 'png', 
        });

        valuationSummarySheet.addImage(imageId, {
          tl: { col: col, row: row }, 
          ext: { width: imageWidth1, height: imageHeight1 },
        });
      } catch (error) {
        console.error(`Failed to embed valuation summary image at position ${i}:`, error);
      }
    }

    // Clear remaining cells in valuation summary
    for (let i = allPhotos1.length; i < maxRows1; i++) {
      const row = startingRow + i;
      valuationSummarySheet.getCell(`DO${row}`).value = '';
    }

    // 📋 Report Cover Sheet
    const reportOverviewSheet = workbook.getWorksheet('Report Cover');
    if (!reportOverviewSheet) {
      throw new Error('Report Cover sheet not found in template');
    }

    // Add report cover photo link
    reportOverviewSheet.getCell('Q13').value = {
      text: "View Report Cover Photo", 
      hyperlink: reportCoverPhoto[0] || ''
    };

    // ✅ Save and return file
    const tempFilePath = path.join(os.tmpdir(), `${id}-valuation-report.xlsx`);
    await workbook.xlsx.writeFile(tempFilePath);

    const buffer = fs.readFileSync(tempFilePath);
    const file = {
      buffer,
      originalname: `Valuation-Report-${id}.xlsx`,
    };

    // Upload to OneDrive and generate PDF
    const oneDriveUrl = await uploadToOneDrive(file, id, 'Valuation-Report');
    const downloadBase64 = buffer.toString('base64');
    const pdfBuffer = await generatePDFReport(property); 

    const pdfFile = {
      buffer: pdfBuffer,
      originalname: `Valuation-Report-${id}.pdf`,
    };

    const pdfUrl = await uploadToOneDrive(pdfFile, id, 'Valuation-PDF');

    // Clean up temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      reportUrl: oneDriveUrl,
      pdfUrl: pdfUrl,
      download: downloadBase64,
      filename: `Valuation-Report-${id}.xlsx`,
    });

  } catch (err: any) {
    console.error('Excel Report Error:', err);
    
    // ✅ Enhanced error handling for different error types
    if (err.message.includes('token') || err.message.includes('401') || err.message.includes('Authentication')) {
      return NextResponse.json({ 
        error: 'Authentication failed. Please check OneDrive configuration.', 
        message: err.message,
        suggestion: 'Try running the setup script again or check your environment variables.'
      }, { status: 401 });
    }
    
    if (err.message.includes('Template') || err.message.includes('sheet not found')) {
      return NextResponse.json({ 
        error: 'Template file error', 
        message: err.message,
        suggestion: 'Ensure the Excel template file exists and has the required sheets.'
      }, { status: 400 });
    }
    
    if (err.message.includes('Property not found')) {
      return NextResponse.json({ 
        error: 'Property not found', 
        message: err.message 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate report', 
      message: err.message 
    }, { status: 500 });
  }
}