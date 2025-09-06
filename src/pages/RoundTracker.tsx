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
      startDate: '2025-08-15',
      endDate: '2025-08-25',
      progress: 100,
      description: 'First round of counseling completed',
      alerts: ['All allotments have been finalized', 'Fee payment deadline has passed']
    },
    {
      id: 'round2',
      name: 'Round 2',
      status: 'active',
      startDate: '2025-08-28',
      endDate: '2025-09-05',
      progress: 85,
      description: 'Second round of counseling - Almost over',
      alerts: ['Round 2 is ending soon - Last chance to modify preferences', 'Fee payment deadline approaching']
    },
    {
      id: 'round3',
      name: 'Round 3 (Extended)',
      status: 'upcoming',
      startDate: 'TBA',
      endDate: 'TBA',
      progress: 0,
      description: 'Final round of counseling - Schedule not yet announced',
      alerts: ['Round 3 schedule not yet announced by KEA', 'This will be the last opportunity for counseling']
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
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Round</p>
                <p className="text-2xl font-bold">Round 2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Round 3 Starts In</p>
                <p className="text-2xl font-bold">
                  {timeUntilNext === 'TBA' ? 'Schedule not yet announced' : 
                   timeUntilNext ? `${timeUntilNext.days}d ${timeUntilNext.hours}h` : 'Soon'}
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
              {round.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{round.progress}%</span>
                  </div>
                  <Progress value={round.progress} className="h-2" />
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
                    <Alert key={index} className={round.status === 'active' ? 'border-orange-200 bg-orange-50' : ''}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{alert}</AlertDescription>
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
              <strong>Round 2 is ending soon!</strong> If you haven't paid your fees or want to modify your preferences, 
              do it before the deadline.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Round 3 schedule not yet announced.</strong> This will be your last opportunity for KCET counseling once announced.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-orange-600 mt-1" />
            <p className="text-sm text-orange-800">
              <strong>Stay updated:</strong> Check the official KEA website regularly for any schedule changes or announcements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoundTracker