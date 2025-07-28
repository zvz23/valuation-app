import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

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