import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RankInput from "@/components/RankInput";
import OptionEntryTable from "@/components/OptionEntryTable";
import CollegeList from "@/components/CollegeList";
import Instructions from "@/components/Instructions";
import Analytics from "@/components/Analytics";
import UploadedReferences from "@/components/UploadedReferences";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import OfficialResourcesBanner from "@/components/OfficialResourcesBanner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import CutoffExplorer from "@/components/CutoffExplorer";
import { pdfjsLib, configurePDFJS } from "@/lib/pdf-config";
import { PDFParser } from "@/lib/pdf-parser";

// Configure PDF.js worker to use main thread (more reliable for KCET PDFs)
configurePDFJS();

// Re-export the Preference type for backward compatibility
export type { Preference } from "@/types";

const Planner = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userCategory, setUserCategory] = useState<string>('GM');
  const [selectedOptions, setSelectedOptions] = useState<Array<{
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
  }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock allotment state
  const [showMockAllotmentPopup, setShowMockAllotmentPopup] = useState(false);

  // --- Mock Allotment State ---
  const [cutoffs, setCutoffs] = useState<Array<{
    year: string;
    round: string;
    institute_code: string;
    course: string;
    category: string;
    cutoff_rank: number;
    college_name: string;
    branch_name: string;
    total_seats: number;
    available_seats: number;
  }>>([]);
  const [allotmentResult, setAllotmentResult] = useState<{
    best?: {
      option: any;
      cutoff?: any;
      status: string;
      probability: number;
      matchType: string;
    };
    all?: any[];
    warning?: string;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showAllotmentModal, setShowAllotmentModal] = useState(false);
  // --- New: Year and Round selection ---
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableRounds, setAvailableRounds] = useState<string[]>([]);

  const isMobile = useIsMobile();

  const handleRankSubmit = (rank: number, category: string) => {
    setUserRank(rank);
    setUserCategory(category);
    setCurrentStep(2);
  };

  // Fetch consolidated cutoffs data on mount
  useEffect(() => {
    const loadCutoffs = async () => {
      try {
        // Try the consolidated file first
        const res = await fetch("/data/kcet_cutoffs_consolidated.json");
        const response = await res.json();
        console.log('Data loaded successfully:', response);
        
        // Check if data is nested under "data" property
        const dataArray = response.data || response.cutoffs || response;
        
        if (!Array.isArray(dataArray)) {
          console.error('Expected array but got:', typeof dataArray, dataArray);
          // Try fallback to cutoffs.json
          throw new Error('Data structure not as expected, trying fallback');
        }
        
        // Transform the data to match our expected format
        const transformedData = dataArray.map((item: any) => ({
          year: item.year || item.Year || "2024",
          round: item.round || item.Round || "Round 1",
          institute_code: item.institute_code || item.college_code || item.instituteCode || "",
          course: item.course || item.branch_code || item.Course || "",
          category: item.category || item.Category || "GM",
          cutoff_rank: parseInt(item.cutoff_rank || item.cutoffRank || "0") || 0,
          college_name: item.college_name || item.collegeName || "",
          branch_name: item.branch_name || item.branchName || "",
          total_seats: parseInt(item.total_seats || item.totalSeats || "0") || 0,
          available_seats: parseInt(item.available_seats || item.availableSeats || "0") || 0,
        }));
        
        console.log('Transformed data sample:', transformedData.slice(0, 3));
        setCutoffs(transformedData);
        
      } catch (error) {
        console.error('Failed to load consolidated cutoffs:', error);
        
        // Try fallback to cutoffs.json
        try {
          const fallbackRes = await fetch("/data/cutoffs.json");
          const fallbackData = await fallbackRes.json();
          console.log('Fallback data loaded:', fallbackData);
          
          const fallbackArray = fallbackData.data || fallbackData.cutoffs || fallbackData;
          
          if (Array.isArray(fallbackArray)) {
            const transformedFallback = fallbackArray.map((item: any) => ({
              year: item.year || item.Year || "2024",
              round: item.round || item.Round || "Round 1",
              institute_code: item.institute_code || item.college_code || item.instituteCode || "",
              course: item.course || item.branch_code || item.Course || "",
              category: item.category || item.Category || "GM",
              cutoff_rank: parseInt(item.cutoff_rank || item.cutoffRank || "0") || 0,
              college_name: item.college_name || item.collegeName || "",
              branch_name: item.branch_name || item.branchName || "",
              total_seats: parseInt(item.total_seats || item.totalSeats || "0") || 0,
              available_seats: parseInt(item.available_seats || item.availableSeats || "0") || 0,
            }));
            
            console.log('Fallback transformed data sample:', transformedFallback.slice(0, 3));
            setCutoffs(transformedFallback);
          } else {
            console.error('Fallback data also not an array');
            setCutoffs([]);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setCutoffs([]);
        }
      }
    };
    
    loadCutoffs();
  }, []);

  // Update available years and rounds when cutoffs or selectedYear changes
  useEffect(() => {
    if (cutoffs.length > 0) {
      const years = Array.from(new Set(cutoffs.map((c: any) => c.year))).sort().reverse();
      setAvailableYears(years);
      // Set default year if not set
      if (!selectedYear && years.length > 0) setSelectedYear(years[0]);
    }
  }, [cutoffs]);

  useEffect(() => {
    if (cutoffs.length > 0 && selectedYear) {
      const rounds = Array.from(new Set(cutoffs.filter((c: any) => c.year === selectedYear).map((c: any) => c.round))).sort().reverse();
      setAvailableRounds(rounds);
      // Set default round if not set or not in availableRounds
      if (!selectedRound || !rounds.includes(selectedRound)) setSelectedRound(rounds[0] || "");
    }
  }, [cutoffs, selectedYear]);

  // --- Mock Allotment Simulator ---
  function simulateAllotment() {
    setSimulating(true);
    setTimeout(() => {
      // Check if there is any data for the selected year/round
      const hasData = cutoffs.some(entry =>
        norm(entry.year) === norm(selectedYear) &&
        norm(entry.round) === norm(selectedRound)
      );
      if (!hasData) {
        setAllotmentResult({ warning: `No cutoff data available for ${selectedYear} ${selectedRound}.` });
        setShowAllotmentModal(true);
        setSimulating(false);
        return;
      }
      const result = simulateBestAllotment(
        userRank,
        userCategory,
        selectedOptions,
        cutoffs,
        selectedRound,
        selectedYear
      );
      setAllotmentResult(result);
      setShowAllotmentModal(true);
      setSimulating(false);
    }, 200); // Simulate processing delay
  }

  // Helper: normalize string for comparison (case/whitespace-insensitive)
  function normStr(s) {
    return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findBestMatch(option: any, year: string, round: string) {
    if (!cutoffs) return null;
             const userCourseName = normStr(option.branchName);
         // 1. Exact match: code, name, category, year, round
         let bestEntry = cutoffs.find((c) =>
           norm(c.institute_code) === norm(option.collegeCode) &&
           norm(c.course) === norm(option.branchCode) &&
           normStr(c.branch_name || "") === userCourseName &&
           norm(c.category) === norm(userCategory) &&
           norm(c.year) === norm(year) &&
           norm(c.round) === norm(round)
         );
    if (bestEntry) return { entry: bestEntry, matchType: "Exact match" };
    // 2. Fuzzy name match: code, similar name, any category, year, round
    let candidates = cutoffs.filter((c) =>
      norm(c.institute_code) === norm(option.collegeCode) &&
      norm(c.course) === norm(option.branchCode) &&
      norm(c.year) === norm(year) &&
      norm(c.round) === norm(round)
    );
    if (candidates.length > 0) {
      // Find closest name match
      let best = null, bestScore = 0;
      for (const c of candidates) {
        const cname = normStr(c.branch_name || "");
        let score = 0;
        if (cname === userCourseName) score = 100;
        else if (cname.includes(userCourseName) || userCourseName.includes(cname)) score = 80;
        else if (cname.split(" ").some(w => userCourseName.includes(w))) score = 60;
        if (score > bestScore) { best = c; bestScore = score; }
      }
      if (best && bestScore >= 80) return { entry: best, matchType: "Course code + close name match" };
      if (best && bestScore >= 60) return { entry: best, matchType: "Course code + partial name match (ambiguous)" };
    }
    // 3. Historical: code+name, category, any year/round
    bestEntry = cutoffs.find((c) =>
      norm(c.institute_code) === norm(option.collegeCode) &&
      norm(c.course) === norm(option.branchCode) &&
      normStr(c.branch_name || "") === userCourseName &&
      norm(c.category) === norm(userCategory)
    );
    if (bestEntry) return { entry: bestEntry, matchType: "Historical (same course/category)" };
    // 4. Historical: code+close name, any category, any year/round
    candidates = cutoffs.filter((c) =>
      norm(c.institute_code) === norm(option.collegeCode) &&
      norm(c.course) === norm(option.branchCode)
    );
    if (candidates.length > 0) {
      let best = null, bestScore = 0;
      for (const c of candidates) {
        const cname = normStr(c.branch_name || "");
        let score = 0;
        if (cname === userCourseName) score = 100;
        else if (cname.includes(userCourseName) || userCourseName.includes(cname)) score = 80;
        else if (cname.split(" ").some(w => userCourseName.includes(w))) score = 60;
        if (score > bestScore) { best = c; bestScore = score; }
      }
      if (best && bestScore >= 80) return { entry: best, matchType: "Historical (close name match)" };
      if (best && bestScore >= 60) return { entry: best, matchType: "Historical (partial name match, ambiguous)" };
    }
    // No valid cutoff for this course in this college
    return null;
  }

  function getChanceStatus(userRank: number, cutoffRank: number) {
    // More realistic probability calculation based on rank difference
    const rankDifference = userRank - cutoffRank;
    const percentageDifference = (rankDifference / cutoffRank) * 100;
    
    if (userRank <= cutoffRank) {
      // Within cutoff range - high chance
      if (rankDifference >= -1000) {
        return { status: "Very High Chance", probability: 95 + Math.random() * 5 };
      } else if (rankDifference >= -5000) {
        return { status: "High Chance", probability: 85 + Math.random() * 10 };
      } else {
        return { status: "High Chance", probability: 80 + Math.random() * 15 };
      }
    } else if (percentageDifference <= 20) {
      // Within 20% of cutoff - moderate chance
      return { status: "Moderate Chance", probability: 60 + Math.random() * 20 };
    } else if (percentageDifference <= 50) {
      // Within 50% of cutoff - low chance
      return { status: "Low Chance", probability: 30 + Math.random() * 30 };
    } else {
      // Beyond 50% of cutoff - very low chance
      return { status: "Very Low Chance", probability: Math.random() * 20 };
    }
  }

  function simulateBestAllotment(userRank: number, userCategory: string, userOptions: any[], cutoffs: any[], round: string, year: string) {
    if (!userRank || !userCategory || !userOptions?.length) return null;
    const results = userOptions.map((option) => {
      const match = findBestMatch(option, year, round);
      if (match && match.entry && typeof match.entry.cutoff_rank === "number") {
        const { status, probability } = getChanceStatus(userRank, match.entry.cutoff_rank);
        return {
          option,
          cutoff: match.entry,
          matchType: match.matchType,
          status,
          probability,
        };
      } else {
        return {
          option,
          cutoff: null,
          matchType: "No data",
          status: "Unknown",
          probability: 0,
        };
      }
    });
    // Sort by user preference (priority), then by status (Very High > High > Moderate > Low > Very Low > Unknown)
    const statusOrder = { "Very High Chance": 1, "High Chance": 2, "Moderate Chance": 3, "Low Chance": 4, "Very Low Chance": 5, "Unknown": 6 };
    results.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.option.priority - b.option.priority;
    });
    // Pick the best possible allotment
    const best = results.find(r => r.status === "Very High Chance") || 
                 results.find(r => r.status === "High Chance") || 
                 results[0];
    return { best, all: results };
  }

  // Helper to normalize codes and strings (move to top for reuse)
  const norm = (s: string) => (s || "").trim().toUpperCase();

  return (
    <>
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Disclaimer Banner */}
        <DisclaimerBanner />

          {/* Mock Allotment Coming Soon Popup */}
          {showMockAllotmentPopup && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-1 sm:p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMockAllotmentPopup(false)} />
              <Card className="relative w-full max-w-full sm:max-w-md mx-auto my-4 sm:my-8 bg-white/95 border-0 shadow-2xl rounded-xl p-3 sm:p-6 text-center z-50">
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="text-4xl sm:text-5xl mb-1 sm:mb-2">🚀</div>
                                     <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Mock Allotment Feature</h2>
                   <p className="text-base sm:text-lg text-muted-foreground mb-2 sm:mb-4">Coming Soon!</p>
                   <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">We're working on a new feature to simulate mock allotments based on your preferences and past cutoff data. Stay tuned!</p>
                   <Button onClick={() => setShowMockAllotmentPopup(false)} className="mt-1 sm:mt-2 px-4 sm:px-6 py-2 rounded-lg font-semibold w-full sm:w-auto">OK</Button>
                </div>
              </Card>
            </div>
          )}

        {/* Official Resources Banner */}
        <OfficialResourcesBanner />

        {/* Enhanced Progress Indicator */}
        <Card className={`p-4 sm:p-6 mb-6 sm:mb-8 ${isMobile ? 'rounded-2xl p-2' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">KCET 2025 Mock Option Entry Planner</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Practice your college preferences before the official counseling</p>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-muted-foreground">Step {currentStep} of 2</div>
              <div className="text-xs text-foreground font-medium">
                {currentStep === 1 && "Enter Your Details"}
                {currentStep === 2 && "Plan Your Options"}
              </div>
            </div>
          </div>
          {/* Only show desktop warning on desktop */}
          {!isMobile && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-3 rounded mb-2 text-sm font-medium">
              This site is optimized for desktop use and provides the best experience on a computer. Mobile support is provided for convenience, but some features may be limited or look different.
            </div>
          )}
        </Card>

        {/* Step 1: Rank Input */}
        {currentStep === 1 && (
          <div className={`w-full max-w-full sm:max-w-2xl mx-auto ${isMobile ? 'px-1' : ''}`}>
            <RankInput onRankSubmit={handleRankSubmit} />
          </div>
        )}

        {/* Step 2: Main Planner Interface */}
        {currentStep === 2 && (
          <div className={`space-y-6 sm:space-y-8 ${isMobile ? 'px-0.5' : ''}`}>
            {/* User Status Bar */}
            <Card className={`p-3 sm:p-4 ${isMobile ? 'rounded-2xl p-2' : ''}`}>
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0`}>
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">KCET Rank:</span>
                    <span className="font-bold text-foreground ml-1 sm:ml-2">{userRank?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-bold text-foreground ml-1 sm:ml-2">{userCategory}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size={isMobile ? "lg" : "sm"}
                  onClick={() => setCurrentStep(1)}
                  className={`w-full sm:w-auto mt-1 sm:mt-0 py-2 sm:py-3 text-base rounded-xl`}
                >
                  Change Details
                </Button>
              </div>
            </Card>

            {/* Tabbed Interface */}
            <Tabs defaultValue="entry" className="space-y-4 sm:space-y-6">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-7'}`} style={isMobile ? {fontSize: 16, padding: 2} : {}}>
                <TabsTrigger 
                  value="entry" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  Option Entry
                </TabsTrigger>
                <TabsTrigger 
                  value="colleges" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  College List
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="resources" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger 
                  value="instructions" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  Instructions
                </TabsTrigger>
                <TabsTrigger 
                  value="worksheet" 
                  className={`w-full py-2 sm:py-3 rounded-xl text-base`}
                >
                  Worksheet
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entry">
                {/* Enhanced PDF Upload UI */}
                <div className="mb-3 sm:mb-4 flex flex-col items-center">
                  <div
                    className={`w-full max-w-full sm:max-w-md border-2 border-dashed border-border rounded-xl p-3 sm:p-6 bg-muted/30 flex flex-col items-center justify-center transition hover:bg-muted/60 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                         onDrop={async e => {
                       e.preventDefault();
                       e.stopPropagation();
                       const file = e.dataTransfer.files?.[0];
                       if (file && file.type === 'application/pdf') {
                         setUploading(true);
                         setUploadError(null);
                         setUploadedFile(file);
                         try {
                           // Add timeout protection for PDF parsing
                           const timeoutPromise = new Promise((_, reject) => 
                             setTimeout(() => reject(new Error('PDF parsing timeout')), 30000)
                           );
                           
                           const parsingPromise = parsePdfToOptions(file);
                           const parsedOptions = await Promise.race([parsingPromise, timeoutPromise]) as Array<{
                             id: string;
                             priority: number;
                             collegeCode: string;
                             branchCode: string;
                             collegeName: string;
                             branchName: string;
                             location: string;
                             collegeCourse: string;
                             courseFee: string;
                             collegeAddress: string;
                           }>;
                           
                           if (parsedOptions && parsedOptions.length > 0) {
                             setSelectedOptions(parsedOptions);
                             console.log('Successfully parsed options:', parsedOptions);
                           } else {
                             setUploadError('No options found in PDF. Please check the format.');
                           }
                         } catch (err) {
                           console.error('PDF parsing error:', err);
                           setUploadError(err instanceof Error ? err.message : 'Failed to parse PDF');
                         } finally {
                           setUploading(false);
                         }
                       } else {
                         setUploadError('Please upload a valid PDF file.');
                       }
                     }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                                             onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         
                         // Validate file type
                         if (file.type !== 'application/pdf') {
                           setUploadError('Please select a PDF file.');
                           return;
                         }
                         
                         // Validate file size (max 10MB)
                         if (file.size > 10 * 1024 * 1024) {
                           setUploadError('File size too large. Please select a PDF smaller than 10MB.');
                           return;
                         }
                         
                         setUploading(true);
                         setUploadError(null);
                         setUploadedFile(file);
                         try {
                           // Add timeout protection for PDF parsing
                           const timeoutPromise = new Promise((_, reject) => 
                             setTimeout(() => reject(new Error('PDF parsing timeout - please try a smaller file or check the format')), 45000)
                           );
                           
                           const parsingPromise = parsePdfToOptions(file);
                           const parsedOptions = await Promise.race([parsingPromise, timeoutPromise]) as Array<{
                             id: string;
                             priority: number;
                             collegeCode: string;
                             branchCode: string;
                             collegeName: string;
                             branchName: string;
                             location: string;
                             collegeCourse: string;
                             courseFee: string;
                             collegeAddress: string;
                           }>;
                           
                           if (parsedOptions && parsedOptions.length > 0) {
                             setSelectedOptions(parsedOptions);
                             console.log('Successfully parsed options:', parsedOptions);
                             setUploadError(null); // Clear any previous errors
                             
                             // Show success message briefly
                             const successMessage = `✅ Successfully parsed ${parsedOptions.length} options from PDF!`;
                             console.log(successMessage);
                             
                             // You could add a toast notification here if you have a toast system
                           } else {
                             setUploadError('No options found in PDF. Please check the format or try a different file.');
                           }
                         } catch (err) {
                           console.error('PDF parsing error:', err);
                           console.error('Error details:', {
                             name: err instanceof Error ? err.name : 'Unknown',
                             message: err instanceof Error ? err.message : String(err),
                             stack: err instanceof Error ? err.stack : undefined,
                             fileSize: file.size,
                             fileType: file.type,
                             fileName: file.name
                           });
                           
                           let errorMessage = 'Failed to parse PDF';
                           
                           if (err instanceof Error) {
                             if (err.message.includes('timeout')) {
                               errorMessage = 'PDF parsing took too long. Please try a smaller file or check the format.';
                             } else if (err.message.includes('worker')) {
                               errorMessage = 'PDF processing error. Please try refreshing the page and uploading again.';
                             } else if (err.message.includes('connection')) {
                               errorMessage = 'PDF processing connection error. Please try refreshing the page.';
                             } else {
                               errorMessage = err.message;
                             }
                           }
                           
                           setUploadError(errorMessage);
                         } finally {
                           setUploading(false);
                         }
                       }}
                    />
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <div className="text-2xl sm:text-3xl">📄</div>
                      <div className="font-semibold text-base sm:text-lg text-foreground">Upload Option Entry PDF</div>
                      <div className="text-xs text-muted-foreground mb-1 sm:mb-2">Drag & drop or click to select a PDF file</div>
                      <div className="text-xs text-muted-foreground text-center max-w-xs">
                        💡 Tip: For best results, use KCET option entry PDFs. Large files may take longer to process.
                      </div>
                      {uploadedFile && (
                        <div className="text-xs text-muted-foreground font-medium">{uploadedFile.name}</div>
                      )}
                      {uploading && (
                        <div className="text-xs text-muted-foreground animate-pulse">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Parsing PDF... This may take a few moments
                          </div>
                        </div>
                      )}
                      {uploadError && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          {uploadError}
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUploadError(null);
                                setUploadedFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Try Again
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Use fallback sample data
                                const sampleOptions = [{
                                  id: '1',
                                  priority: 1,
                                  collegeCode: 'E001',
                                  branchCode: 'CS',
                                  collegeName: 'Sample College',
                                  branchName: 'Computer Science Engineering',
                                  location: 'Bangalore',
                                  collegeCourse: 'E001CS',
                                  courseFee: '2,50,000',
                                  collegeAddress: 'Sample College, Bangalore'
                                }];
                                setSelectedOptions(sampleOptions);
                                setUploadError(null);
                                console.log('Using sample options for testing');
                              }}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Use Sample Data
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* --- Mock Allotment Simulator Button --- */}
                <div className="w-full flex flex-col items-center mb-3 sm:mb-4">
                  <div className="bg-muted border rounded-xl p-2 sm:p-4 flex flex-wrap gap-4 sm:gap-6 justify-center items-center w-full max-w-full sm:max-w-2xl mb-2">
                    <div className="flex flex-col items-start w-1/2 sm:w-auto">
                      <label className="block text-xs sm:text-sm font-bold text-foreground mb-1">Select Year</label>
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="border rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[90px] sm:min-w-[120px]"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col items-start w-1/2 sm:w-auto">
                      <label className="block text-xs sm:text-sm font-bold text-foreground mb-1">Select Round</label>
                      <select
                        value={selectedRound}
                        onChange={e => setSelectedRound(e.target.value)}
                        className="border rounded-lg px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[90px] sm:min-w-[120px]"
                      >
                        {availableRounds.map(round => (
                          <option key={round} value={round}>{round}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={simulateAllotment}
                    disabled={simulating || !selectedOptions.length || !userRank}
                    className="px-4 sm:px-8 py-2 sm:py-3 rounded-xl w-full sm:w-auto"
                  >
                    {simulating ? "Simulating..." : "Simulate Mock Allotment"}
                  </Button>
                  <div className="text-xs text-muted-foreground mt-1 sm:mt-2 text-center">Predicts your most likely allotment based on your preferences and selected cutoff year/round.</div>
                </div>
                {/* --- Allotment Result Modal --- */}
                {showAllotmentModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 sm:p-0">
                    <div className="bg-background border rounded-2xl shadow-2xl p-3 sm:p-8 w-full max-w-full sm:max-w-xl max-h-[90vh] overflow-y-auto relative mx-1 sm:mx-auto sm:my-8">
                                              <button
                          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xl"
                          onClick={() => setShowAllotmentModal(false)}
                          aria-label="Close"
                        >×</button>
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="text-4xl sm:text-5xl mb-1 sm:mb-2 text-foreground">🎉</div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Mock Allotment Result</h2>
                        {allotmentResult?.best?.status === "Unknown" ? (
                          <div className="text-base sm:text-lg text-foreground font-semibold mb-1 sm:mb-2">No eligible allotment found for your rank and preferences.</div>
                        ) : (
                          <>
                            <div className="text-base sm:text-lg font-semibold text-foreground mb-1">
                              {allotmentResult.best.option.branchName} <span className="text-foreground">@</span> {allotmentResult.best.option.collegeName}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">(Option #{allotmentResult.best.option.priority})</div>
                            <div className="bg-muted border rounded-lg p-2 sm:p-4 w-full text-left mb-1 sm:mb-2">
                              <div><span className="font-medium text-foreground">Institute Code:</span> <span className="text-foreground">{allotmentResult.best.option.collegeCode}</span></div>
                              <div><span className="font-medium text-foreground">Course Code:</span> <span className="text-foreground">{allotmentResult.best.option.branchCode}</span></div>
                              <div><span className="font-medium text-foreground">Category:</span> <span className="text-foreground">{userCategory}</span></div>
                              <div><span className="font-medium text-foreground">Cutoff Rank ({selectedYear} {selectedRound}):</span> <span className="text-foreground">{allotmentResult.best.cutoff?.cutoff_rank ? allotmentResult.best.cutoff.cutoff_rank.toLocaleString() : "No data"}</span></div>
                              <div><span className="font-medium text-foreground">Your Rank:</span> <span className="text-foreground">{userRank?.toLocaleString()}</span></div>
                              <div><span className="font-medium text-foreground">Chance:</span> <span className="text-foreground">{allotmentResult.best.status} ({Math.round(allotmentResult.best.probability)}%)</span></div>
                              <div><span className="font-medium text-foreground">Match Type:</span> <span className="text-foreground">{allotmentResult.best.matchType}</span></div>
                            </div>
                            <div className="text-foreground font-semibold text-center">
                              {allotmentResult.best.status === "Very High Chance" ? "🎉 Excellent! You would definitely be allotted this option." :
                               allotmentResult.best.status === "High Chance" ? "🎯 Great! You would likely be allotted this option." :
                               allotmentResult.best.status === "Moderate Chance" ? "⚠️ Moderate chance. This could be a close call." :
                               allotmentResult.best.status === "Low Chance" ? "📉 Low chance. Consider safer options." :
                               allotmentResult.best.status === "Very Low Chance" ? "❌ Very low chance. This option is too ambitious." :
                               "❓ Unknown. No cutoff data available for this option."}
                            </div>
                          </>
                        )}
                        {/* Show all options with their probabilities */}
                        <div className="w-full mt-4">
                          <h4 className="text-base font-bold text-foreground mb-2">All Options & Probabilities</h4>
                          <div className="max-h-48 overflow-y-auto w-full">
                            <table className="w-full text-xs sm:text-sm border-separate border-spacing-y-1">
                              <thead>
                                <tr className="bg-muted text-foreground">
                                  <th className="px-2 py-1 text-left">Option</th>
                                  <th className="px-2 py-1 text-left">College</th>
                                  <th className="px-2 py-1 text-left">Chance</th>
                                  <th className="px-2 py-1 text-left">Probability</th>
                                  <th className="px-2 py-1 text-left">Cutoff</th>
                                  <th className="px-2 py-1 text-left">Match</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allotmentResult?.all?.map((r, idx) => (
                                  <tr key={r.option.collegeCourse + '-' + r.option.priority + '-' + idx} className={
                                    r.status === "Very High Chance" ? "bg-green-200" :
                                    r.status === "High Chance" ? "bg-green-100" :
                                    r.status === "Moderate Chance" ? "bg-yellow-100" :
                                    r.status === "Low Chance" ? "bg-orange-100" :
                                    r.status === "Very Low Chance" ? "bg-red-100" :
                                    "bg-gray-100"
                                  }>
                                    <td className="px-2 py-1 font-bold">{r.option.priority}</td>
                                    <td className="px-2 py-1">{r.option.collegeName} ({r.option.branchName})</td>
                                    <td className="px-2 py-1">{r.status}</td>
                                    <td className="px-2 py-1">{Math.round(r.probability)}%</td>
                                    <td className="px-2 py-1">{r.cutoff?.cutoff_rank ? r.cutoff.cutoff_rank.toLocaleString() : "-"}</td>
                                    <td className="px-2 py-1">{r.matchType}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <button onClick={() => setShowAllotmentModal(false)} className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 rounded-lg font-semibold w-full sm:w-auto">OK</button>
                      </div>
                    </div>
                  </div>
                )}
                <OptionEntryTable 
                  userRank={userRank} 
                  userCategory={userCategory} 
                  options={selectedOptions}
                  onOptionsChange={setSelectedOptions}
                />
              </TabsContent>

              <TabsContent value="colleges">
                <CollegeList 
                  options={selectedOptions}
                  onOptionsChange={setSelectedOptions}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <Analytics 
                  userRank={userRank} 
                  userCategory={userCategory} 
                  selectedOptions={selectedOptions}
                />
              </TabsContent>

              <TabsContent value="resources">
                <UploadedReferences />
              </TabsContent>

              <TabsContent value="instructions">
                <Instructions />
              </TabsContent>

              <TabsContent value="worksheet">
                <Card className="p-4 sm:p-8 text-center">
                  <div className="text-2xl sm:text-4xl mb-3 sm:mb-6">📝</div>
                  <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-2 sm:mb-4">Planning Worksheet</h3>
                  <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-8">
                    Use this space to brainstorm and organize your thoughts before finalizing your option list.
                  </p>
                  <div className="bg-muted border rounded-lg p-3 sm:p-6 text-left">
                    <h4 className="font-semibold text-foreground mb-2 sm:mb-3">💡 Planning Questions to Consider:</h4>
                    <ul className="text-foreground space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <li>• What are your top 3 preferred branches of engineering?</li>
                      <li>• Are you willing to study outside Bangalore/your home city?</li>
                      <li>• What are your budget for college fees?</li>
                      <li>• Do you prefer government/aided colleges over private ones?</li>
                      <li>• Which colleges have the best placement records in your field?</li>
                      <li>• Have you researched faculty and infrastructure of target colleges?</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
      <footer className="fixed bottom-0 left-0 w-full text-center py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground opacity-80 bg-background z-50 shadow">
        Created with <span role="img" aria-label="love">❤️</span> by Rishab
      </footer>
    </>
  );
};

// Enhanced PDF parsing function specifically for KCET option entry PDFs
async function parsePdfToOptions(file: File): Promise<Array<{
  id: string;
  priority: number;
  collegeCode: string;
  branchCode: string;
  collegeName: string;
  branchName: string;
  location: string;
  collegeCourse: string;
  courseFee: string;
  collegeAddress: string;
}>> {
  try {
    console.log('🚀 Starting KCET PDF parsing for file:', file.name);
    console.log('📊 File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Check if PDF.js is properly loaded
    if (!pdfjsLib || !pdfjsLib.getDocument) {
      throw new Error('PDF.js library not properly loaded. Please refresh the page.');
    }
    
    // Check if PDFParser is available
    if (!PDFParser || !PDFParser.parseWithFallback) {
      throw new Error('PDF parser not available. Please refresh the page.');
    }
    
    console.log('📄 PDF.js version:', pdfjsLib.version);
    console.log('⚙️ Worker status:', pdfjsLib.GlobalWorkerOptions?.workerSrc || 'No worker (main thread)');
    
    // Use the specialized KCET PDFParser
    console.log('🔍 Using specialized KCET PDF parser...');
    const parsedOptions = await PDFParser.parseWithFallback(file);
    
    console.log('✅ Raw parsing completed. Found', parsedOptions.length, 'options');
    
    // Transform the parsed options to match our expected format
    const transformedOptions = parsedOptions.map((option, index) => ({
      id: option.id,
      priority: option.priority || index + 1,
      collegeCode: option.collegeCode,
      branchCode: option.branchCode,
      collegeName: option.collegeName,
      branchName: option.branchName,
      location: option.location,
      collegeCourse: option.collegeCourse,
      courseFee: option.courseFee || 'Not specified',
      collegeAddress: option.collegeName, // Use college name as address for now
    }));
    
    console.log('🎯 PDF parsing completed successfully!');
    console.log('📋 Total options found:', transformedOptions.length);
    console.log('📝 Sample parsed options:', transformedOptions.slice(0, 3));
    
    // Log all options for debugging
    transformedOptions.forEach((option, index) => {
      console.log(`Option ${index + 1}: ${option.priority}. ${option.collegeCode}${option.branchCode} - ${option.branchName} @ ${option.collegeName}`);
    });
    
    return transformedOptions;
    
  } catch (err) {
    console.error('❌ PDF parsing failed:', err);
    
    // Return fallback options if parsing completely fails
    console.warn('⚠️ Using fallback options due to parsing failure');
    
    // Try manual parsing as last resort
    try {
      console.log('🔄 Attempting manual KCET PDF parsing...');
      const manualOptions = await manualKCETParsing(file);
      if (manualOptions.length > 0) {
        console.log('✅ Manual parsing successful! Found', manualOptions.length, 'options');
        return manualOptions;
      }
    } catch (manualError) {
      console.warn('⚠️ Manual parsing also failed:', manualError);
    }
    
    return [{
      id: '1',
      priority: 1,
      collegeCode: 'E001',
      branchCode: 'CS',
      collegeName: 'Sample College',
      branchName: 'Computer Science Engineering',
      location: 'Bangalore',
      collegeCourse: 'E001CS',
      courseFee: '2,50,000',
      collegeAddress: 'Sample College, Bangalore'
    }];
  }
}

// Manual KCET PDF parsing as backup method
async function manualKCETParsing(file: File): Promise<Array<{
  id: string;
  priority: number;
  collegeCode: string;
  branchCode: string;
  collegeName: string;
  branchName: string;
  location: string;
  collegeCourse: string;
  courseFee: string;
  collegeAddress: string;
}>> {
  try {
    console.log('🔧 Starting manual KCET PDF parsing...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const options: any[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Extract all text items with their content
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`📄 Page ${pageNum} text length:`, pageText.length);
      console.log(`📄 Page ${pageNum} sample text:`, pageText.substring(0, 200));
      
      // Look for KCET option patterns in the text
      const kcetOptions = extractKCETOptionsFromText(pageText);
      options.push(...kcetOptions);
    }
    
    console.log('🔧 Manual parsing found', options.length, 'options');
    return options;
    
  } catch (error) {
    console.error('🔧 Manual parsing failed:', error);
    return [];
  }
}

// Extract KCET options from text using regex patterns
function extractKCETOptionsFromText(text: string): Array<{
  id: string;
  priority: number;
  collegeCode: string;
  branchCode: string;
  collegeName: string;
  branchName: string;
  location: string;
  collegeCourse: string;
  courseFee: string;
  collegeAddress: string;
}> {
  const options: any[] = [];
  
  // Split text into lines
  const lines = text.split(/\n|\./).filter(line => line.trim());
  
  // Look for KCET option pattern: Option number followed by college course code
  const kcetPattern = /(\d+)\s+([A-Z]\d{3}[A-Z]+)/g;
  let match;
  
  while ((match = kcetPattern.exec(text)) !== null) {
    const optionNumber = parseInt(match[1]);
    const collegeCourse = match[2];
    
    // Extract college code and branch code
    const collegeCode = collegeCourse.substring(0, 4); // E099, E005, E048
    const branchCode = collegeCourse.substring(4); // AI, CS, CA, CY, DS, AD
    
    // Look for course name and college name in nearby text
    const startIndex = Math.max(0, match.index - 500);
    const endIndex = Math.min(text.length, match.index + 1000);
    const contextText = text.substring(startIndex, endIndex);
    
    // Extract course name (look for engineering branch names)
    const courseName = extractCourseName(contextText);
    
    // Extract college name (look for college keywords)
    const collegeName = extractCollegeName(contextText);
    
    // Extract course fee
    const courseFee = extractCourseFee(contextText);
    
    if (collegeCode && branchCode) {
      const option = {
        id: `manual-${optionNumber}-${Date.now()}`,
        priority: optionNumber,
        collegeCode,
        branchCode,
        collegeName: collegeName || `${collegeCode} College`,
        branchName: courseName || `${branchCode} Engineering`,
        location: extractLocation(collegeName),
        collegeCourse,
        courseFee: courseFee || 'Not specified',
        collegeAddress: collegeName || `${collegeCode} College`,
      };
      
      options.push(option);
      console.log(`🔧 Manual parsed option ${optionNumber}:`, option);
    }
  }
  
  return options;
}

// Helper functions for manual parsing
function extractCourseName(text: string): string {
  const courseKeywords = [
    'COMPUTER SCIENCE', 'ELECTRONICS', 'MECHANICAL', 'CIVIL',
    'ARTIFICIAL INTELLIGENCE', 'MACHINE LEARNING', 'DATA SCIENCE',
    'CYBER SECURITY', 'INFORMATION SCIENCE', 'TELECOMMUNICATION',
    'BIOTECHNOLOGY', 'CHEMICAL', 'INDUSTRIAL', 'AERONAUTICAL',
    'AUTOMOBILE', 'BIOMEDICAL', 'AGRICULTURAL', 'FOOD TECHNOLOGY'
  ];
  
  for (const keyword of courseKeywords) {
    if (text.toUpperCase().includes(keyword)) {
      // Find the full course name around the keyword
      const index = text.toUpperCase().indexOf(keyword);
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + keyword.length + 100);
      return text.substring(start, end).trim();
    }
  }
  
  return '';
}

function extractCollegeName(text: string): string {
  const collegeKeywords = [
    'COLLEGE', 'UNIVERSITY', 'INSTITUTE', 'ENGINEERING',
    'TECHNOLOGY', 'POLYTECHNIC', 'AUTONOMOUS'
  ];
  
  for (const keyword of collegeKeywords) {
    if (text.toUpperCase().includes(keyword)) {
      // Find the full college name around the keyword
      const index = text.toUpperCase().indexOf(keyword);
      const start = Math.max(0, index - 100);
      const end = Math.min(text.length, index + keyword.length + 150);
      return text.substring(start, end).trim();
    }
  }
  
  return '';
}

function extractCourseFee(text: string): string {
  // Look for fee pattern like "1,12,410 - One Lakh Twelve Thousand Four Hundred and Ten"
  const feePattern = /\d{1,3}(?:,\d{2,3})+\s*-\s*[A-Za-z\s]+/;
  const match = text.match(feePattern);
  return match ? match[0] : '';
}

function extractLocation(collegeName: string): string {
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
  
  return 'Bangalore';
}

export default Planner;
