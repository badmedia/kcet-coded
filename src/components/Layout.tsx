import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Settings } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-background/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">KCET Coded</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                    BETA
                  </Badge>
                </div>
                <p className="text-sm text-foreground/70">KCET Helping Hub</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        
        {/* Watermark - Global (subtle, blurred glass) */}
        <div 
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 40,
            padding: '8px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.95)',
            background: 'linear-gradient( to top left, rgba(255,255,255,0.08), rgba(255,255,255,0.02) )',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
          }}
        >
          <span style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.25))' }}>❤️</span>
          <span style={{ letterSpacing: 0.2, textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}>by u/Elegant_Compote9073</span>
        </div>
      </div>
    </SidebarProvider>
  )
}