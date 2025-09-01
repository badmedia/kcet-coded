import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

const RoundTracker = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Round Tracker & Alerts</h1>
        <p className="text-muted-foreground">Stay updated with KCET counseling rounds and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature will provide real-time updates on KCET counseling rounds, 
            seat allotments, and important notifications.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoundTracker