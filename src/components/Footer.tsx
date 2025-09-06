import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Heart, Users } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Project Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">KCET Coded</h3>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                    BETA
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  An independent project to help KCET aspirants with comprehensive admission guidance, 
                  cutoff analysis, and college finder tools.
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>Made with love for the KCET community</span>
                </div>
              </div>

              {/* Credits & Attribution */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Credits & Data Sources</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Karnataka Examination Authority (KEA)</strong> - Official cutoff data
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">r/kcet Community</strong> - Insights and discussions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-gray-500" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Open Source</strong> - Built with React, TypeScript, and Tailwind CSS
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Links */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Important Links</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <a 
                      href="https://cetonline.karnataka.gov.in/kea/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      Official KEA Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <a 
                      href="https://www.reddit.com/r/kcet/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      r/kcet Community
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <a 
                      href="https://github.com/your-repo/kcet-compass" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      Source Code
                      <Github className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong className="text-amber-900 dark:text-amber-100">⚠️ Important Disclaimer:</strong> This is an independent project and is not affiliated with the Karnataka Examination Authority (KEA), r/kcet community, or its moderation team. All data is provided for informational purposes only. Please verify all information with official sources before making any admission decisions.
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 KCET Coded. Built for the KCET community. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </footer>
  );
}
