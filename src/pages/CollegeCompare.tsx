import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const CollegeCompare = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">College Compare</h1>
        <p className="text-muted-foreground">Contrast colleges side-by-side with cutoffs, fees, and ratings.</p>
      </div>

      <Card className="rounded-none border-2 shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)]">
        <CardHeader>
          <CardTitle>Pick Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-muted" />
            <div className="h-32 bg-muted" />
          </div>
          <Separator className="my-6" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48 bg-muted" />
            <div className="h-48 bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CollegeCompare


