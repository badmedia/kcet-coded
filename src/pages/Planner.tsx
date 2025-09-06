import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

const Planner = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Blurred Background Content */}
      <div className={`transition-all duration-300 ${showPopup ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-slate-800">Option Entry Planner</h1>
            <p className="text-lg text-slate-600">Plan your KCET option entries strategically</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Rank Analysis</h3>
                <p className="text-slate-600">Analyze your rank and find suitable colleges</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Option Entry</h3>
                <p className="text-slate-600">Plan and prioritize your college choices</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Mock Allotment</h3>
                <p className="text-slate-600">Simulate your allotment results</p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Development Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Construction className="h-8 w-8 text-orange-600" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Under Development</h2>
                <p className="text-slate-600">
                  The Option Entry Planner is currently being developed and will be available soon.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  This feature will help you:
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Analyze your rank and find suitable colleges</li>
                  <li>• Plan and prioritize your option entries</li>
                  <li>• Simulate mock allotment results</li>
                  <li>• Get strategic recommendations</li>
                </ul>
              </div>

              <Button 
                onClick={() => setShowPopup(false)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Got it, show me anyway
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Planner;