import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

const Reviews = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">College Reviews</h1>
        <p className="text-muted-foreground">Student reviews and ratings for KCET colleges</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature will allow students to read and write verified reviews 
            about colleges, placements, faculty, and campus life.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reviews