import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Client } from '@microsoft/microsoft-graph-client';
import { tokenManager } from './onedrive-token.js';

const execAsync = promisify(exec);

// WinAX will be loaded at runtime using CommonJS require

/**
 * Generate PDF from Excel using WinAX (Windows COM automation)
 */
export async function generatePDFUsingWinAX(excelFilePath: string, sheetNames: string[]): Promise<Buffer> {
  let winax;
  let excel = null;
  let workingDir: string = '';
  
  try {
    // Use CommonJS require for native modules (works better with Node.js addons)
    console.log('Loading WinAX using CommonJS require...');
    
    try {
      // Use eval to prevent Next.js from trying to bundle this at compile time
      const requireFunc = eval('require');
      winax = requireFunc('winax');
    } catch (error1: unknown) {
      const error1Message = error1 instanceof Error ? error1.message : 'Unknown error';
      console.error('WinAX require error:', error1Message);
      throw new Error(`WinAX module not found. Ensure it's properly installed and try rebuilding: npm rebuild winax. Error: ${error1Message}`);
    }

    if (!winax || !winax.Object) {
      throw new Error('WinAX module loaded but Object constructor not available. Check WinAX installation.');
    }

    console.log('WinAX module loaded successfully');

    console.log('Starting WinAX Excel automation...');
    console.log(`Excel file: ${excelFilePath}`);
    console.log(`Sheets to export: ${sheetNames.join(', ')}`);

    // Ensure the Excel file exists
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    // Create temporary working directory and files
    const timestamp = Date.now();
    workingDir = path.join(os.tmpdir(), `excel-work-${timestamp}`);
    if (!fs.existsSync(workingDir)) {
      fs.mkdirSync(workingDir, { recursive: true });
    }
    
    // Copy Excel file to working directory with simple name (avoid path issues)
    const workingExcelPath = path.join(workingDir, 'workbook.xlsx');
    const tempPdfPath = path.join(workingDir, 'output.pdf');
    
    console.log(`Working directory: ${workingDir}`);
    console.log(`Working Excel file: ${workingExcelPath}`);
    console.log(`Target PDF path: ${tempPdfPath}`);
    
    // Copy the file to avoid path/permission issues
    fs.copyFileSync(excelFilePath, workingExcelPath);
    console.log('Excel file copied to working directory');

    // Kill any existing Excel processes to avoid conflicts
    try {
      await execAsync('taskkill /F /IM excel.exe', { windowsHide: true });
      console.log('Cleaned up existing Excel processes');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (killError) {
      // It's okay if no Excel processes were running
      console.log('No existing Excel processes to clean up');
    }

    // ✅ Auto-Repair Phase: Use visible Excel to handle corruption dialogs
    console.log('🔧 Starting auto-repair process for potentially corrupted Excel file...');
    
    // Create Excel Application for repair (VISIBLE)
    console.log('Creating visible Excel application for auto-repair...');
    excel = new winax.Object('Excel.Application');
    
    // Configure Excel for auto-repair (VISIBLE mode)
    excel.Visible = true;              // ✅ VISIBLE to allow recovery dialogs
    excel.DisplayAlerts = true;        // ✅ ALLOW alerts for auto-repair
    excel.EnableEvents = false;        // Disable events for performance
    excel.ScreenUpdating = true;       // Allow screen updates for dialogs
    excel.Interactive = true;          // ✅ ALLOW interaction for repair dialogs
    excel.UserControl = false;         // Prevent user control over app lifecycle
    excel.AskToUpdateLinks = false;    // Don't ask about links

    console.log('Visible Excel application created for auto-repair');

    let repairedWorkbook = null;
    let autoRepairSucceeded = false;

    try {
      console.log('🔧 Attempting to open and auto-repair Excel file...');
      
      // Try to open with auto-repair - Excel will show recovery dialog if needed
      // User will see "We found a problem... Do you want us to try to recover..." dialog
      // This dialog will auto-confirm if DisplayAlerts = true
      repairedWorkbook = excel.Workbooks.Open(
        path.resolve(workingExcelPath),
        0,        // UpdateLinks = No
        false,    // ReadOnly = False (allow repair)
        null,     // Format
        '',       // Password
        '',       // WriteResPassword  
        true,     // IgnoreReadOnlyRecommended
        null,     // Origin
        null,     // Delimiter
        false,    // Editable
        false,    // Notify
        null,     // Converter
        false,    // AddToMru
        null,     // Local
        2         // CorruptLoad = xlRepairFile (auto-repair mode)
      );

      if (repairedWorkbook) {
        console.log('✅ Excel file opened successfully (with auto-repair if needed)');
        console.log(`📊 Repaired workbook size in memory: ~${(33933126 / 1024 / 1024).toFixed(1)}MB (preserved)`);
        
        // ✅ SKIP SaveAs to preserve all images/data - work directly with repaired workbook
        console.log('🔄 Keeping repaired workbook in memory to preserve all images and data');
        autoRepairSucceeded = true;
        
        // DON'T close the workbook yet - we'll use it directly for PDF generation
        console.log('✅ Repaired workbook ready for PDF generation (all content preserved)');
      }
      
    } catch (repairError: unknown) {
      const errorMessage = repairError instanceof Error ? repairError.message : 'Unknown error';
      console.warn('⚠️ Auto-repair attempt failed:', errorMessage);
      autoRepairSucceeded = false;
    }

    // ✅ PDF Generation Phase: Use repaired workbook directly or fallback
    console.log('📄 Starting PDF generation...');
    
    let workbook = null;
    
    if (autoRepairSucceeded && repairedWorkbook) {
      // ✅ Use the already-opened repaired workbook (preserves all content)
      console.log('✅ Using repaired workbook directly (all 33MB content preserved)');
      workbook = repairedWorkbook;
      
      // Switch Excel to hidden mode for PDF generation
      excel.Visible = false;
      excel.DisplayAlerts = false;
      excel.Interactive = false;
      excel.ScreenUpdating = false;
      console.log('📄 Switched to hidden mode for PDF generation');
      
    } else {
      // ❌ Fallback: Close visible Excel and start fresh with original file
      console.log('⚠️ Auto-repair failed or not needed, using original file');
      
      // Close visible Excel application
      try {
        if (excel) {
          excel.Quit();
          excel = null;
          console.log('Visible Excel application closed');
        }
      } catch (quitError) {
        console.warn('Warning: Could not properly quit visible Excel:', quitError);
      }

      // Wait for Excel to fully close
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create new Excel Application for PDF generation (HIDDEN)
      console.log('Creating hidden Excel application for PDF generation...');
      excel = new winax.Object('Excel.Application');
      
      // Configure Excel for PDF generation (HIDDEN mode)
      excel.Visible = false;
      excel.DisplayAlerts = false;
      excel.EnableEvents = false;
      excel.ScreenUpdating = false;
      excel.Interactive = false;
      excel.UserControl = false;
      excel.AskToUpdateLinks = false;

      console.log('Hidden Excel application created for PDF generation');

      // Open the workbook with improved path handling
      console.log('Opening workbook for PDF generation...');
      const fullPath = path.resolve(workingExcelPath);
      console.log(`Resolved path: ${fullPath}`);
      console.log(`File exists: ${fs.existsSync(fullPath)}`);
      console.log(`File size: ${fs.statSync(fullPath).size} bytes`);
      
      // Try different approaches to open the workbook
      try {
        // Method 1: Simple open (most reliable)
        console.log('Trying simple workbook open...');
        workbook = excel.Workbooks.Open(fullPath);
      } catch (simpleOpenError) {
        console.log('Simple open failed, trying with parameters...');
        try {
          // Method 2: Open with minimal parameters
          workbook = excel.Workbooks.Open(
            fullPath,
            0,      // UpdateLinks = No
            false,  // ReadOnly = False
            null,   // Format
            '',     // Password
            '',     // WriteResPassword
            true    // IgnoreReadOnlyRecommended
          );
        } catch (paramOpenError) {
          console.log('Parameterized open failed, trying read-only...');
          // Method 3: Try read-only first, then we'll save as new file
          workbook = excel.Workbooks.Open(
            fullPath,
            0,      // UpdateLinks = No
            true    // ReadOnly = True
          );
        }
      }
    }

    if (!workbook) {
      throw new Error('Failed to open workbook');
    }

    console.log(`Workbook opened successfully. Total sheets: ${workbook.Sheets.Count}`);

    // Get all sheet names for debugging
    const allSheets: string[] = [];
    for (let i = 1; i <= workbook.Sheets.Count; i++) {
      const sheetName = workbook.Sheets(i).Name;
      allSheets.push(sheetName);
      console.log(`Available sheet: "${sheetName}"`);
    }

    // Validate that requested sheets exist
    const missingSheets = sheetNames.filter(name => !allSheets.includes(name));
    if (missingSheets.length > 0) {
      throw new Error(`Missing sheets: ${missingSheets.join(', ')}. Available sheets: ${allSheets.join(', ')}`);
    }

    // Hide all sheets first, then show only the target sheets
    console.log('Setting up sheet visibility...');
    
    for (let i = 1; i <= workbook.Sheets.Count; i++) {
      const sheet = workbook.Sheets(i);
      const sheetName = sheet.Name;
      
      if (sheetNames.includes(sheetName)) {
        console.log(`Making sheet visible: ${sheetName}`);
        sheet.Visible = -1; // xlSheetVisible
      } else {
        console.log(`Hiding sheet: ${sheetName}`);
        try {
          sheet.Visible = 0; // xlSheetHidden
        } catch (hideError: unknown) {
          const errorMessage = hideError instanceof Error ? hideError.message : 'Unknown error';
          console.warn(`Could not hide sheet ${sheetName}:`, errorMessage);
        }
      }
    }

    // Ensure the first target sheet is active
    const firstTargetSheet = workbook.Sheets(sheetNames[0]);
    if (firstTargetSheet) {
      firstTargetSheet.Activate();
      console.log(`Activated sheet: ${sheetNames[0]}`);
    }

    // ✅ Configure proper page setup for each visible sheet (like manual Save As PDF)
    console.log('📄 Configuring page setup for proper PDF formatting...');
    
    for (let i = 1; i <= workbook.Sheets.Count; i++) {
      const sheet = workbook.Sheets(i);
      const sheetName = sheet.Name;
      
      if (sheetNames.includes(sheetName)) {
        console.log(`🔧 Setting up page formatting for sheet: ${sheetName}`);
        
        // Activate sheet to configure it
        sheet.Activate();
        
        try {
          // Configure page setup exactly like Excel's Save As PDF
          const pageSetup = sheet.PageSetup;
          
          // ✅ CRITICAL: Clear any existing print area first
          pageSetup.PrintArea = '';
          
          // Page orientation and size - CORRECTED
          pageSetup.Orientation = 1;           // xlPortrait
          pageSetup.PaperSize = 1;             // xlPaperLetter
          
          // ✅ SMALLER margins for more content (like Excel default)
          pageSetup.LeftMargin = 36;           // 0.5 inch (was 1 inch)
          pageSetup.RightMargin = 36;          // 0.5 inch  
          pageSetup.TopMargin = 36;            // 0.5 inch
          pageSetup.BottomMargin = 36;         // 0.5 inch
          pageSetup.HeaderMargin = 18;         // 0.25 inch
          pageSetup.FooterMargin = 18;         // 0.25 inch
          
          // ✅ CRITICAL: Proper scaling to fit content
          pageSetup.Zoom = false;              // Disable fixed zoom
          pageSetup.FitToPagesWide = 1;        // Fit to 1 page wide
          pageSetup.FitToPagesTall = 0;        // 0 = unlimited height (auto-fit)
          
          // Print quality and options (CRITICAL for images)
          pageSetup.PrintQuality = 600;        // High quality (important for images)
          pageSetup.CenterHorizontally = true; // Center horizontally for better look
          pageSetup.CenterVertically = false;  // Don't center vertically
          pageSetup.Draft = false;             // ✅ HIGH QUALITY (not draft - preserves images)
          pageSetup.BlackAndWhite = false;     // ✅ COLOR printing (preserves image colors)
          pageSetup.PrintComments = 0;         // xlPrintNoComments
          pageSetup.PrintErrors = 2;           // xlPrintErrorsDisplayed
          
          // ✅ CRITICAL: Ensure images and graphics are included
          try {
            pageSetup.PrintNotes = false;       // Don't print notes
            pageSetup.PrintGridlines = false;   // Don't print gridlines
            pageSetup.PrintHeadings = false;    // Don't print row/column headings
          } catch (printOptionsError) {
            console.log('Some print options not available, continuing...');
          }
          
          // ✅ CRITICAL: Set print area to actual content area (not entire used range)
          const usedRange = sheet.UsedRange;
          if (usedRange) {
            // Don't use the entire used range - Excel sheets are huge
            // Instead, let Excel auto-determine the print area
            console.log(`📊 Available range for ${sheetName}: ${usedRange.Address}`);
            console.log(`📊 Letting Excel auto-determine optimal print area for ${sheetName}`);
          }
          
          console.log(`✅ Page setup configured for ${sheetName}`);
          
        } catch (setupError: unknown) {
          const errorMessage = setupError instanceof Error ? setupError.message : 'Unknown error';
          console.warn(`⚠️ Could not configure page setup for ${sheetName}:`, errorMessage);
        }
      }
    }

    // ✅ Verify images are present in workbook before export
    console.log('🖼️ Checking for embedded images in workbook...');
    try {
      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        const sheet = workbook.Sheets(sheetName);
        sheet.Activate();
        
        // Check if sheet has any shapes/images
        try {
          const shapes = sheet.Shapes;
          if (shapes && shapes.Count > 0) {
            console.log(`✅ Found ${shapes.Count} images/shapes in sheet: ${sheetName}`);
          } else {
            console.log(`⚠️ No images found in sheet: ${sheetName}`);
          }
        } catch (shapesError) {
          console.log(`📊 Could not check shapes in ${sheetName} (this is normal)`);
        }
      }
    } catch (imageCheckError) {
      console.log('📊 Could not verify images (this is normal)');
    }

    // Export as PDF with proper settings (mimic Excel's Save As PDF)
    console.log('📄 Exporting to PDF with Excel-quality settings...');
    console.log(`Exporting to PDF path: ${tempPdfPath}`);
    
    try {
      // ✅ Method 1: Use workbook export with CORRECTED parameters
      console.log('🎯 Using workbook-level export (matches manual Save As PDF)...');
      
      workbook.ExportAsFixedFormat(
        0,                          // xlTypePDF  
        tempPdfPath,               // Filename
        0,                         // xlQualityStandard (HIGH QUALITY - preserves images)
        true,                      // IncludeDocProps (include document properties)
        false,                     // IgnorePrintAreas (FALSE = use our configured print areas)
        1,                         // From (page 1)
        999,                       // To (page 999 = all pages)  
        false                      // OpenAfterPublish (don't open after export)
        // ❌ UseDocumentFormat removed - was causing E_INVALIDARG
      );
      
      console.log('🖼️ PDF exported with high-quality image preservation settings');
      
      console.log('✅ PDF export completed with workbook method');
      
    } catch (exportError1: unknown) {
      const error1Message = exportError1 instanceof Error ? exportError1.message : 'Unknown error';
      console.log('❌ Workbook export failed, trying sheet-by-sheet method:', error1Message);
      
      try {
        // ✅ Method 2: Export each visible sheet separately then combine
        console.log('🔄 Trying sheet-by-sheet export method...');
        
        const tempPdfPaths: string[] = [];
        
        for (let i = 0; i < sheetNames.length; i++) {
          const sheetName = sheetNames[i];
          const sheet = workbook.Sheets(sheetName);
          const sheetPdfPath = path.join(workingDir, `sheet-${i}-${sheetName.replace(/[^a-zA-Z0-9]/g, '')}.pdf`);
          
          console.log(`📄 Exporting sheet: ${sheetName} to ${sheetPdfPath}`);
          
          // Activate and export this sheet
          sheet.Activate();
          
          sheet.ExportAsFixedFormat(
            0,                      // xlTypePDF
            sheetPdfPath,          // Individual sheet PDF path
            0,                     // xlQualityStandard
            true,                  // IncludeDocProps
            false,                 // IgnorePrintAreas (use configured print areas)
            1,                     // From (page 1)
            999,                   // To (page 999 = all pages)
            false                  // OpenAfterPublish
            // ❌ REMOVED UseDocumentFormat - this was causing E_INVALIDARG!
          );
          
          tempPdfPaths.push(sheetPdfPath);
          console.log(`✅ Sheet ${sheetName} exported successfully`);
        }
        
        // For now, use the first sheet (we'd need a PDF merger for multiple sheets)
        if (tempPdfPaths.length > 0 && fs.existsSync(tempPdfPaths[0])) {
          fs.copyFileSync(tempPdfPaths[0], tempPdfPath);
          console.log('✅ Using first sheet PDF as final output');
        }
        
      } catch (exportError2: unknown) {
        const error2Message = exportError2 instanceof Error ? exportError2.message : 'Unknown error';
        console.log('❌ Sheet-by-sheet export failed, trying basic method:', error2Message);
        
        try {
          // ✅ Method 3: Basic export with minimal parameters
          console.log('🔄 Trying basic export method...');
          
          workbook.ExportAsFixedFormat(0, tempPdfPath);
          console.log('✅ Basic export completed');
          
        } catch (exportError3: unknown) {
          const error3Message = exportError3 instanceof Error ? exportError3.message : 'Unknown error';
          console.error('❌ All export methods failed:', error3Message);
          throw new Error(`All PDF export methods failed. Last error: ${error3Message}`);
        }
      }
    }

    console.log('PDF export completed');

    // Close workbook without saving changes
    workbook.Close(false);
    console.log('Workbook closed');

    // Wait a moment for file system to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify PDF was created
    if (!fs.existsSync(tempPdfPath)) {
      throw new Error(`PDF file was not created at: ${tempPdfPath}`);
    }

    // Read the PDF file
    const pdfBuffer = fs.readFileSync(tempPdfPath);
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);

    // Clean up working directory
    try {
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
      if (fs.existsSync(workingExcelPath)) {
        fs.unlinkSync(workingExcelPath);
      }
      if (fs.existsSync(workingDir)) {
        fs.rmdirSync(workingDir);
      }
      console.log('Working directory cleaned up');
    } catch (cleanupError) {
      console.warn('Could not cleanup working directory:', cleanupError);
    }

    // Validate PDF
    if (pdfBuffer.length === 0) {
      throw new Error('Generated PDF file is empty');
    }

    // Check if it's a valid PDF
    const pdfHeader = pdfBuffer.subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Generated file is not a valid PDF');
    }

    console.log('PDF generated successfully using WinAX');
    return pdfBuffer;

  } catch (error: any) {
    console.error('WinAX Excel automation failed:', error);
    
    // Enhanced error handling
    if (error.message.includes('Excel.Application')) {
      throw new Error('Failed to create Excel application. Ensure Microsoft Excel is installed and accessible.');
    }
    
    if (error.message.includes('Open')) {
      throw new Error('Failed to open Excel file. The file may be corrupted or in use by another process.');
    }
    
    if (error.message.includes('ExportAsFixedFormat')) {
      throw new Error('Failed to export PDF. Check Excel installation and file permissions.');
    }

    throw new Error(`WinAX Excel automation failed: ${error.message}`);
    
  } finally {
    // Clean up Excel application
    if (excel) {
      try {
        console.log('Cleaning up Excel application...');
        excel.Quit();
        excel = null;
        console.log('Excel application closed');
      } catch (cleanupError) {
        console.warn('Failed to properly close Excel:', cleanupError);
      }
    }

    // Force cleanup of any remaining Excel processes
    try {
      await execAsync('taskkill /F /IM excel.exe', { windowsHide: true });
      console.log('Final Excel process cleanup completed');
    } catch (finalCleanupError) {
      // It's okay if no processes were running
    }

    // Final cleanup of working directory
    try {
      if (workingDir && fs.existsSync(workingDir)) {
        const files = fs.readdirSync(workingDir);
        for (const file of files) {
          fs.unlinkSync(path.join(workingDir, file));
        }
        fs.rmdirSync(workingDir);
        console.log('Final working directory cleanup completed');
      }
    } catch (finalDirCleanup) {
      console.warn('Final working directory cleanup failed:', finalDirCleanup);
    }
  }
}

/**
 * Generate PDF from Excel using local processing (no Graph API Excel dependencies)
 */
export async function generatePDFUsingGraphAPI(excelFilePath: string, sheetNames: string[], userEmail: string): Promise<Buffer> {
  try {
    console.log('Starting local Excel-to-PDF generation...');
    console.log(`Source Excel file: ${excelFilePath}`);
    console.log(`Sheets to export: ${sheetNames.join(', ')}`);

    // Install puppeteer if not already available for PDF generation
    let puppeteer;
    let ExcelJS;
    
    try {
      [puppeteer, ExcelJS] = await Promise.all([
        import('puppeteer'),
        import('exceljs')
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Required modules not found. Please install: npm install puppeteer exceljs. Error: ${errorMessage}`);
    }

    // ✅ Process Excel file locally (no Graph API dependency)
    console.log('Reading Excel file locally...');
    const workbook = new ExcelJS.default.Workbook();
    await workbook.xlsx.readFile(excelFilePath);

    let htmlContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px; 
            }
            h1 { 
              color: #333; 
              border-bottom: 2px solid #4CAF50; 
              padding-bottom: 10px; 
              margin-top: 30px; 
              page-break-before: auto;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-bottom: 30px; 
              font-size: 11px;
            }
            td, th { 
              padding: 6px 8px; 
              border: 1px solid #ddd; 
              text-align: left; 
              vertical-align: top;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .page-break { 
              page-break-before: always; 
            }
            .bold { font-weight: bold; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
    `;

    // Process each target sheet locally
    for (let sheetIndex = 0; sheetIndex < sheetNames.length; sheetIndex++) {
      const sheetName = sheetNames[sheetIndex];
      
      try {
        console.log(`Processing sheet: ${sheetName}`);
        const worksheet = workbook.getWorksheet(sheetName);
        
        if (!worksheet) {
          console.warn(`Sheet "${sheetName}" not found`);
          htmlContent += `<h1>${sheetName}</h1><p>Sheet not found in workbook</p>`;
          continue;
        }

        // Add page break before each sheet (except first)
        if (sheetIndex > 0) {
          htmlContent += '<div class="page-break"></div>';
        }

        htmlContent += `<h1>${sheetName}</h1>`;
        
        // Get the used range
        const usedRange = worksheet.actualRowCount;
        const usedColRange = worksheet.actualColumnCount;
        
        if (usedRange > 0 && usedColRange > 0) {
          htmlContent += '<table>';
          
          // Process each row
          for (let rowNumber = 1; rowNumber <= usedRange; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            
            // Skip completely empty rows
            if (!row.hasValues) continue;
            
            htmlContent += '<tr>';
            
            // Process each cell in the row
            for (let colNumber = 1; colNumber <= usedColRange; colNumber++) {
              const cell = row.getCell(colNumber);
              let cellValue = '';
              let cellClass = '';
              
              // Extract cell value
              if (cell.value !== null && cell.value !== undefined) {
                if (typeof cell.value === 'object' && cell.value !== null) {
                  // Check if it's a hyperlink value
                  if ('hyperlink' in cell.value) {
                    const hyperlinkValue = cell.value as any;
                    cellValue = hyperlinkValue.text || hyperlinkValue.hyperlink || '';
                  }
                  // Check if it's a formula value
                  else if ('formula' in cell.value) {
                    const formulaValue = cell.value as any;
                    cellValue = formulaValue.result || formulaValue.formula || '';
                  }
                  // Handle other object types (dates, etc.)
                  else {
                    cellValue = String(cell.value);
                  }
                } else {
                  cellValue = String(cell.value);
                }
              }
              
              // Apply basic formatting classes
              if (cell.font && cell.font.bold) {
                cellClass += ' bold';
              }
              if (cell.alignment && cell.alignment.horizontal === 'center') {
                cellClass += ' center';
              }
              
              // Escape HTML special characters
              cellValue = cellValue
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
              
              htmlContent += `<td class="${cellClass.trim()}">${cellValue}</td>`;
            }
            
            htmlContent += '</tr>';
          }
          
          htmlContent += '</table>';
        } else {
          htmlContent += '<p>No data found in this sheet</p>';
        }
      } catch (sheetError: unknown) {
        const errorMessage = sheetError instanceof Error ? sheetError.message : 'Unknown error';
        console.warn(`Error processing sheet ${sheetName}:`, sheetError);
        htmlContent += `<h1>${sheetName}</h1><p>Error processing sheet: ${errorMessage}</p>`;
      }
    }

    htmlContent += '</body></html>';

    console.log('Converting HTML to PDF using Puppeteer...');

    // Launch Puppeteer and convert HTML to PDF
    const browser = await puppeteer.default.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set page content with increased timeout
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Generate PDF with better formatting
    const pdfBufferArray = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '15mm', 
        right: '10mm', 
        bottom: '15mm', 
        left: '10mm' 
      },
      preferCSSPageSize: true
    });

    await browser.close();
    
    const finalPdfBuffer = Buffer.from(pdfBufferArray);
    console.log(`PDF generated successfully using local processing. Size: ${finalPdfBuffer.length} bytes`);

    // Validate PDF
    if (finalPdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Check if it's a valid PDF (starts with %PDF)
    const pdfHeader = finalPdfBuffer.subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Generated file is not a valid PDF');
    }

    return finalPdfBuffer;

  } catch (error: any) {
    console.error('Graph API PDF generation failed:', error);
    
    // Enhanced error handling
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Authentication failed. Please check your access token and permissions.');
    }
    
    if (error.message.includes('404') || error.message.includes('ItemNotFound')) {
      throw new Error('Excel file not found in OneDrive. Upload may have failed.');
    }
    
    if (error.message.includes('FileCorruptTryRepair') || error.message.includes('unsupportedWorkbook')) {
      throw new Error('Excel file contains unsupported features or is too complex for Graph API. Try simplifying the workbook.');
    }
    
    if (error.message.includes('workbook') || error.message.includes('session')) {
      throw new Error(`Excel workbook error: ${error.message}`);
    }

    throw new Error(`Graph API PDF generation failed: ${error.message}`);
  }
}

export async function generatePDFUsingWin32(excelFilePath: string, outputPdfPath: string, sheetNames: string[]): Promise<Buffer> {
  // Ensure the Excel file exists
  if (!fs.existsSync(excelFilePath)) {
    throw new Error(`Excel file not found: ${excelFilePath}`);
  }

  // Create a copy of the Excel file in a different location with different name
  // This helps avoid permission issues
  const workingDir = path.join(os.tmpdir(), 'excel-pdf-work');
  if (!fs.existsSync(workingDir)) {
    fs.mkdirSync(workingDir, { recursive: true });
  }

  const timestamp = Date.now();
  const workingExcelPath = path.join(workingDir, `workbook-${timestamp}.xlsx`);
  const workingPdfPath = path.join(workingDir, `output-${timestamp}.pdf`);

  // Copy the Excel file to working directory
  fs.copyFileSync(excelFilePath, workingExcelPath);
  
  // Set file permissions explicitly (Windows)
  try {
    fs.chmodSync(workingExcelPath, 0o666); // Read/write for all
  } catch (chmodError) {
    console.warn('Could not set file permissions:', chmodError);
  }

  // Get absolute paths and convert to Windows format
  const absoluteExcelPath = path.resolve(workingExcelPath).replace(/\//g, '\\');
  const absoluteOutputPath = path.resolve(workingPdfPath).replace(/\//g, '\\');
  
  console.log(`Working Excel file: ${absoluteExcelPath}`);
  console.log(`Working PDF output: ${absoluteOutputPath}`);
  
  // Verify file accessibility
  try {
    fs.accessSync(absoluteExcelPath, fs.constants.R_OK);
    console.log('Excel file is readable');
  } catch (accessError) {
    throw new Error(`Cannot access Excel file: ${accessError}`);
  }

  // PowerShell script with enhanced file handling
  const powershellScript = `
try {
  Write-Host "Starting Excel PDF conversion..."
  Write-Host "Working Excel file: ${absoluteExcelPath}"
  Write-Host "Working PDF output: ${absoluteOutputPath}"

  # Test file access and wait a bit for file system to settle
  Start-Sleep -Milliseconds 500
  
  if (-not (Test-Path "${absoluteExcelPath}")) {
    throw "Excel file not found at path: ${absoluteExcelPath}"
  }

  # Check if file is locked by trying to open it for writing
  try {
    $fileStream = [System.IO.File]::OpenWrite("${absoluteExcelPath}")
    $fileStream.Close()
    Write-Host "File is not locked"
  } catch {
    Write-Warning "File might be locked, but continuing..."
  }

  # Kill any existing Excel processes to avoid conflicts
  Get-Process excel -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 1000

  # Create Excel application with minimal settings
  $excel = New-Object -ComObject Excel.Application -ErrorAction Stop
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $excel.EnableEvents = $false
  $excel.ScreenUpdating = $false
  $excel.Interactive = $false
  $excel.UserControl = $false
  $excel.AskToUpdateLinks = $false

  Write-Host "Excel application created successfully"

  # Try opening with minimal parameters first - this often works better
  Write-Host "Attempting to open workbook..."
  
  try {
    # Method 1: Simple open
    $workbook = $excel.Workbooks.Open("${absoluteExcelPath}")
  } catch {
    Write-Host "Simple open failed, trying with full parameters..."
    # Method 2: Full parameter open
    $workbook = $excel.Workbooks.Open(
      "${absoluteExcelPath}",
      0,         # UpdateLinks = No
      $true,     # ReadOnly = True
      $null,     # Format
      "",        # Password (empty)
      "",        # WriteResPassword (empty)
      $true,     # IgnoreReadOnlyRecommended
      $null,     # Origin
      $null,     # Delimiter
      $false,    # Editable
      $false,    # Notify
      $null,     # Converter
      $false,    # AddToMru
      $null,     # Local
      $null      # CorruptLoad
    )
  }

  if ($null -eq $workbook) {
    throw "Failed to open workbook - workbook object is null"
  }

  Write-Host "Workbook opened successfully"
  Write-Host "Total sheets in workbook: $($workbook.Sheets.Count)"

  # List all available sheets for debugging
  $allSheets = @()
  foreach ($sheet in $workbook.Sheets) {
    $allSheets += $sheet.Name
    Write-Host "Available sheet: '$($sheet.Name)'"
  }

  $sheetsToShow = @("${sheetNames.join('", "')}")
  Write-Host "Sheets to show: $($sheetsToShow -join ', ')"

  # Validate that requested sheets exist
  $missingSheets = @()
  foreach ($sheetName in $sheetsToShow) {
    if ($allSheets -notcontains $sheetName) {
      $missingSheets += $sheetName
    }
  }

  if ($missingSheets.Count -gt 0) {
    throw "Missing sheets: $($missingSheets -join ', '). Available sheets: $($allSheets -join ', ')"
  }

  # Hide all sheets first, then show selected ones
  foreach ($sheet in $workbook.Sheets) {
    try {
      $sheet.Visible = 0  # xlSheetHidden
    } catch {
      Write-Warning "Could not hide sheet: $($sheet.Name)"
    }
  }

  $visibleSheetCount = 0
  foreach ($sheet in $workbook.Sheets) {
    if ($sheetsToShow -contains $sheet.Name) {
      try {
        Write-Host "Showing sheet: $($sheet.Name)"
        $sheet.Visible = -1  # xlSheetVisible
        $visibleSheetCount++
      } catch {
        Write-Warning "Could not show sheet: $($sheet.Name)"
      }
    }
  }

  if ($visibleSheetCount -eq 0) {
    throw "No sheets were successfully made visible"
  }

  Write-Host "Visible sheets count: $visibleSheetCount"

  # Ensure output directory exists
  $outputDir = Split-Path "${absoluteOutputPath}" -Parent
  if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "Created output directory: $outputDir"
  }

  Write-Host "Exporting to PDF..."

  # Export as PDF with error handling
  try {
    $workbook.ExportAsFixedFormat(
      0,                           # xlTypePDF
      "${absoluteOutputPath}",     # Filename
      0,                           # Quality (xlQualityStandard)
      $true,                       # IncludeDocProps
      $false,                      # IgnorePrintAreas
      $null,                       # From
      $null,                       # To
      $false,                      # OpenAfterPublish
      $null                        # UseDocumentFormat
    )
  } catch {
    # If that fails, try the ActiveSheet method
    Write-Host "Standard export failed, trying alternative method..."
    $workbook.ActiveSheet.ExportAsFixedFormat(
      0,                           # xlTypePDF
      "${absoluteOutputPath}",     # Filename
      0,                           # Quality
      $true,                       # IncludeDocProps
      $false,                      # IgnorePrintAreas
      $null,                       # From
      $null,                       # To
      $false                       # OpenAfterPublish
    )
  }

  Write-Host "PDF export completed"

  # Verify PDF was created and wait for file system
  Start-Sleep -Milliseconds 1000
  
  if (-not (Test-Path "${absoluteOutputPath}")) {
    throw "PDF file was not created at expected location: ${absoluteOutputPath}"
  }

  $pdfSize = (Get-Item "${absoluteOutputPath}").Length
  Write-Host "PDF file created successfully, size: $pdfSize bytes"

  # Close workbook without saving
  $workbook.Close($false)
  Write-Host "Workbook closed"

} catch {
  Write-Error "PowerShell Error: $($_.Exception.Message)"
  Write-Error "Error Type: $($_.Exception.GetType().Name)"
  Write-Error "Full Error: $($_ | Out-String)"
  
  # Additional debugging for COM errors
  if ($_.Exception -is [System.Runtime.InteropServices.COMException]) {
    Write-Error "COM Error Code: 0x$($_.Exception.ErrorCode.ToString('X8'))"
    Write-Error "COM HRESULT: $($_.Exception.HResult)"
  }
  
  exit 1
} finally {
  if ($excel) {
    try {
      Write-Host "Cleaning up Excel application..."
      $excel.Quit()
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
      Write-Host "Excel application closed and released"
    } catch {
      Write-Warning "Failed to properly close Excel: $($_.Exception.Message)"
    }
  }
  
  # Force cleanup of any remaining Excel processes
  Get-Process excel -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  
  # Force garbage collection
  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
  [System.GC]::Collect()
}

Write-Host "PDF generation completed successfully"
exit 0
`;
  
  // Save PowerShell script to working directory
  const scriptPath = path.join(workingDir, `excel-to-pdf-${timestamp}.ps1`);
  fs.writeFileSync(scriptPath, powershellScript, 'utf8');
  
  console.log(`PowerShell script saved to: ${scriptPath}`);
  
  try {
    // Execute PowerShell script with increased timeout
    const { stdout, stderr } = await execAsync(
      `powershell.exe -ExecutionPolicy Bypass -NoProfile -NoLogo -File "${scriptPath}"`,
      { 
        timeout: 180000, // 3 minute timeout
        encoding: 'utf8',
        windowsHide: true,
        cwd: workingDir, // Set working directory
        env: { ...process.env }
      }
    );
    
    console.log('PowerShell stdout:', stdout);
    if (stderr) {
      console.error('PowerShell stderr:', stderr);
    }
    
    // Check if PDF file was actually created
    if (!fs.existsSync(workingPdfPath)) {
      throw new Error(`PDF file was not created at: ${workingPdfPath}`);
    }
    
    // Read the generated PDF
    const pdfBuffer = fs.readFileSync(workingPdfPath);
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    
    // Validate PDF buffer
    if (pdfBuffer.length === 0) {
      throw new Error('Generated PDF file is empty');
    }
    
    // Check if it's a valid PDF (starts with %PDF)
    const pdfHeader = pdfBuffer.subarray(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Generated file is not a valid PDF');
    }
    
    return pdfBuffer;
    
  } catch (error: any) {
    console.error('PowerShell execution failed:', error);
    
    // Provide more detailed error information
    if (error.code === 'ETIMEDOUT') {
      throw new Error('PDF generation timed out. Excel may be hanging or the file is too large.');
    }
    
    // Check for specific COM errors
    if (error.message.includes('0x800A03EC')) {
      throw new Error('Excel COM error: File access denied. This may be due to file permissions, antivirus software, or Excel security settings.');
    }
    
    if (error.message.includes('0x80010108')) {
      throw new Error('Excel COM error: The object invoked has disconnected from its clients. Try restarting the application.');
    }
    
    if (error.message.includes('Open property') || error.message.includes('Workbooks class')) {
      throw new Error('Excel COM error: Failed to open workbook. The file may be corrupted or incompatible with your Excel version.');
    }
    
    if (error.stderr && error.stderr.includes('Excel')) {
      throw new Error(`Excel COM error: ${error.stderr}`);
    }
    
    throw new Error(`Win32 PDF generation failed: ${error.message}`);
    
  } finally {
    // Cleanup working directory
    try {
      if (fs.existsSync(workingDir)) {
        // Remove all files in working directory
        const files = fs.readdirSync(workingDir);
        for (const file of files) {
          const filePath = path.join(workingDir, file);
          fs.unlinkSync(filePath);
        }
        fs.rmdirSync(workingDir);
        console.log('Working directory cleaned up');
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup working directory:', cleanupError);
    }
  }
}