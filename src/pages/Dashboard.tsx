import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  GraduationCap, 
  MapPin, 
  Users, 
  BarChart3, 
  Search,
  Target,
  Calculator,
  BookOpen,
  Star,
  ExternalLink
} from "lucide-react"
import { Link } from "react-router-dom"

interface DataStats {
  totalRecords: number
  totalColleges: number
  totalBranches: number
  years: { [key: string]: number }
  categories: { [key: string]: number }
  topBranches: Array<{ code: string; name: string; count: number }>
  seatTypes: { [key: string]: number }
}

interface NewsItem {
  id: string
  title: string
  image: string
  url: string
  source?: string
  publishedAt?: string
  summary?: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DataStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<NewsItem[]>([])
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/kcet_cutoffs.json')
        if (!response.ok) throw new Error('Failed to load data')
        
        const data = await response.json()
        const cutoffs = data.cutoffs || []
        
        // Calculate statistics
        const colleges = new Map()
        const branches = new Map()
        const years: { [key: string]: number } = {}
        const categories: { [key: string]: number } = {}
        const rounds: { [key: string]: number } = {}
        
        cutoffs.forEach((record: any) => {
          // Count by year
          years[record.year] = (years[record.year] || 0) + 1
          
          // Count by category
          categories[record.category] = (categories[record.category] || 0) + 1
          
          // Count by round
          rounds[record.round] = (rounds[record.round] || 0) + 1
          
          // Count colleges
          if (record.institute_code) {
            const collegeKey = record.institute_code
            colleges.set(collegeKey, {
              code: record.institute_code,
              name: record.institute,
              count: (colleges.get(collegeKey)?.count || 0) + 1
            })
          }
          
          // Count branches/courses
          if (record.course) {
            const branchKey = record.course
            branches.set(branchKey, {
              code: record.course,
              name: record.course,
              count: (branches.get(branchKey)?.count || 0) + 1
            })
          }
        })
        
        const topBranches = Array.from(branches.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        
        setStats({
          totalRecords: cutoffs.length,
          totalColleges: colleges.size,
          totalBranches: branches.size,
          years,
          categories,
          topBranches,
          seatTypes: rounds // Using rounds instead of seatTypes
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('/data/news.json')
        if (!response.ok) throw new Error('Failed to load news')
        const items: NewsItem[] = await response.json()

        // Enrich Reddit items without image using oEmbed thumbnail
        const enriched = await Promise.all(
          items.map(async (item) => {
            const needsAutoImage = !item.image || item.image === 'auto'
            const isReddit = item.url?.includes('reddit.com')
            if (needsAutoImage && isReddit) {
              try {
                const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(item.url)}`
                const res = await fetch(oembedUrl)
                if (res.ok) {
                  const data = await res.json()
                  if (data?.thumbnail_url) {
                    return { ...item, image: data.thumbnail_url }
                  }
                }
              } catch (e) {
                // ignore and fall back
              }
            }
            return { ...item, image: item.image || '/placeholder.svg' }
          })
        )

        setNews(enriched)
      } catch (err) {
        console.warn('News not available yet. Create public/data/news.json to enable.', err)
      }
    }
    loadNews()
  }, [])

  const quickActions = [
    {
      title: "Find Colleges",
      description: "Search colleges based on your rank",
      icon: Search,
      href: "/college-finder",
      color: "bg-blue-500"
    },
    {
      title: "Cutoff Explorer",
      description: "Browse and analyze cutoff trends",
      icon: BarChart3,
      href: "/cutoff-explorer",
      color: "bg-green-500"
    },
    {
      title: "Rank Predictor",
      description: "Predict your rank from marks",
      icon: Calculator,
      href: "/rank-predictor",
      color: "bg-purple-500"
    },
    {
      title: "Mock Simulator",
      description: "Simulate seat allotment",
      icon: Target,
      href: "/mock-simulator",
      color: "bg-orange-500"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground/70 mt-2">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">KCET Coded Dashboard</h1>
          <p className="text-foreground/80">Your comprehensive guide to KCET admissions</p>
      </div>

      {/* Disclaimer */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <p className="text-sm text-slate-300">
            <strong className="text-slate-200">Disclaimer:</strong> This is an independent project and is not affiliated with r/kcet community or its moderation team in any way.
          </p>
        </CardContent>
      </Card>

      {/* News - Primary section */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Star className="h-5 w-5" />
              KCET News & Updates
            </CardTitle>
            <Badge variant="secondary">Latest</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* YouTube Video - First Item */}
            <a href="https://www.youtube.com/watch?v=yjZxYpOBIVg" target="_blank" rel="noreferrer" className="block group">
              <div className="relative overflow-hidden rounded-none border-2 border-foreground/30 bg-card shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <img
                  src="/images/kea-ugcet-2025-thumbnail.png"
                  alt="KCET 2025 Important Updates - YouTube Video"
                  className="w-full h-[300px] object-cover group-hover:scale-[1.02] transition-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <span className="px-2 py-0.5 bg-red-600/80">YouTube</span>
                    <span className="opacity-80">Latest Update</span>
                  </div>
                  <h3 className="mt-1 text-white text-xl font-extrabold leading-snug tracking-tight">
                    KCET 2025 Important Updates & Guidelines
                  </h3>
                </div>
              </div>
            </a>

            {/* Detailed Summary Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">📢 KEA Round 3 Counselling - Complete Guide</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    {isSummaryExpanded ? 'Show Less' : 'Expand to view full details'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">by u/upbeat-sign-7525</span>
                  <a 
                    href="https://www.reddit.com/r/kcet/comments/1n9y0ta/kea_round_3_counselling_announcement_as_per_new/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                  >
                    View Original Post
                  </a>
                </div>
              </div>
              
              {isSummaryExpanded ? (
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                  {/* Schedule */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🕒 ROUND 3 SCHEDULE:</div>
                    <div className="ml-4 space-y-1">
                      <div>• 🪑 Seat Matrix: 06 Sept</div>
                      <div>• 💰 Caution Deposit Payment: 06 – 08 Sept (till 1 PM)</div>
                      <div>• 📝 Option Entry/Modify/Delete: 06 Sept (4 PM) – 08 Sept (2 PM)</div>
                      <div>• ❌ Seat Surrender (Round 1 & 2): On/Before 08 Sept, 1 PM (₹5,000 deducted)</div>
                    </div>
                  </div>

                  {/* Why 3rd Round */}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">📌 Why a 3rd Round?</div>
                    <div className="ml-4 space-y-1">
                      <div>• <strong>MCC Delay:</strong> MCC (Medical Counselling Committee) hasn't completed 2nd Round results for Medical/Dental, blocking these seats</div>
                      <div>• <strong>Course Stuck:</strong> Other courses (Engg/AYUSH/Vet) can't wait for MCC. KEA must move forward</div>
                      <div>• <strong>Legal Window:</strong> AICTE allows states to conduct counseling up to 10 days before cut-off. KEA had requested extension but no reply yet</div>
                      <div>• <strong>Private College Agreement:</strong> KEA must return unfilled private seats to colleges by Sept 10. This forced the round</div>
                      <div>• <strong>AICTE Status:</strong> AICTE has not yet replied to KEA's request for deadline extension</div>
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">👥 Who is Eligible?</div>
                    <div className="ml-4 space-y-3">
                      <div><strong>✅ Choice 2 candidates:</strong> Paid fees earlier, waiting for upgrade. Can re-arrange, delete, or add new colleges (except Medical/Dental). No fresh option entry required.</div>
                      <div><strong>✅ Choice 3 candidates:</strong> Paid ₹10,000 (Engg) or ₹1 lakh (Medical). Can re-enter options. No fresh option entry required.</div>
                      <div><strong>✅ Left-out candidates (MUST pay ₹10,000 caution deposit):</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          <div>• Did not select any choice in Round 1 & 2</div>
                          <div>• Selected Choice 2 but didn't pay the fee</div>
                          <div>• Selected Choice 3 but didn't pay caution deposit</div>
                          <div>• Seat unallotted candidates</div>
                          <div>• <strong>KITHBISAKIRO CANDIDATES CAN COMEBACK</strong></div>
                        </div>
                      </div>
                      <div><strong>❌ Choice 1 (confirmed & joined):</strong> Already admitted. Out of counseling</div>
                    </div>
                  </div>

                  {/* Engineering & Professional Courses */}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🎓 Engineering & Professional Courses</div>
                    <div className="ml-4 space-y-1">
                      <div>• ~8,000 seats left after Round 2</div>
                      <div>• Fresh colleges/courses can be added</div>
                      <div>• 17 Govt. Engineering Colleges with 50% fee concession</div>
                      <div>• Fees as low as ₹20k–25k/year in govt colleges</div>
                      <div>• <strong>KEA Advice:</strong> Don't waste your rank by keeping limited options</div>
                    </div>
                  </div>

                  {/* Medical & Dental */}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🩺 Medical & Dental Courses</div>
                    <div className="ml-4 space-y-2">
                      <div><strong>Option Entry Portal:</strong> Enabled for Choice 2 & 3 candidates who have done option entry till 26-08-2025, 1:00 PM</div>
                      <div><strong>Seat Increases:</strong> 8 Govt. Medical Colleges got +50 seats each (officially added in matrix)</div>
                      <div><strong>Newly Added Colleges:</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          <div>• BGS Dental</div>
                          <div>• Farooki Dental (40 seats at Farookia Dental College, Mysuru)</div>
                          <div>• JNMC Medical (12 medical seats at JNMC College, Belagavi)</div>
                          <div>• BGS Global Dental College (50 seats)</div>
                        </div>
                      </div>
                      <div><strong>NRI Quota (first time ever):</strong> 51 NRI seats introduced across 8 govt. colleges at ₹25 lakh/year. If NRI seats remain vacant, they will go to "Others" at same fee</div>
                      <div><strong>Option Entry Rules:</strong>
                        <div className="ml-4 mt-1 space-y-1">
                          <div>• No fresh option entry or new college addition allowed (except newly released colleges)</div>
                          <div>• Candidates can modify/rearrange/delete existing options</div>
                          <div>• 8000 virtual vacancies will be allotted to new seats of that 8 colleges</div>
                          <div>• NRI category candidates (Round 1 admitted) and others may add 8 newly added NRI seats</div>
                        </div>
                      </div>
                      <div><strong>Choice 3 Medical Candidates:</strong> 64 students paid ₹1 lakh but didn't press "Agree" button earlier. KEA will now consider them</div>
                      <div><strong>MCC Update:</strong> If MCC releases results on 12th September, KEA will provide quit option and re-run allotment (Unlikely as per current updates - KEA is doubtful of MCC results won't be out on 12th Sept)</div>
                    </div>
                  </div>

                  {/* Nursing & BNYS */}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🧘 Nursing & BNYS (Yoga/Naturopathy)</div>
                    <div className="ml-4 space-y-1">
                      <div>• Round 3 will have only Government seat allotments</div>
                      <div>• No private quota allotments in these courses</div>
                    </div>
                  </div>

                  {/* Critical Rules */}
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                    <div className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ CRITICAL RULES & WARNINGS</div>
                    <div className="ml-4 space-y-1">
                      <div>• <strong>If allotted in Round 3 → Admission is COMPULSORY</strong></div>
                      <div>• No further upgrades, no withdrawal</div>
                      <div>• Rejecting/Skipping seat = Heavy penalty:</div>
                      <div className="ml-4">- Deposit forfeited</div>
                      <div className="ml-4">- Candidate barred from 2026 KEA counseling</div>
                      <div>• <strong>Enter only those colleges/courses where you are ready to join</strong></div>
                    </div>
                  </div>

                  {/* New Course Approval */}
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <div className="font-semibold text-green-900 dark:text-green-100 mb-2">📢 New Course Approval</div>
                    <div className="ml-4">
                      <div><strong>Institution:</strong> Visvesvaraya Technological University (VTU) CPGS, Kalaburagi</div>
                      <div><strong>Programme:</strong> B.Tech Mechanical Engineering</div>
                      <div><strong>Intake:</strong> 60 seats</div>
                      <div><strong>Academic Year:</strong> From 2025–26 onwards</div>
                    </div>
                  </div>

                  {/* Final Note */}
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                    <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">📝 Final Note</div>
                    <div className="ml-4">
                      <div>• Schedule may change if AICTE extends the deadline</div>
                      <div>• KEA has informed private colleges that remaining seats will be surrendered 5 days before the deadline</div>
                      <div>• <strong>Important:</strong> Round 3 allotted candidates must compulsorily join the allotted college</div>
                      <div>• If you don't join, the caution deposit will be forfeited and you will be barred from participating in next year's counselling</div>
                      <div>• <strong>👉 Enter only those colleges/courses where you are ready to join</strong></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="mb-3 font-semibold">
                    🚨 KEA has officially announced the 3rd Round of UG counseling for Medical, Dental, Engineering, AYUSH, Veterinary, Nursing, BNYS and other professional courses.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🕒 SCHEDULE:</div>
                      <div className="text-xs space-y-1">
                        <div>• Seat Matrix: 06 Sept | Caution Deposit: 06-08 Sept (till 1 PM)</div>
                        <div>• Option Entry: 06 Sept (4 PM) – 08 Sept (2 PM)</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">👥 ELIGIBILITY:</div>
                      <div className="ml-4 space-y-1 text-xs">
                        <div>• <strong>Choice 2:</strong> Can re-arrange, delete, or add options (except Medical/Dental)</div>
                        <div>• <strong>Choice 3:</strong> Can re-enter options (paid ₹10k/₹1L)</div>
                        <div>• <strong>Left-out candidates:</strong> Must pay ₹10,000 caution deposit</div>
                      </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                      <div className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ CRITICAL WARNING:</div>
                      <div className="text-xs">
                        <strong>If allotted in Round 3, admission is COMPULSORY. Rejecting = Deposit forfeited + Barred from 2026 counseling.</strong>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mb-2">🎓 KEY UPDATES:</div>
                      <div className="ml-4 space-y-1 text-xs">
                        <div>• Engineering: ~8,000 seats vacant, fresh entry allowed</div>
                        <div>• Medical: 8 govt colleges got +50 seats each, NRI quota introduced</div>
                        <div>• Nursing/BNYS: Only Govt quota seats in Round 3</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Reddit Community */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">r/</span>
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">KCET Community</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">Visit r/kcet for more answers and discussions</p>
              </div>
            </div>
            <Button 
              asChild 
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <a 
                href="https://www.reddit.com/r/kcet/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Reddit
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-foreground/70">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Data Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <TrendingUp className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-foreground/70">
                Cutoff entries across all years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colleges</CardTitle>
              <GraduationCap className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalColleges}</div>
              <p className="text-xs text-foreground/70">
                Engineering colleges covered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Branches</CardTitle>
              <BookOpen className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBranches}</div>
              <p className="text-xs text-foreground/70">
                Engineering branches available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Years</CardTitle>
              <BarChart3 className="h-4 w-4 text-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.years).length}</div>
              <p className="text-xs text-foreground/70">
                Years of data available
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Statistics */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Year-wise Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.years)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([year, count]) => (
                    <div key={year} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{year}</span>
                        <span className="text-foreground/70">{count.toLocaleString()} records</span>
                      </div>
                      <Progress 
                        value={(count / stats.totalRecords) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.categories)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{category}</Badge>
                        <span className="text-sm">{count.toLocaleString()}</span>
                      </div>
                      <span className="text-sm text-foreground/70">
                        {((count / stats.totalRecords) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>


          {/* Top Branches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Top Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topBranches.map((branch, index) => (
                  <div key={branch.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{branch.name}</div>
                        <div className="text-xs text-foreground/70">{branch.code}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{branch.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* End News */}
    </div>
  )
}

export default Dashboard