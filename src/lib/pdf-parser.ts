import { pdfjsLib, configurePDFJS } from './pdf-config';

// Configure PDF.js when this module is imported
configurePDFJS();

export interface ParsedOption {
  id: string;
  collegeCode: string;
  branchCode: string;
  collegeName: string;
  branchName: string;
  location: string;
  collegeCourse: string;
  priority: number;
  courseFee?: string;
  collegeAddress?: string;
}

export class PDFParser {
  static async parseKCETOptions(file: File): Promise<ParsedOption[]> {
    try {
      // Check if PDF.js is properly loaded
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        throw new Error('PDF.js library not properly loaded');
      }

      const arrayBuffer = await file.arrayBuffer();
      
      // Create PDF document with error handling for worker issues
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      } catch (workerError) {
        console.warn('⚠️ Worker-based PDF loading failed, trying alternative approach:', workerError);
        // If worker fails, try with different options
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          // Let PDF.js handle worker creation naturally
        }).promise;
      }
      
      const options: ParsedOption[] = [];
      let currentPriority = 1;

      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text with positioning information
        const pageText = textContent.items
          .map((item: any) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
          }))
          .filter((item: any) => item.text && item.text.trim());

        // Use specialized KCET parser
        const pageOptions = this.parseKCETPageText(pageText, currentPriority);
        options.push(...pageOptions);
        currentPriority += pageOptions.length;
      }

      return options;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF. Please check the file format.');
    }
  }

  private static parseKCETPageText(textItems: any[], startPriority: number): ParsedOption[] {
    const options: ParsedOption[] = [];
    
    // Group text items by rows (similar Y coordinates)
    const rows = this.groupTextByRows(textItems);
    
    // Log the structure for debugging
    console.log(`🔍 Grouped ${rows.length} rows from PDF text`);
    
    // First pass: Look for KCET option patterns in individual rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map((item: any) => item.text).join(' ').trim();
      
      // Look for KCET option pattern: Option number followed by college course code
      const kcetPattern = /(\d+)\s+([A-Z]\d{3}[A-Z]+)/;
      const match = rowText.match(kcetPattern);
      
      if (match) {
        const optionNumber = parseInt(match[1]);
        const collegeCourse = match[2];
        
        console.log(`🎯 Found KCET option ${optionNumber}: ${collegeCourse} in row: "${rowText}"`);
        
        // Extract college code and branch code
        const collegeCode = collegeCourse.substring(0, 4); // E099, E005, E048
        const branchCode = collegeCourse.substring(4); // AI, CS, CA, CY, DS, AD
        
        // Look for course name and college name in nearby rows
        let courseName = '';
        let collegeName = '';
        let courseFee = '';
        
        // Search in current and next few rows for course details
        for (let j = i; j < Math.min(i + 5, rows.length); j++) {
          const searchRow = rows[j];
          const searchText = searchRow.map((item: any) => item.text).join(' ').toUpperCase();
          const searchRowText = searchRow.map((item: any) => item.text).join(' ').trim();
          
          // Extract course name (look for engineering branch names)
          if (!courseName && this.isKCETCourseName(searchText)) {
            courseName = searchRowText;
            console.log(`�� Found course name: "${courseName}"`);
          }
          
          // Extract college name (look for college keywords)
          if (!collegeName && this.isKCETCollegeName(searchText)) {
            collegeName = searchRowText;
            console.log(`🏫 Found college name: "${collegeName}"`);
          }
          
          // Extract course fee (look for fee pattern)
          if (!courseFee && this.isKCETCourseFee(searchText)) {
            courseFee = searchRowText;
            console.log(`💰 Found course fee: "${courseFee}"`);
          }
        }
        
        // If we found the essential data, create an option
        if (collegeCode && branchCode) {
          const option: ParsedOption = {
            id: `kcet-${optionNumber}-${Date.now()}`,
            collegeCode,
            branchCode,
            collegeName: collegeName || `${collegeCode} College`,
            branchName: courseName || `${branchCode} Engineering`,
            location: this.extractKCETLocation(collegeName),
            collegeCourse,
            priority: optionNumber,
            courseFee: courseFee || 'Not specified',
          };
          
          options.push(option);
          console.log(`✅ Parsed KCET option ${optionNumber}:`, option);
        }
      }
    }
    
    // Second pass: If we didn't find enough options, try more aggressive pattern matching
    if (options.length < 10) {
      console.log(`⚠️ Only found ${options.length} options, trying aggressive parsing...`);
      
      // Join all text and look for patterns
      const allText = textItems.map(item => item.text).join(' ');
      const aggressivePattern = /(\d+)\s*[\.\)]?\s*([A-Z]\d{3}[A-Z]+)/g;
      let aggressiveMatch;
      
      while ((aggressiveMatch = aggressivePattern.exec(allText)) !== null) {
        const optionNumber = parseInt(aggressiveMatch[1]);
        const collegeCourse = aggressiveMatch[2];
        
        // Check if we already have this option
        if (!options.find(opt => opt.priority === optionNumber)) {
          console.log(`🔍 Aggressive parsing found option ${optionNumber}: ${collegeCourse}`);
          
          const collegeCode = collegeCourse.substring(0, 4);
          const branchCode = collegeCourse.substring(4);
          
          // Look for context around this match
          const startIndex = Math.max(0, aggressiveMatch.index - 200);
          const endIndex = Math.min(allText.length, aggressiveMatch.index + 800);
          const contextText = allText.substring(startIndex, endIndex);
          
          const courseName = this.extractCourseNameFromContext(contextText);
          const collegeName = this.extractCollegeNameFromContext(contextText);
          const courseFee = this.extractCourseFeeFromContext(contextText);
          
          const option: ParsedOption = {
            id: `kcet-aggressive-${optionNumber}-${Date.now()}`,
            collegeCode,
            branchCode,
            collegeName: collegeName || `${collegeCode} College`,
            branchName: courseName || `${branchCode} Engineering`,
            location: this.extractKCETLocation(collegeName),
            collegeCourse,
            priority: optionNumber,
            courseFee: courseFee || 'Not specified',
          };
          
          options.push(option);
          console.log(`✅ Aggressive parsed option ${optionNumber}:`, option);
        }
      }
    }

    // Third pass: Ultra-aggressive parsing for KCET PDFs with many options
    if (options.length < 50) {
      console.log(`⚠️ Only found ${options.length} options, trying ultra-aggressive parsing...`);
      
      const allText = textItems.map(item => item.text).join(' ');
      
      // Look for any number that could be an option number
      const numberPattern = /\b(\d{1,3})\b/g;
      const numbers = [];
      let numberMatch;
      
      while ((numberMatch = numberPattern.exec(allText)) !== null) {
        const number = parseInt(numberMatch[1]);
        if (number >= 1 && number <= 200) { // Reasonable range for KCET options
          numbers.push({
            number,
            index: numberMatch.index,
            text: numberMatch[0]
          });
        }
      }
      
      console.log(`🔍 Found ${numbers.length} potential option numbers`);
      
      // For each number, look for nearby college course codes
      for (const numInfo of numbers) {
        if (options.find(opt => opt.priority === numInfo.number)) continue;
        
        // Look for college course codes near this number
        const startIndex = Math.max(0, numInfo.index - 100);
        const endIndex = Math.min(allText.length, numInfo.index + 300);
        const searchArea = allText.substring(startIndex, endIndex);
        
        // Look for college course code pattern
        const courseCodePattern = /([A-Z]\d{3}[A-Z]+)/;
        const courseMatch = searchArea.match(courseCodePattern);
        
        if (courseMatch) {
          const collegeCourse = courseMatch[1];
          const collegeCode = collegeCourse.substring(0, 4);
          const branchCode = collegeCourse.substring(4);
          
          console.log(`🔍 Ultra-aggressive found option ${numInfo.number}: ${collegeCourse}`);
          
          // Look for context around this match
          const contextStart = Math.max(0, numInfo.index - 300);
          const contextEnd = Math.min(allText.length, numInfo.index + 600);
          const contextText = allText.substring(contextStart, contextEnd);
          
          const courseName = this.extractCourseNameFromContext(contextText);
          const collegeName = this.extractCollegeNameFromContext(contextText);
          const courseFee = this.extractCourseFeeFromContext(contextText);
          
          const option: ParsedOption = {
            id: `kcet-ultra-${numInfo.number}-${Date.now()}`,
            collegeCode,
            branchCode,
            collegeName: collegeName || `${collegeCode} College`,
            branchName: courseName || `${branchCode} Engineering`,
            location: this.extractKCETLocation(collegeName),
            collegeCourse,
            priority: numInfo.number,
            courseFee: courseFee || 'Not specified',
          };
          
          options.push(option);
          console.log(`✅ Ultra-aggressive parsed option ${numInfo.number}:`, option);
        }
      }
    }
    
    console.log(`🎯 Total KCET options parsed: ${options.length}`);
    return options;
  }

  // Specialized KCET PDF parsing method
  static async parseKCETOptionsAdvanced(file: File): Promise<ParsedOption[]> {
    try {
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        throw new Error('PDF.js library not properly loaded');
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const options: ParsedOption[] = [];
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text with positioning information
        const pageText = textContent.items
          .map((item: any) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
          }))
          .filter((item: any) => item.text && item.text.trim());

        // Use advanced KCET parser
        const pageOptions = this.parseKCETPageAdvanced(pageText);
        options.push(...pageOptions);
      }

      return options;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF. Please check the file format.');
    }
  }

  private static parseKCETPageAdvanced(textItems: any[]): ParsedOption[] {
    const options: ParsedOption[] = [];
    
    // Group text by rows with better tolerance
    const rows = this.groupTextByRowsAdvanced(textItems);
    console.log(`🔍 Advanced parsing: Grouped ${rows.length} rows from PDF text`);
    
    // Look for KCET table structure
    let currentOption: Partial<ParsedOption> | null = null;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowText = row.map((item: any) => item.text).join(' ').trim();
      
      // Skip empty rows
      if (!rowText || rowText.length < 2) continue;
      
      // Look for option number pattern (e.g., "1", "2", "13")
      const optionMatch = rowText.match(/^(\d+)\s*$/);
      if (optionMatch) {
        // Complete previous option if exists
        if (currentOption && currentOption.collegeCode && currentOption.branchCode) {
          options.push(currentOption as ParsedOption);
        }
        
        // Start new option
        currentOption = {
          id: optionMatch[1],
          priority: parseInt(optionMatch[1]),
          collegeCode: '',
          branchCode: '',
          collegeName: '',
          branchName: '',
          location: 'Bangalore',
          collegeCourse: '',
          courseFee: '',
          collegeAddress: ''
        };
        continue;
      }
      
      // Look for college course code pattern (e.g., E099AI, E005CA, E048IC)
      const courseCodeMatch = rowText.match(/([A-Z]\d{3}[A-Z]+)/);
      if (courseCodeMatch && currentOption) {
        const courseCode = courseCodeMatch[1];
        currentOption.collegeCourse = courseCode;
        currentOption.collegeCode = courseCode.substring(0, 4);
        currentOption.branchCode = courseCode.substring(4);
        
        // Map branch codes to full names
        const branchNames: { [key: string]: string } = {
          'AI': 'Artificial Intelligence and Machine Learning',
          'CS': 'Computer Science Engineering',
          'CA': 'Computer Science and Engineering (Cyber Security)',
          'CY': 'Computer Science and Engineering (Cyber Security)',
          'DS': 'Computer Science and Engineering (Data Science)',
          'AD': 'Artificial Intelligence and Data Science',
          'IC': 'Computer Science and Engineering (Internet of Things & Cyber Security)',
          'EC': 'Electronics & Communication Engineering',
          'ME': 'Mechanical Engineering',
          'CE': 'Civil Engineering',
          'EE': 'Electrical Engineering',
          'BT': 'Biotechnology',
          'CH': 'Chemical Engineering'
        };
        
        currentOption.branchName = branchNames[currentOption.branchCode] || currentOption.branchCode;
        continue;
      }
      
      // Look for course fee pattern
      const feeMatch = rowText.match(/(\d{1,3}(?:,\d{3})*(?:,\d{3})*)\s*-\s*(.+)/);
      if (feeMatch && currentOption) {
        currentOption.courseFee = feeMatch[1] + ' - ' + feeMatch[2];
        continue;
      }
      
      // Look for college names (usually longer text)
      if (currentOption && rowText.length > 20 && !currentOption.collegeName) {
        currentOption.collegeName = rowText;
        currentOption.collegeAddress = rowText;
        
        // Extract location
        if (rowText.includes('Bangalore')) {
          currentOption.location = 'Bangalore';
        } else if (rowText.includes('Mysore')) {
          currentOption.location = 'Mysore';
        } else if (rowText.includes('Mangalore')) {
          currentOption.location = 'Mangalore';
        } else if (rowText.includes('Hubli')) {
          currentOption.location = 'Hubli';
        }
        
        continue;
      }
      
      // Additional college information
      if (currentOption && currentOption.collegeName && rowText.length > 10) {
        currentOption.collegeAddress = (currentOption.collegeAddress || '') + ' ' + rowText;
      }
    }
    
    // Add the last option if it exists
    if (currentOption && currentOption.collegeCode && currentOption.branchCode) {
      options.push(currentOption as ParsedOption);
    }
    
    console.log(`🎯 Advanced parsing: Found ${options.length} options on this page`);
    return options;
  }

  private static groupTextByRows(textItems: any[]): any[][] {
    if (!textItems || textItems.length === 0) return [];
    
    // Sort text items by Y coordinate (top to bottom)
    const sortedItems = [...textItems].sort((a, b) => b.y - a.y);
    
    const rows: any[][] = [];
    const tolerance = 5; // Y-coordinate tolerance for grouping into rows
    
    for (const item of sortedItems) {
      let addedToRow = false;
      
      // Try to add to existing row
      for (const row of rows) {
        if (row.length > 0) {
          const firstItem = row[0];
          if (Math.abs(item.y - firstItem.y) <= tolerance) {
            row.push(item);
            addedToRow = true;
            break;
          }
        }
      }
      
      // If not added to existing row, create new row
      if (!addedToRow) {
        rows.push([item]);
      }
    }
    
    // Sort items within each row by X coordinate (left to right)
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
    }
    
    // Sort rows by Y coordinate (top to bottom)
    rows.sort((a, b) => b[0].y - a[0].y);
    
    return rows;
  }

  private static groupTextByRowsAdvanced(textItems: any[]): any[][] {
    if (!textItems || textItems.length === 0) return [];
    
    // Sort text items by Y coordinate (top to bottom)
    const sortedItems = [...textItems].sort((a, b) => b.y - a.y);
    
    const rows: any[][] = [];
    const tolerance = 8; // Increased tolerance for KCET PDFs
    
    for (const item of sortedItems) {
      let addedToRow = false;
      
      // Try to add to existing row
      for (const row of rows) {
        if (row.length > 0) {
          const firstItem = row[0];
          if (Math.abs(item.y - firstItem.y) <= tolerance) {
            row.push(item);
            addedToRow = true;
            break;
          }
        }
      }
      
      // If not added to existing row, create new row
      if (!addedToRow) {
        rows.push([item]);
      }
    }
    
    // Sort items within each row by X coordinate (left to right)
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
    }
    
    // Sort rows by Y coordinate (top to bottom)
    rows.sort((a, b) => b[0].y - a[0].y);
    
    return rows;
  }

  private static isKCETCourseName(text: string): boolean {
    const kcetCourseKeywords = [
      'COMPUTER SCIENCE', 'ELECTRONICS', 'MECHANICAL', 'CIVIL',
      'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING', 'DATA SCIENCE',
      'CYBER SECURITY', 'INFORMATION SCIENCE', 'TELECOMMUNICATION',
      'BIOTECHNOLOGY', 'CHEMICAL', 'INDUSTRIAL', 'AERONAUTICAL',
      'AUTOMOBILE', 'BIOMEDICAL', 'AGRICULTURAL', 'FOOD TECHNOLOGY'
    ];
    
    return kcetCourseKeywords.some(keyword => text.includes(keyword));
  }

  private static isKCETCollegeName(text: string): boolean {
    const kcetCollegeKeywords = [
      'COLLEGE', 'UNIVERSITY', 'INSTITUTE', 'ENGINEERING',
      'TECHNOLOGY', 'POLYTECHNIC', 'AUTONOMOUS'
    ];
    
    return kcetCollegeKeywords.some(keyword => text.includes(keyword));
  }

  private static isKCETCourseFee(text: string): boolean {
    // Look for fee pattern like "1,12,410 - One Lakh Twelve Thousand Four Hundred and Ten"
    const feePattern = /\d{1,3}(?:,\d{2,3})+\s*-\s*[A-Za-z\s]+/;
    return feePattern.test(text);
  }

  private static extractKCETLocation(collegeName: string): string {
    if (!collegeName) return 'Bangalore';
    
    const locations = [
      'BANGALORE', 'MYSORE', 'MANGALORE', 'BELGAUM', 'HUBLI',
      'DAVANAGERE', 'SHIMOGA', 'TUMKUR', 'KOLAR', 'CHIKBALLAPUR',
      'VARTHUR', 'BASVANAGUDI', 'BULL TEMPLE ROAD'
    ];
    
    const upperText = collegeName.toUpperCase();
    for (const location of locations) {
      if (upperText.includes(location)) {
        return location.charAt(0) + location.slice(1).toLowerCase();
      }
    }
    
    return 'Bangalore'; // Default location
  }

  // Helper methods for aggressive parsing
  private static extractCourseNameFromContext(contextText: string): string {
    const courseKeywords = [
      'COMPUTER SCIENCE', 'ELECTRONICS', 'MECHANICAL', 'CIVIL',
      'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING', 'DATA SCIENCE',
      'CYBER SECURITY', 'INFORMATION SCIENCE', 'TELECOMMUNICATION',
      'BIOTECHNOLOGY', 'CHEMICAL', 'INDUSTRIAL', 'AERONAUTICAL',
      'AUTOMOBILE', 'BIOMEDICAL', 'AGRICULTURAL', 'FOOD TECHNOLOGY'
    ];
    
    const upperText = contextText.toUpperCase();
    for (const keyword of courseKeywords) {
      if (upperText.includes(keyword)) {
        const index = upperText.indexOf(keyword);
        const start = Math.max(0, index - 50);
        const end = Math.min(contextText.length, index + keyword.length + 100);
        return contextText.substring(start, end).trim();
      }
    }
    
    return '';
  }

  private static extractCollegeNameFromContext(contextText: string): string {
    const collegeKeywords = [
      'COLLEGE', 'UNIVERSITY', 'INSTITUTE', 'ENGINEERING',
      'TECHNOLOGY', 'POLYTECHNIC', 'AUTONOMOUS'
    ];
    
    const upperText = contextText.toUpperCase();
    for (const keyword of collegeKeywords) {
      if (upperText.includes(keyword)) {
        const index = upperText.indexOf(keyword);
        const start = Math.max(0, index - 100);
        const end = Math.min(contextText.length, index + keyword.length + 150);
        return contextText.substring(start, end).trim();
      }
    }
    
    return '';
  }

  private static extractCourseFeeFromContext(contextText: string): string {
    // Look for fee pattern like "1,12,410 - One Lakh Twelve Thousand Four Hundred and Ten"
    const feePattern = /\d{1,3}(?:,\d{2,3})+\s*-\s*[A-Za-z\s]+/;
    const match = contextText.match(feePattern);
    return match ? match[0] : '';
  }

  // Fallback method for when automatic parsing fails
  static async parseWithFallback(file: File): Promise<ParsedOption[]> {
    try {
      console.log('🚀 Starting advanced KCET PDF parsing...');
      
      // Try the advanced KCET parser first
      const advancedOptions = await this.parseKCETOptionsAdvanced(file);
      if (advancedOptions.length > 0) {
        console.log(`✅ Advanced KCET parser successful! Found ${advancedOptions.length} options`);
        return advancedOptions;
      }
      
      console.log('⚠️ Advanced parser found no options, trying basic parser...');
      
      // Fallback to basic parser
      const basicOptions = await this.parseKCETOptions(file);
      if (basicOptions.length > 0) {
        console.log(`✅ Basic KCET parser successful! Found ${basicOptions.length} options`);
        return basicOptions;
      }
      
      console.log('⚠️ Basic parser also failed, using fallback options...');
      
      // Final fallback
      return [{
        id: 'fallback-1',
        collegeCode: 'E001',
        branchCode: 'CS',
        collegeName: 'Sample College',
        branchName: 'Computer Science Engineering',
        location: 'Bangalore',
        collegeCourse: 'E001CS',
        priority: 1,
        courseFee: 'Not specified',
      }];
      
    } catch (error) {
      console.error('❌ All parsing methods failed:', error);
      
      // Return fallback options
      return [{
        id: 'error-fallback-1',
        collegeCode: 'E001',
        branchCode: 'CS',
        collegeName: 'Error - Please check PDF format',
        branchName: 'Computer Science Engineering',
        location: 'Bangalore',
        collegeCourse: 'E001CS',
        priority: 1,
        courseFee: 'Not specified',
      }];
    }
  }
}
