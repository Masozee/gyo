"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  AudioWaveform,
  BookOpen,
  Command,
  Frame,
  GalleryVerticalEnd,
  House,
  Map,
  PieChart,
  Globe,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  ShoppingCart,
  Wallet,
  Receipt,
  Folder,
  Calendar,
  CalendarDays,
  ChartColumnStacked,
  FileKey2,
  ListTodo,
  Bolt,
  CircleHelp,
  LucideMessageCircleQuestion,
  Mail,
  Wrench,
  Package,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navWorkspace: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: House,
    },
    {
      title: "Projects",
      url: "/admin/projects",
      icon: Folder,
      items: [
        {
          title: "All Projects",
          url: "/admin/projects",
        },
        {
          title: "On Going",
          url: "/admin/projects?status=IN_PROGRESS",
        },
        {
          title: "Archived",
          url: "/admin/projects?status=COMPLETED",
        },
        
      ],
    },
    {
      title: "Tasks",
      url: "/admin/tasks",
      icon: ListTodo,
      items: [
        {
          title: "All Tasks",
          url: "/admin/tasks",
        },
        {
          title: "Active Tasks",
          url: "/admin/tasks?status=TODO,IN_PROGRESS,IN_REVIEW",
        },
        {
          title: "Completed",
          url: "/admin/tasks?status=DONE",
        },
      ],
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: Users,
    },
    {
      title: "Schedule",
      url: "/admin/schedule",
      icon: CalendarDays,
    },
    {
      title: "Mail",
      url: "/admin/mail",
      icon: Mail,
      items: [
        {
          title: "Inbox",
          url: "/admin/mail/inbox",
        },
        {
          title: "Sent",
          url: "/admin/mail/sent",
        },
        {
          title: "Drafts",
          url: "/admin/mail/drafts",
        },
        {
          title: "Spam",
          url: "/admin/mail/spam",
        },
        {
          title: "Trash",
          url: "/admin/mail/trash",
        },
      ],
    },
    {
      title: "Tools",
      url: "/admin/tools",
      icon: Package,
    },
  ],
  navWeb: [
    {
      title: "Website",
      url: "/admin/cms",
      icon: Globe,
      items: [
        {
          title: "Pages",
          url: "/admin/cms/pages",
        },
        {
          title: "Blog",
          url: "/admin/blog",
        },
        {
          title: "Portfolio",
          url: "/admin/portfolio",
        },
        {
          title: "Media Library",
          url: "/admin/cms/media",
        },
        {
          title: "Settings",
          url: "/admin/cms/settings",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: ChartColumnStacked,
      items: [
        {
          title: "Overview",
          url: "/admin/analytics",
        },
        {
          title: "Traffic",
          url: "/admin/analytics/traffic",
        },
        {
          title: "Conversions",
          url: "/admin/analytics/conversions",
        },
      ],
    },
  ],
  navPayments: [
    {
      title: "Expenses",
      url: "/admin/expenses",
      icon: CreditCard,
      items: [
        {
          title: "All Expenses",
          url: "/admin/expenses",
        },
        {
          title: "Billable",
          url: "/admin/expenses?billable=true",
        },
        {
          title: "Reimbursed",
          url: "/admin/expenses?reimbursed=true",
        },
      ],
    },
    {
      title: "Invoices",
      url: "/admin/invoices",
      icon: Receipt,
      items: [
        {
          title: "All Invoices",
          url: "/admin/invoices",
        },
        {
          title: "Draft",
          url: "/admin/invoices?status=DRAFT",
        },
        {
          title: "Sent",
          url: "/admin/invoices?status=SENT",
        },
        {
          title: "Paid",
          url: "/admin/invoices?status=PAID",
        },
        {
          title: "Overdue",
          url: "/admin/invoices?status=OVERDUE",
        },
      ],
    },
    {
      title: "Docs & Contract",
      url: "/admin/docs",
      icon: FileText,
      items: [
        {
          title: "All Documents",
          url: "/admin/docs",
        },
        {
          title: "Contracts",
          url: "/admin/docs?type=CONTRACT",
        },
        {
          title: "Proposals",
          url: "/admin/docs?type=PROPOSAL",
        },
        {
          title: "NDAs",
          url: "/admin/docs?type=NDA",
        },
        {
          title: "Expired",
          url: "/admin/docs?status=EXPIRED",
        },
      ],
    },
    {
      title: "Licences",
      url: "#",
      icon: FileKey2,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Bolt,
    },
    {
      title: "Help",
      url: "#",
      icon: CircleHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Add isActive property based on current pathname
  const navWorkspaceWithActive = data.navWorkspace.map(item => ({
    ...item,
    isActive: item.url === pathname
  }))

  const navWebWithActive = data.navWeb.map(item => ({
    ...item,
    isActive: item.url === pathname
  }))

  const navPaymentsWithActive = data.navPayments.map(item => ({
    ...item,
    isActive: item.url === pathname
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navWorkspaceWithActive} groupLabel="Workspace" />
        <NavMain items={navWebWithActive} groupLabel="Web" />
        <NavMain items={navPaymentsWithActive} groupLabel="Payments" />
        
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
