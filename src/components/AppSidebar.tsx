import { Calculator, Search, Target, Shuffle, Bell, Table, GitCompare, FileText, DollarSign, BarChart3, BookOpen, Star, Home, FileSpreadsheet, ClipboardList, ExternalLink } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Rank Predictor", url: "/rank-predictor", icon: Calculator },
  { title: "Cutoff Explorer", url: "/cutoff-explorer", icon: Search },
  { title: "College Finder", url: "/college-finder", icon: Target },
  { title: "Mock Simulator", url: "/mock-simulator", icon: Shuffle },
  { title: "Round Tracker", url: "/round-tracker", icon: Bell },
  { title: "Seat Matrix", url: "/seat-matrix", icon: Table },
  { title: "College Compare", url: "/college-compare", icon: GitCompare },
  { title: "Planner", url: "/planner", icon: ClipboardList },
  { title: "Documents", url: "/documents", icon: FileText },
  { title: "Fee Calculator", url: "/fee-calculator", icon: DollarSign },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Strategy Guide", url: "/strategy", icon: BookOpen },
  { title: "Reviews", url: "/reviews", icon: Star },
  { title: "XLSX Demo", url: "/xlsx-demo", icon: FileSpreadsheet },
  { title: "Reddit Community", url: "https://www.reddit.com/r/kcet/", icon: ExternalLink, external: true },
]

export function AppSidebar() {
  const { state } = useSidebar()

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            {state !== "collapsed" && "KCET Coded"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {state !== "collapsed" && <span className="truncate">{item.title}</span>}
                      </a>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => 
                          `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sidebar-foreground ${
                            isActive 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {state !== "collapsed" && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}