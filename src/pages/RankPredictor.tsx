import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Target, AlertCircle, Download, FileText, BarChart3, PieChart, LineChart, Crown, Shield, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  predictKCETRank, 
  getPercentile, 
  calculatePercentile, 
  getRankAnalysis, 
  getCollegeSuggestions,
  type RankPrediction 
} from "@/lib/rank-predictor"



const RankPredictor = () => {
  const [kcetMarks, setKcetMarks] = useState(90)
  const [pucPercentage, setPucPercentage] = useState(60)
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("predictor")
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true) // Auto-accept disclaimer
  const [savedResults, setSavedResults] = useState<any[]>([])
  const { toast } = useToast()

  // Load saved results from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kcetResults')
      if (saved) {
        setSavedResults(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading saved results:', error)
    }
  }, [])



  const handlePredict = async () => {
    if (!disclaimerAccepted) {
      toast({
        title: "Disclaimer Required",
        description: "Please read and accept the disclaimer first",
        variant: "destructive"
      })
      return
    }

    if (kcetMarks < 0 || kcetMarks > 180 || pucPercentage < 0 || pucPercentage > 100) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid scores: KCET (0-180), PUC (0-100)",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const rankData = predictKCETRank(kcetMarks, pucPercentage)
      setPrediction(rankData)
      
      // Save result
      const result = {
        cet: kcetMarks,
        puc: pucPercentage,
        rank: rankData.medium,
        range: `${rankData.low}–${rankData.high}`,
        percentile: calculatePercentile(rankData.medium),
        timestamp: new Date().toISOString()
      }
      
      const updatedResults = [...savedResults, result].slice(-10)
      setSavedResults(updatedResults)
      localStorage.setItem('kcetResults', JSON.stringify(updatedResults))

      toast({
        title: "Rank Predicted!",
        description: `Your predicted rank is ${rankData.medium.toLocaleString()}`,
      })
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Unable to predict rank",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadPNG = () => {
    if (!prediction) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = 500
    canvas.height = 350

    // Background
    ctx.fillStyle = '#6d28d9'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(20, 20, 460, 310)
    ctx.strokeStyle = '#6d28d9'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, 460, 310)

    // Title
    ctx.fillStyle = '#6d28d9'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('KCET 2025 Rank Card', 250, 60)

    // Rank
    ctx.font = 'bold 40px Arial'
    ctx.fillStyle = '#ec4899'
    ctx.fillText(`${prediction.medium.toLocaleString()}`, 250, 110)

    // Details
    ctx.font = '16px Arial'
    ctx.fillStyle = '#1e1b4b'
    ctx.textAlign = 'left'
    ctx.fillText(`Rank Range: ${prediction.low.toLocaleString()}–${prediction.high.toLocaleString()}`, 50, 150)
    ctx.fillText(`KCET Score: ${kcetMarks}/180 (${((kcetMarks / 180) * 100).toFixed(1)}%)`, 50, 180)
    ctx.fillText(`PUC PCM: ${pucPercentage}%`, 50, 210)
    ctx.fillText(`Percentile: ${calculatePercentile(prediction.medium)}%`, 50, 240)


    // Download
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `KCET_2025_Rank_${prediction.medium}.png`
    link.click()
  }

  const downloadPDF = () => {
    if (!prediction) return
    
    // This would require a PDF library like jsPDF
    toast({
      title: "PDF Download",
      description: "PDF download feature requires additional setup",
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">KCET 2025 Elite Predictor</h1>
          <p className="text-muted-foreground mt-2">Unleash your potential with cutting-edge rank predictions!</p>
        </div>
      </div>



      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictor" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Predictor
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="disclaimer" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Disclaimer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictor" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Estimate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Quick Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quick-kcet">KCET PCM (0-180)</Label>
                      <Input
                        id="quick-kcet"
                        type="number"
                        placeholder="e.g., 90"
                        min="0"
                        max="180"
                        value={kcetMarks}
                        onChange={(e) => setKcetMarks(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quick-puc">PUC PCM % (0-100)</Label>
                      <Input
                        id="quick-puc"
                        type="number"
                        placeholder="e.g., 85"
                        min="0"
                        max="100"
                        value={pucPercentage}
                        onChange={(e) => setPucPercentage(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {prediction && (
                                      <div className="p-4 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 border border-purple-300 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-700">Estimated Rank: <span className="font-semibold text-purple-700">{prediction.medium.toLocaleString()}</span></p>
                    <p className="text-sm text-gray-700">Range: <span className="font-semibold text-indigo-700">{prediction.low.toLocaleString()}–{prediction.high.toLocaleString()}</span></p>
                    <p className="text-sm mt-2 text-gray-600">{getRankAnalysis(prediction.medium)}</p>
                  </div>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Detailed Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>KCET PCM (0-180)</Label>
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {kcetMarks}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          value={kcetMarks}
                          onChange={(e) => setKcetMarks(Number(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>PUC PCM % (0-100)</Label>
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {pucPercentage}
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={pucPercentage}
                          onChange={(e) => setPucPercentage(Number(e.target.value))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">

                  </div>

                  <Button 
                    onClick={handlePredict} 
                    className="w-full" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? "Predicting..." : "Calculate Rank"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white shadow-xl">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">Your Elite Rank</h3>
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/20">
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {prediction ? prediction.medium.toLocaleString() : '---'}
                    </span>
                  </div>
                  {prediction && (
                    <div className="space-y-2 text-sm">
                      <p>Range: {prediction.low.toLocaleString()}–{prediction.high.toLocaleString()}</p>
                      <p>Percentile: {getPercentile(prediction.composite)}</p>
                      <p className="text-xs opacity-80">Among ~3,12,000 candidates</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {prediction ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>KCET PCM</span>
                        <span>{((kcetMarks / 180) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(kcetMarks / 180) * 100} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>PUC PCM</span>
                        <span>{pucPercentage}%</span>
                      </div>
                      <Progress value={pucPercentage} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Composite Score</span>
                        <span>{prediction.composite.toFixed(1)}%</span>
                      </div>
                      <Progress value={prediction.composite} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rank Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">{prediction.medium.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Predicted Rank</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">Range: {prediction.low.toLocaleString()}–{prediction.high.toLocaleString()}</p>

                      <p className="text-sm">Percentile: {calculatePercentile(prediction.medium)}%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-gray-700">{getRankAnalysis(prediction.medium)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    College Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {['general', 'obc', 'sc', 'st'].map((cat) => {
                      const college = getCollegeSuggestions(prediction.medium, cat)
                      return (
                        <div key={cat} className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                          <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                            {cat.toUpperCase()}
                          </Badge>
                          <h4 className="font-semibold text-gray-800">{college.name}</h4>
                          <p className="text-sm text-gray-600">{college.branch}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button onClick={downloadPNG} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
                <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Calculate to see breakdown</h3>
                <p className="text-muted-foreground">Detailed insights await your prediction</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {savedResults.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Predictions</h3>
              {savedResults.slice().reverse().map((result, index) => (
                <Card key={index} className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">Rank: {result.rank.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          KCET: {result.cet}/180 | PUC: {result.puc}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Range: {result.range} | Percentile: {result.percentile}%
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-white border-gray-300 text-gray-700">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
                <p className="text-muted-foreground">Calculate your rank to track progress!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disclaimer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Estimate Only:</strong> This tool provides rank predictions based on historical KCET data (2023–2025, ~3.12 lakh candidates). It is not an official KEA result.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Accuracy Limitations:</strong> Predictions may vary due to score normalization, exam difficulty, or KEA policy changes.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Eligibility Restrictions:</strong> Per KEA 2024 rules, IIT/NIT students via JEE are barred from CET counseling.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Official Source:</strong> Verify results at the official KEA website.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Data Privacy:</strong> All inputs are processed locally. No data is stored or shared.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>No Liability:</strong> Not affiliated with KEA or NTA. No responsibility for errors or decisions based on predictions.
                  </div>
                </div>
              </div>
              
              {!disclaimerAccepted && (
                <Button 
                  onClick={() => setDisclaimerAccepted(true)} 
                  className="w-full"
                  size="lg"
                >
                  Accept Disclaimer & Continue
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RankPredictor