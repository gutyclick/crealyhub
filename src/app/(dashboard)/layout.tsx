import { Sidebar } from "@/components/shell/sidebar";
export default function DashboardLayout({children}:LayoutProps<"/">){return <div className="min-h-screen lg:flex"><Sidebar/><main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">{children}</main></div>}
