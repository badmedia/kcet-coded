import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  ArrowRight,
  Timer
} from "lucide-react"

interface RoundStatus {
  id: string
  name: string
  status: 'completed' | 'active' | 'upcoming' | 'cancelled'
  startDate: string
  endDate: string
  progress: number
  description: string
  alerts: string[]
}

const RoundTracker = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [rounds, setRounds] = useState<RoundStatus[]>([
    {
      id: 'round1',
      name: 'Round 1',
      status: 'completed',
      startDate: '2025-07-08',
      endDate: '2025-08-15',
      progress: 100,
      description: 'First round of counseling completed - Option entry: July 8-29, Final results: August 2',
      alerts: ['All allotments have been finalized', 'Fee payment deadline has passed', 'Last date to report to colleges: August 15, 2025']
    },
    {
      id: 'round2',
      name: 'Round 2',
      status: 'completed',
      startDate: '2025-08-21',
      endDate: '2025-09-04',
      progress: 100,
      description: 'Second round of counseling completed - Option entry: August 21-26, Final results: August 30',
      alerts: ['Round 2 has concluded', 'Final seat allotment declared on August 30, 2025', 'Last date to report to colleges: September 4, 2025']
    },
    {
      id: 'round3',
      name: 'Round 3 (Extended)',
      status: 'active',
      startDate: '2025-09-06',
      endDate: '2025-09-08',
      progress: 25,
      description: 'Final round of counseling - Option entry: Sep 6-8, 2025 (4:00 PM on Sep 6 to 2:00 PM on Sep 8)',
      alerts: ['Seat matrix and fee details published on Sep 6, 2025', 'Caution deposit payment: Sep 6-8, 2025 (till 1:00 PM)', 'Option entry period: Sep 6 (4:00 PM) to Sep 8 (2:00 PM)', 'Seat cancellation deadline: Sep 8, 2025 (1:00 PM)', 'KITHIBISAKIRO candidates can comeback - must pay ₹10,000 caution deposit', 'Nursing/Yoga courses: Only Government seats in Round 3', 'Medical/Dental: Only re-arrangements allowed (except new colleges)']
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'upcoming':
        return <Calendar className="h-5 w-5 text-orange-500" />
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>
      case 'upcoming':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Upcoming</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (dateString === 'TBA') {
      return 'To be announced'
    }
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTimeUntilNextRound = () => {
    const nextRound = rounds.find(round => round.status === 'upcoming')
    if (!nextRound) return null

    // Check if schedule is not yet announced
    if (nextRound.startDate === 'TBA' || nextRound.endDate === 'TBA') {
      return 'TBA'
    }

    const nextRoundDate = new Date(nextRound.startDate)
    const now = currentTime
    const diff = nextRoundDate.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes }
  }

  const timeUntilNext = getTimeUntilNextRound()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Round Tracker & Alerts</h1>
        <p className="text-muted-foreground">Stay updated with KCET counseling rounds and notifications</p>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Latest Completed Round</p>
                <p className="text-2xl font-bold">Round 2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Round</p>
                <p className="text-2xl font-bold text-blue-600">
                  Round 3 - Started
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Round Status Cards */}
      <div className="space-y-4">
        {rounds.map((round) => (
          <Card key={round.id} className={`${round.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(round.status)}
                  <div>
                    <CardTitle className="text-xl">{round.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{round.description}</p>
                  </div>
                </div>
                {getStatusBadge(round.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {(round.status === 'active' || round.status === 'completed') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Progress</span>
                    <span className="text-foreground font-semibold">{round.progress}%</span>
                  </div>
                  <Progress value={round.progress} className="h-3" />
                  <div className="text-xs text-muted-foreground">
                    {round.status === 'completed' ? 'Round completed successfully' : 'Round in progress'}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm">{formatDate(round.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm">{formatDate(round.endDate)}</p>
                </div>
              </div>


              {/* Alerts */}
              {round.alerts.length > 0 && (
                <div className="space-y-2">
                  {round.alerts.map((alert, index) => (
                    <Alert key={index} className={round.status === 'active' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800' : 'border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700'}>
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <AlertDescription className="text-sm text-slate-900 dark:text-slate-100 font-medium">{alert}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Important Notices */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Bell className="h-5 w-5" />
            Important Notices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Round 2 has concluded!</strong> Final seat allotment results were declared on August 30, 2025. 
              All students should have reported to their allotted colleges by September 4, 2025.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Round 3 is now active!</strong> Option entry period: September 6 (4:00 PM) to September 8 (2:00 PM), 2025.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Important deadlines:</strong> Caution deposit payment till September 8 (1:00 PM), seat cancellation deadline September 8 (1:00 PM).
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Eligibility:</strong> Choice 2 & 3 candidates can modify options. KITHIBISAKIRO candidates (no choices in R1&R2) must pay ₹10,000 caution deposit.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>New courses:</strong> B.Tech Mechanical Engineering at VTU CPGS, Kalaburagi (60 seats) now available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoundTracker