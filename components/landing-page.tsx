import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, PieChart, LineChart, DollarSign, Shield } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <DollarSign className="h-6 w-6" />
          <span>FinanceTrack</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Take Control of Your Finances
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Track expenses, monitor income, and visualize your financial health with our comprehensive
                    management system.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Expense Tracking</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Categorize and monitor all your expenses in one place.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <PieChart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Budget Analysis</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Visualize spending patterns and identify saving opportunities.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <LineChart className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Financial Reports</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Generate detailed reports to track your financial progress.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                    <Shield className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-bold">Secure Storage</h3>
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Keep your financial data safe with our secure platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 FinanceTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
