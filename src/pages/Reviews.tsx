import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction, Clock, Star } from "lucide-react"

const Reviews = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">College Reviews</h1>
        <p className="text-muted-foreground">Student reviews and ratings for KCET colleges</p>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Construction className="h-5 w-5" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-orange-800">
            <Clock className="h-5 w-5" />
            <p className="font-medium">This feature is currently under development and will be rolling out soon.</p>
          </div>
          <p className="text-sm text-orange-700">
            College Reviews will allow students to read and write verified reviews about colleges, 
            placements, faculty, campus life, and other important aspects.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reviews