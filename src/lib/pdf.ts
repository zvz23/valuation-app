// lib/pdf.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generatePDFReport(property: any): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 12;
  let y = height - 50;

  const drawText = (label: string, value: string, isTitle = false) => {
    const text = `${label}: ${value}`;
    page.drawText(text, {
      x: 50,
      y,
      size: isTitle ? 14 : fontSize,
      font: isTitle ? titleFont : font,
      color: rgb(0, 0, 0),
    });
    y -= isTitle ? 25 : 18;
  };

  drawText('Valuation Report', '', true);
  y -= 10;

  const sections: [string, any][] = [
    ['Overview', property.overview],
    ['Valuation Details', property.valuationDetails],
    ['Property Details', property.propertyDetails],
    ['Location and Neighborhood', property.locationAndNeighborhood],
    ['Room Features and Fixtures', property.roomFeaturesFixtures],
    ['Property Descriptors', property.propertyDescriptors],
    ['Ancillary Improvements', property.ancillaryImprovements],
    ['Statutory Details', property.statutoryDetails],
    ['Site Details', property.siteDetails],
    ['Planning Details', property.planningDetails],
    ['General Comments', property.generalComments],
  ];

  for (const [section, data] of sections) {
    if (!data) continue;
    drawText(section, '', true);
    for (const [key, value] of Object.entries(data)) {
      drawText(key, String(value ?? ''));
      if (y < 60) {
        // Add a new page if nearing bottom
        y = height - 50;
        page = pdfDoc.addPage([595, 842]);
      }
    }
    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
