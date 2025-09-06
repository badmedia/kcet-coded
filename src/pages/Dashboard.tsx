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
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">KCET Coded Dashboard</h1>
        <p className="text-muted-foreground">Your comprehensive guide to KCET admissions</p>
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
          {news.length > 0 ? (
            <div className="space-y-4">
              {/* Single Hero news item only */}
              <a href={news[0].url} target="_blank" rel="noreferrer" className="block group">
                <div className="relative overflow-hidden rounded-none border-2 border-foreground/30 bg-card shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <img
                    src={news[0].image}
                    alt={news[0].title}
                    className="w-full h-[300px] object-cover group-hover:scale-[1.02] transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      {news[0].source && <span className="px-2 py-0.5 bg-black/50">{news[0].source}</span>}
                      {news[0].publishedAt && <span className="opacity-80">{news[0].publishedAt}</span>}
                    </div>
                    <h3 className="mt-1 text-white text-xl font-extrabold leading-snug tracking-tight">
                      {news[0].title}
                    </h3>
                  </div>
                </div>
              </a>
              
              {/* Summary below the news card */}
              {news[0].summary && (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">📋 Detailed Summary:</h4>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">by u/upbeat-sign-7525</span>
                      <a 
                        href="https://www.reddit.com/r/kcet/comments/1n9y0ta/kea_round_3_counselling_announcement_as_per_new/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors"
                      >
                        View Original Post
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      {isSummaryExpanded ? 'Show Less' : 'Expand to view full details'}
                    </Button>
                  </div>
                  
                  {isSummaryExpanded ? (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                      {news[0].summary.split('\n\n').map((section, index) => {
                        if (section.trim() === '') return null;
                        
                        // Check if it's a header (contains emoji and colon)
                        if (section.includes('📌') || section.includes('👥') || section.includes('🎓') || 
                            section.includes('🩺') || section.includes('🧘') || section.includes('⚠️') || 
                            section.includes('🔑') || section.includes('🕒') || section.includes('💡')) {
                          return (
                            <div key={index} className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                              {section}
                            </div>
                          );
                        }
                        
                        // Check if it's a bullet point section
                        if (section.includes('•')) {
                          return (
                            <div key={index} className="ml-4">
                              {section.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className="mb-1">
                                  {line}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        
                        // Regular paragraph
                        return (
                          <div key={index} className="mb-2">
                            {section}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="mb-2">
                        KEA has officially moved into the 3rd Round of UG Counseling for Medical, Dental, Engineering, AYUSH, Veterinary, Nursing, and other professional courses.
                      </p>
                      <div className="space-y-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">📌 Background & Reason for 3rd Round:</div>
                        <div className="ml-4">
                          <div className="mb-1">• MCC delay: MCC hasn't released 2nd Round results, blocking Medical/Dental seats</div>
                          <div className="mb-1">• Other courses stuck: Engineering, Veterinary, AYUSH cannot wait for MCC</div>
                          <div className="mb-1">• Legal allowance: AICTE permits states to conduct rounds up to 10 days before cut-off</div>
                          <div className="mb-1">• Private college agreement: KEA must return unfilled private seats by 10th Sept</div>
                        </div>
                        
                        <div className="font-semibold text-slate-900 dark:text-slate-100">👥 Who is Eligible to Participate?</div>
                        <div className="ml-4">
                          <div className="mb-1">• Choice 1 (Confirmed & joined): You're out - already joined</div>
                          <div className="mb-1">• Choice 2 (Fee paid, waiting for upgrade): Can re-arrange, delete, or add options</div>
                          <div className="mb-1">• Choice 3 (Deposit paid): Paid ₹10,000 (engineering) or ₹1 lakh (medical) - can re-enter options</div>
                          <div className="mb-1">• Left-out/No seat candidates: Must pay ₹10,000 caution deposit to activate login</div>
                        </div>
                        
                        <div className="font-semibold text-slate-900 dark:text-slate-100">⚠️ Critical Rules & Warnings:</div>
                        <div className="ml-4">
                          <div className="mb-1">• If allotted in Round 3, admission is COMPULSORY</div>
                          <div className="mb-1">• No further upgrade, no withdrawal</div>
                          <div className="mb-1">• Rejecting seats = Caution deposit forfeited + barred from 2026 counseling</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No news yet. Add items to <code>public/data/news.json</code> to display updates with images (Reddit image URLs supported).
            </div>
          )}
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
                    <p className="text-sm text-muted-foreground">{action.description}</p>
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Cutoff entries across all years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colleges</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalColleges}</div>
              <p className="text-xs text-muted-foreground">
                Engineering colleges covered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Branches</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBranches}</div>
              <p className="text-xs text-muted-foreground">
                Engineering branches available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Years</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.years).length}</div>
              <p className="text-xs text-muted-foreground">
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
                        <span className="text-muted-foreground">{count.toLocaleString()} records</span>
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
                      <span className="text-sm text-muted-foreground">
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
                        <div className="text-xs text-muted-foreground">{branch.code}</div>
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