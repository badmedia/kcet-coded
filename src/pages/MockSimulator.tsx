import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shuffle, Play, RotateCcw, CheckCircle, XCircle, ArrowUp, ArrowDown, Info, TrendingUp, TrendingDown } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Card as UICard } from "@/components/ui/card"

const MockSimulator = () => {
  const [rank, setRank] = useState("")
  const [category, setCategory] = useState("")
  const [preferences, setPreferences] = useState<any[]>([])
  const [simulation, setSimulation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cutoffs, setCutoffs] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedRound, setSelectedRound] = useState("Round 1")
  const { toast } = useToast()

  // Load cutoffs data on mount
  useEffect(() => {
    const loadCutoffs = async () => {
      try {
        const res = await fetch("/data/kcet_cutoffs_consolidated.json");
        const response = await res.json();
        const dataArray = response.data || response.cutoffs || response;
        
        if (Array.isArray(dataArray)) {
          const transformedData = dataArray.map((item: any) => ({
            year: item.year || item.Year || "2024",
            round: item.round || item.Round || "Round 1",
            institute_code: item.institute_code || item.college_code || item.instituteCode || "",
            course: item.course || item.branch_code || item.Course || "",
            category: item.category || item.Category || "GM",
            cutoff_rank: parseInt(item.cutoff_rank || item.cutoffRank || "0") || 0,
            college_name: item.college_name || item.collegeName || "",
            branch_name: item.branch_name || item.branchName || "",
          }));
          setCutoffs(transformedData);
        }
      } catch (error) {
        console.error('Failed to load cutoffs:', error);
      }
    };
    
    loadCutoffs();
  }, []);

  const addPreference = () => {
    setPreferences([...preferences, { 
      college: "", 
      branch: "", 
      priority: preferences.length + 1,
      collegeCode: "",
      branchCode: ""
    }])
  }

  const removePreference = (index: number) => {
    const newPreferences = preferences.filter((_, i) => i !== index);
    // Reorder priorities
    const reorderedPreferences = newPreferences.map((pref, i) => ({
      ...pref,
      priority: i + 1
    }));
    setPreferences(reorderedPreferences);
  }

  const updatePreference = (index: number, field: string, value: string) => {
    const updated = [...preferences]
    updated[index] = { ...updated[index], [field]: value }
    
    // Update collegeCourse if both codes are present
    if (field === 'collegeCode' || field === 'branchCode') {
      const collegeCode = field === 'collegeCode' ? value : updated[index].collegeCode;
      const branchCode = field === 'branchCode' ? value : updated[index].branchCode;
      if (collegeCode && branchCode) {
        updated[index].collegeCourse = `${collegeCode}${branchCode}`;
      }
    }
    
    setPreferences(updated)
  }

  const movePreference = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === preferences.length - 1)
    ) return

    const updated = [...preferences]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]]
    
    // Update priorities
    updated.forEach((pref, i) => {
      pref.priority = i + 1
    })
    
    setPreferences(updated)
  }

  const findBestMatch = (preference: any) => {
    if (!cutoffs || !preference.collegeCode || !preference.branchCode) return null;
    
    // Look for exact match first
    let bestEntry = cutoffs.find((c: any) =>
      c.institute_code === preference.collegeCode &&
      c.course === preference.branchCode &&
      c.category === category &&
      c.year === selectedYear &&
      c.round === selectedRound
    );
    
    if (bestEntry) return { entry: bestEntry, matchType: "Exact match" };
    
    // Look for historical match
    bestEntry = cutoffs.find((c: any) =>
      c.institute_code === preference.collegeCode &&
      c.course === preference.branchCode &&
      c.category === category
    );
    
    if (bestEntry) return { entry: bestEntry, matchType: "Historical match" };
    
    return null;
  };

  const getChanceStatus = (userRank: number, cutoffRank: number) => {
    const rankDifference = userRank - cutoffRank;
    const percentageDifference = (rankDifference / cutoffRank) * 100;
    
    if (userRank <= cutoffRank) {
      if (rankDifference >= -1000) {
        return { status: "Very High Chance", probability: 95 + Math.random() * 5, color: "text-green-600" };
      } else if (rankDifference >= -5000) {
        return { status: "High Chance", probability: 85 + Math.random() * 10, color: "text-green-500" };
      } else {
        return { status: "High Chance", probability: 80 + Math.random() * 15, color: "text-green-500" };
      }
    } else if (percentageDifference <= 20) {
      return { status: "Moderate Chance", probability: 60 + Math.random() * 20, color: "text-yellow-600" };
    } else if (percentageDifference <= 50) {
      return { status: "Low Chance", probability: 30 + Math.random() * 30, color: "text-orange-600" };
    } else {
      return { status: "Very Low Chance", probability: Math.random() * 20, color: "text-red-600" };
    }
  };

  const runSimulation = async () => {
    if (!rank || !category || preferences.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter rank, category and add preferences",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const rankNum = parseInt(rank)
      let allottedSeat = null
      let waitingList = []
      let simulationResults = []
      
      for (const pref of preferences) {
        const match = findBestMatch(pref);
        
        if (match && match.entry && typeof match.entry.cutoff_rank === "number") {
          const { status, probability, color } = getChanceStatus(rankNum, match.entry.cutoff_rank);
          
          const result = {
            ...pref,
            cutoff: match.entry,
            matchType: match.matchType,
            status,
            probability,
            color,
            closingRank: match.entry.cutoff_rank,
            difference: rankNum - match.entry.cutoff_rank
          };
          
          simulationResults.push(result);
          
          if (status.includes("High") && !allottedSeat) {
            allottedSeat = result;
          } else if (!allottedSeat) {
            waitingList.push(result);
          }
        } else {
          simulationResults.push({
            ...pref,
            status: "No Data",
            probability: 0,
            color: "text-gray-500",
            cutoff: null,
            matchType: "No cutoff data available",
            closingRank: null,
            difference: null
          });
        }
      }

      const simulationResult = {
        allottedSeat,
        waitingList,
        allResults: simulationResults,
        suggestions: allottedSeat ? [] : [
          "Consider adding more safety options with higher closing ranks",
          "Reorder preferences based on realistic chances",
          "Include management quota seats as backup",
          "Check if your category has better chances in other rounds"
        ]
      }

      setSimulation(simulationResult)

      // Save simulation to database
      try {
        await supabase.from('mock_simulations').insert({
          rank: rankNum,
          category: category as any,
          preferences: preferences,
          simulation_result: simulationResult,
          round_results: { 
            [selectedRound.toLowerCase().replace(/\s+/g, '_')]: simulationResult 
          },
          year: selectedYear,
          round: selectedRound
        })
      } catch (dbError) {
        console.error('Failed to save to database:', dbError);
        // Continue even if database save fails
      }

    } catch (error) {
      toast({
        title: "Simulation Failed",
        description: "Unable to run simulation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetSimulation = () => {
    setSimulation(null)
    setPreferences([])
    setRank("")
    setCategory("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mock Allotment Simulator</h1>
        <p className="text-muted-foreground">Test your preference order and see likely allotment results based on real cutoff data</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Setup Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sim-rank">Your KCET Rank</Label>
                <Input
                  id="sim-rank"
                  type="number"
                  placeholder="Enter your rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GM">General (GM)</SelectItem>
                    <SelectItem value="SC">Schedule Caste (SC)</SelectItem>
                    <SelectItem value="ST">Schedule Tribe (ST)</SelectItem>
                    <SelectItem value="2A">Category 2A</SelectItem>
                    <SelectItem value="2B">Category 2B</SelectItem>
                    <SelectItem value="3A">Category 3A</SelectItem>
                    <SelectItem value="3B">Category 3B</SelectItem>
                    <SelectItem value="1G">Category 1G</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Round</Label>
                <Select value={selectedRound} onValueChange={setSelectedRound}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Round 1">Round 1</SelectItem>
                    <SelectItem value="Round 2">Round 2</SelectItem>
                    <SelectItem value="Round 3">Round 3</SelectItem>
                    <SelectItem value="Extended">Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button onClick={addPreference} variant="outline" className="w-full">
                  Add Preference
                </Button>
                <Button 
                  onClick={runSimulation} 
                  className="w-full" 
                  disabled={loading || !rank || !category || preferences.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? "Simulating..." : "Run Simulation"}
                </Button>
                <Button onClick={resetSimulation} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences & Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preferences List */}
          <Card>
            <CardHeader>
              <CardTitle>Preference Order ({preferences.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {preferences.length > 0 ? (
                <div className="space-y-3">
                  {preferences.map((pref, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePreference(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => movePreference(index, 'down')}
                          disabled={index === preferences.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 grid gap-2 md:grid-cols-4">
                        <Input
                          placeholder="College code (e.g., E001)"
                          value={pref.collegeCode}
                          onChange={(e) => updatePreference(index, 'collegeCode', e.target.value)}
                        />
                        <Input
                          placeholder="Branch code (e.g., CS)"
                          value={pref.branchCode}
                          onChange={(e) => updatePreference(index, 'branchCode', e.target.value)}
                        />
                        <Input
                          placeholder="College name"
                          value={pref.college}
                          onChange={(e) => updatePreference(index, 'college', e.target.value)}
                        />
                        <Input
                          placeholder="Branch name"
                          value={pref.branch}
                          onChange={(e) => updatePreference(index, 'branch', e.target.value)}
                        />
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePreference(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shuffle className="h-8 w-8 mx-auto mb-2" />
                  <p>Add preferences to start simulation</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Results */}
          {simulation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Simulation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {simulation.allottedSeat ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-semibold text-success">
                          🎉 Congratulations! You would likely get allotment in {selectedRound}
                        </div>
                        <div>
                          <strong>College:</strong> {simulation.allottedSeat.college || simulation.allottedSeat.collegeCode}<br />
                          <strong>Branch:</strong> {simulation.allottedSeat.branch || simulation.allottedSeat.branchCode}<br />
                          <strong>Priority:</strong> {simulation.allottedSeat.priority}<br />
                          <strong>Closing Rank:</strong> {simulation.allottedSeat.closingRank?.toLocaleString()}<br />
                          <strong>Chance:</strong> <span className={simulation.allottedSeat.color}>{simulation.allottedSeat.status} ({Math.round(simulation.allottedSeat.probability)}%)</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">No high-probability allotment found</div>
                      <div className="text-sm mt-1">
                        Your rank may not be sufficient for your current preferences
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* All Results Table */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Detailed Analysis:</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {simulation.allResults?.map((result: any, index: number) => (
                      <UICard key={index} className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{result.priority}</Badge>
                            <div>
                              <div className="font-medium">
                                {result.college || result.collegeCode} - {result.branch || result.branchCode}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.matchType}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${result.color}`}>
                              {result.status}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(result.probability)}% chance
                            </div>
                            {result.closingRank && (
                              <div className="text-xs text-muted-foreground">
                                Cutoff: {result.closingRank.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </UICard>
                    ))}
                  </div>
                </div>

                {simulation.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Suggestions:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {simulation.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default MockSimulator