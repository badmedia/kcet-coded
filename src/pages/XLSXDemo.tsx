import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Filter, FileSpreadsheet, Download, AlertCircle, CheckCircle } from "lucide-react"
import { XLSXLoader, XLSXData } from "@/lib/xlsx-loader"
import { useToast } from "@/hooks/use-toast"
import { COURSES, COURSE_CODE_TO_NAME } from "@/lib/courses"

// Types for the cutoff data
interface CutoffData {
  institute: string
  institute_code: string
  course: string
  category: string
  cutoff_rank: number
  year: string
  round: string
  source: string
  sheet: string
}

const XLSXDemo = () => {
  const [data, setData] = useState<XLSXData | null>(null)
  const [cutoffs, setCutoffs] = useState<CutoffData[]>([])
  const [allCutoffs, setAllCutoffs] = useState<CutoffData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedSheet, setSelectedSheet] = useState("")
  const [selectedFile, setSelectedFile] = useState("")
  const [minRank, setMinRank] = useState("")
  const [maxRank, setMaxRank] = useState("")
  const [rankFilterType, setRankFilterType] = useState<"exact" | "range" | "above" | "below">("range")
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [stats, setStats] = useState<{ total: number; institutes: number; courses: number; categories: number; avgRank: number; minRankFound: number; maxRankFound: number }>({ 
    total: 0, 
    institutes: 0, 
    courses: 0, 
    categories: 0, 
    avgRank: 0, 
    minRankFound: 0, 
    maxRankFound: 0 
  })
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const { toast } = useToast()

  const handleLoadAllXLSX = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await XLSXLoader.loadAllXLSXFiles()
      setData(result)
      
      // Convert XLSX data to match existing format
      const convertedData: CutoffData[] = result.cutoffs.map(item => ({
        institute: item.institute || '',
        institute_code: item.institute_code || '',
        course: item.course || '',
        category: item.category || '',
        cutoff_rank: item.cutoff_rank || 0,
        year: item.year || '',
        round: item.round || '',
        source: item.source || '',
        sheet: item.sheet || ''
      }))

      setAllCutoffs(convertedData)
      
      // Extract unique values for dropdowns
      const years = [...new Set(convertedData.map(item => item.year))].sort((a, b) => b.localeCompare(a))
      const sheets = [...new Set(convertedData.map(item => item.sheet))].sort()
      const files = [...new Set(convertedData.map(item => item.source))].sort()
      
      setAvailableYears(years)
      setAvailableSheets(sheets)
      setAvailableFiles(files)
      
      // Set default year to the most recent year
      if (years.length > 0) {
        setSelectedYear(years[0])
      }
      
      setCutoffs(convertedData.slice(0, 200)) // Show first 200 records initially
      
      toast({
        title: "Success",
        description: `Loaded ${convertedData.length} records from all XLSX files`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load XLSX files'
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on current filters
  const filterData = () => {
    console.log('Filtering data with:', { selectedYear, selectedCategory, selectedCourse, selectedSheet, selectedFile, searchQuery, minRank, maxRank, rankFilterType })
    
    let filteredData = allCutoffs

    // Filter by year
    if (selectedYear) {
      filteredData = filteredData.filter(item => item.year === selectedYear)
    }

    // Filter by category
    if (selectedCategory) {
      filteredData = filteredData.filter(item => item.category === selectedCategory)
    }

    // Filter by course
    if (selectedCourse) {
      filteredData = filteredData.filter(item => item.course === selectedCourse)
    }

    // Filter by sheet
    if (selectedSheet) {
      filteredData = filteredData.filter(item => item.sheet === selectedSheet)
    }

    // Filter by file
    if (selectedFile) {
      filteredData = filteredData.filter(item => item.source === selectedFile)
    }

    // Filter by search query
    if (searchQuery) {
      filteredData = filteredData.filter(item => 
        item.institute?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.institute_code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by rank
    if (minRank || maxRank) {
      filteredData = filteredData.filter(item => {
        const rank = item.cutoff_rank
        if (!rank) return false

        switch (rankFilterType) {
          case "exact":
            return rank === parseInt(minRank)
          case "range":
            const min = minRank ? parseInt(minRank) : 0
            const max = maxRank ? parseInt(maxRank) : 999999
            return rank >= min && rank <= max
          case "above":
            const minVal = minRank ? parseInt(minRank) : 0
            return rank >= minVal
          case "below":
            const maxVal = maxRank ? parseInt(maxRank) : 999999
            return rank <= maxVal
          default:
            return true
        }
      })
    }

    // Update stats
    const instituteSet = new Set(filteredData.map(i => i.institute_code))
    const courseSet = new Set(filteredData.map(i => i.course))
    const categorySet = new Set(filteredData.map(i => i.category))
    const ranks = filteredData.map(i => i.cutoff_rank).filter(r => r > 0)
    
    setStats({
      total: filteredData.length,
      institutes: instituteSet.size,
      courses: courseSet.size,
      categories: categorySet.size,
      avgRank: ranks.length > 0 ? Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length) : 0,
      minRankFound: ranks.length > 0 ? Math.min(...ranks) : 0,
      maxRankFound: ranks.length > 0 ? Math.max(...ranks) : 0
    })

    // Pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    console.log('Filtered data:', filteredData.length, 'records')
    setCutoffs(filteredData.slice(start, end))
  }

  useEffect(() => {
    if (allCutoffs.length > 0) {
      filterData()
    }
  }, [selectedYear, selectedCategory, selectedCourse, selectedSheet, selectedFile, searchQuery, minRank, maxRank, rankFilterType, allCutoffs, page, pageSize])

  const handleSearch = () => {
    filterData()
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedYear("")
    setSelectedCategory("")
    setSelectedCourse("")
    setSelectedSheet("")
    setSelectedFile("")
    setMinRank("")
    setMaxRank("")
    setRankFilterType("range")
    setPage(1)
  }

  const getRankStatus = (rank: number) => {
    if (rank <= 10000) return "Excellent"
    if (rank <= 25000) return "Good"
    if (rank <= 50000) return "Average"
    if (rank <= 100000) return "Below Average"
    return "Low"
  }

  const getRankStatusColor = (rank: number) => {
    if (rank <= 10000) return "bg-green-100 text-green-800"
    if (rank <= 25000) return "bg-blue-100 text-blue-800"
    if (rank <= 50000) return "bg-yellow-100 text-yellow-800"
    if (rank <= 100000) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GM': return 'bg-blue-100 text-blue-800'
      case 'SC': return 'bg-green-100 text-green-800'
      case 'ST': return 'bg-purple-100 text-purple-800'
      case '1G': return 'bg-red-100 text-red-800'
      case '2A': return 'bg-orange-100 text-orange-800'
      case '2B': return 'bg-yellow-100 text-yellow-800'
      case '3A': return 'bg-pink-100 text-pink-800'
      case '3B': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportToJSON = () => {
    if (!data) return

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cutoffs-data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">XLSX Data Loader Demo</h1>
          <p className="text-muted-foreground">
            Load and display KCET cutoff data directly from XLSX files with advanced filtering
          </p>
        </div>
      </div>

      {/* Load XLSX Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Load XLSX Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Load all XLSX files automatically from the server directory
            </p>
            <Button 
              onClick={handleLoadAllXLSX}
              disabled={loading}
              size="lg"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Load All XLSX Files
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground">Processing XLSX files...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="College or branch name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory || 'ALL'} onValueChange={(v) => setSelectedCategory(v === 'ALL' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="GM">General (GM)</SelectItem>
                    <SelectItem value="SC">Schedule Caste (SC)</SelectItem>
                    <SelectItem value="ST">Schedule Tribe (ST)</SelectItem>
                    <SelectItem value="1G">Category 1G</SelectItem>
                    <SelectItem value="2A">Category 2A</SelectItem>
                    <SelectItem value="2B">Category 2B</SelectItem>
                    <SelectItem value="3A">Category 3A</SelectItem>
                    <SelectItem value="3B">Category 3B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse || 'ALL'} onValueChange={(v) => setSelectedCourse(v === 'ALL' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="ALL">All Courses</SelectItem>
                    {COURSES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sheet</Label>
                <Select value={selectedSheet || 'ALL'} onValueChange={(v) => setSelectedSheet(v === 'ALL' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sheets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sheets</SelectItem>
                    {availableSheets.map((sheet) => (
                      <SelectItem key={sheet} value={sheet}>
                        {sheet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File</Label>
                <Select value={selectedFile || 'ALL'} onValueChange={(v) => setSelectedFile(v === 'ALL' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All files" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Files</SelectItem>
                    {availableFiles.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file.replace('/kcet-', '').replace('-cutoffs.xlsx', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

                         <div className="flex items-end gap-2 mt-4">
               <Button onClick={handleSearch} className="flex-1">
                 Search
               </Button>
               <Button onClick={exportToJSON} variant="outline">
                 <Download className="h-4 w-4 mr-2" />
                 Export JSON
               </Button>
             </div>
           </CardContent>
         </Card>

       )}

       {/* Rank Filtering Section */}
       {data && (
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Filter className="h-5 w-5" />
               Rank-Based Filtering
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
               <div className="space-y-2">
                 <Label>Rank Filter Type</Label>
                 <Select value={rankFilterType} onValueChange={(v: "exact" | "range" | "above" | "below") => setRankFilterType(v)}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select filter type" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="range">Range (Min - Max)</SelectItem>
                     <SelectItem value="above">Above Min Rank</SelectItem>
                     <SelectItem value="below">Below Max Rank</SelectItem>
                     <SelectItem value="exact">Exact Rank</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div className="space-y-2">
                 <Label>Min Rank</Label>
                 <Input
                   placeholder="Enter minimum rank"
                   value={minRank}
                   onChange={(e) => setMinRank(e.target.value)}
                   type="number"
                 />
               </div>

               <div className="space-y-2">
                 <Label>Max Rank</Label>
                 <Input
                   placeholder="Enter maximum rank"
                   value={maxRank}
                   onChange={(e) => setMaxRank(e.target.value)}
                   type="number"
                   disabled={rankFilterType === "above" || rankFilterType === "exact"}
                 />
               </div>

               <div className="space-y-2">
                 <Label>Quick Rank Filters</Label>
                 <div className="flex gap-2">
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       setMinRank("1")
                       setMaxRank("10000")
                       setRankFilterType("range")
                     }}
                   >
                     Top 10K
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       setMinRank("10000")
                       setMaxRank("50000")
                       setRankFilterType("range")
                     }}
                   >
                     10K-50K
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       setMinRank("50000")
                       setMaxRank("100000")
                       setRankFilterType("range")
                     }}
                   >
                     50K-100K
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={clearAllFilters}
                   >
                     Clear All
                   </Button>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       )}

      {/* Summary Stats */}
      {data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Matching cutoff entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Institutes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.institutes}</div>
              <p className="text-xs text-muted-foreground">Appearing in results</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses}</div>
              <p className="text-xs text-muted-foreground">Distinct course codes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories}</div>
              <p className="text-xs text-muted-foreground">Present in results</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Rank Stats */}
      {data && (minRank || maxRank) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Average Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRank.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">In filtered results</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Min Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.minRankFound.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Lowest in results</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Max Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maxRankFound.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Highest in results</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Rank Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.maxRankFound - stats.minRankFound).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Span of ranks</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Summary */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Data Summary
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.metadata.total_entries}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{data.metadata.total_files_processed}</div>
                <div className="text-sm text-muted-foreground">Files Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(data.cutoffs.map(c => c.institute_code)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Colleges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(data.cutoffs.map(c => c.course)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Courses</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Data Sources:</h4>
              <div className="flex flex-wrap gap-2">
                {data.metadata.data_sources.map((source, index) => (
                  <Badge key={index} variant="secondary">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Cutoff Results ({stats.total} total, page {page})
              </CardTitle>
              <div className="flex gap-2">
                {selectedYear && <Badge variant="outline">{selectedYear}</Badge>}
                {selectedCategory && <Badge variant="outline">{selectedCategory.toUpperCase()}</Badge>}
                {selectedSheet && <Badge variant="outline">{selectedSheet}</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {cutoffs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institute</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Sheet</TableHead>
                      <TableHead className="text-right">Cutoff Rank</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cutoffs.map((cutoff, index) => (
                      <TableRow key={`${cutoff.institute_code}-${cutoff.course}-${cutoff.category}-${index}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cutoff.institute}</div>
                            <div className="text-sm text-muted-foreground">
                              {cutoff.institute_code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{COURSE_CODE_TO_NAME[cutoff.course] || cutoff.course}</div>
                            <div className="text-sm text-muted-foreground">{cutoff.course}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cutoff.category)}>
                            {cutoff.category?.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {cutoff.round}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {cutoff.sheet}
                          </div>
                        </TableCell>
                                               <TableCell className="text-right">
                         <div className="text-right">
                           <div className="font-mono font-semibold">
                             {cutoff.cutoff_rank?.toLocaleString()}
                           </div>
                           <Badge className={`mt-1 ${getRankStatusColor(cutoff.cutoff_rank)}`}>
                             {getRankStatus(cutoff.cutoff_rank)}
                           </Badge>
                         </div>
                       </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex items-center justify-between p-3">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, stats.total)} of {stats.total}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(Math.max(1, page - 1))} 
                      disabled={page === 1}
                    >
                      Prev
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(page * pageSize < stats.total ? page + 1 : page)} 
                      disabled={page * pageSize >= stats.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cutoffs found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or load XLSX files first</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default XLSXDemo
