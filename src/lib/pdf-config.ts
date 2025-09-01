import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF.js Configuration
 * 
 * This file exports the configured pdfjsLib for use in other files.
 * Configuration is done locally when needed to avoid global conflicts.
 */

// Configure PDF.js to use main thread (disable workers)
export function configurePDFJS() {
  try {
    console.log('📄 Configuring PDF.js...');
    console.log('📄 PDF.js version:', pdfjsLib.version);
    
    if (pdfjsLib.GlobalWorkerOptions) {
      console.log('📄 GlobalWorkerOptions available:', pdfjsLib.GlobalWorkerOptions);
      console.log('📄 Current workerSrc:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      // Set workerSrc to a valid but non-functional path to force main thread usage
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'data:application/javascript,';
      console.log('📄 PDF.js configured to use main thread');
    } else {
      console.log('📄 GlobalWorkerOptions not available');
    }
  } catch (error) {
    console.warn('⚠️ Could not configure PDF.js:', error);
  }
}

// Export configured pdfjsLib for use in other files
export { pdfjsLib };
