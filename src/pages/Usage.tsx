import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  MessageSquare,
  FileText,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const usageData = [
  { date: "Mon", queries: 45, cost: 0.89, tokens: 12500 },
  { date: "Tue", queries: 67, cost: 1.32, tokens: 18700 },
  { date: "Wed", queries: 52, cost: 1.05, tokens: 14200 },
  { date: "Thu", queries: 89, cost: 1.78, tokens: 24100 },
  { date: "Fri", queries: 73, cost: 1.46, tokens: 19800 },
  { date: "Sat", queries: 34, cost: 0.68, tokens: 9200 },
  { date: "Sun", queries: 28, cost: 0.56, tokens: 7600 },
];

const modelBreakdown = [
  { name: "Gemini 2.5 Flash", value: 45, color: "hsl(var(--primary))" },
  { name: "GPT-5 Mini", value: 25, color: "hsl(var(--accent))" },
  { name: "Claude Sonnet", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Gemini 2.5 Pro", value: 12, color: "hsl(var(--chart-4))" },
];

const featureUsage = [
  { feature: "Chat", queries: 234, icon: MessageSquare },
  { feature: "Research", queries: 156, icon: Search },
  { feature: "Documents", queries: 89, icon: FileText },
  { feature: "Sandbox", queries: 45, icon: Cpu },
];

const monthlySpending = [
  { month: "Aug", spent: 12.5 },
  { month: "Sep", spent: 18.3 },
  { month: "Oct", spent: 24.1 },
  { month: "Nov", spent: 31.7 },
  { month: "Dec", spent: 28.9 },
  { month: "Jan", spent: 15.4 },
];

export default function Usage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const totalQueries = usageData.reduce((sum, d) => sum + d.queries, 0);
  const totalCost = usageData.reduce((sum, d) => sum + d.cost, 0);
  const totalTokens = usageData.reduce((sum, d) => sum + d.tokens, 0);
  const avgCostPerQuery = totalCost / totalQueries;

  return (
    <>
      <Helmet>
        <title>Usage & Cost - Proxinex</title>
        <meta name="description" content="Track your AI usage and costs" />
      </Helmet>

      <div className="h-screen bg-background flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar flex flex-col flex-shrink-0 transition-all duration-300`}>
          <div className="h-16 border-b border-sidebar-border flex items-center px-4 flex-shrink-0">
            <Link to="/">
              <Logo size="sm" showText={!sidebarCollapsed} />
            </Link>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            <Link
              to="/app"
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              {!sidebarCollapsed && <span className="text-sm">Back to Chat</span>}
            </Link>

            <div className="my-4 border-t border-sidebar-border" />

            {!sidebarCollapsed && (
              <div className="px-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">QUICK STATS</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-sidebar-accent/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">This Month</div>
                    <div className="text-lg font-semibold text-foreground">₹{totalCost.toFixed(2)}</div>
                    <div className="text-xs text-success flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      12% less than last month
                    </div>
                  </div>
                  <div className="p-3 bg-sidebar-accent/50 rounded-lg">
                    <div className="text-xs text-muted-foreground">Total Queries</div>
                    <div className="text-lg font-semibold text-foreground">{totalQueries}</div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-12 border-t border-sidebar-border flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <AppHeader
            title="Usage & Cost"
            subtitle="Track your AI usage and spending"
            icon={<BarChart3 className="h-4 w-4 text-primary" />}
          >
            <div className="flex items-center gap-3 ml-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">This year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </AppHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-success flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">{totalQueries}</div>
                <div className="text-sm text-muted-foreground">Total Queries</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-xs text-success flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" />
                    -8%
                  </span>
                </div>
                <div className="text-2xl font-bold text-foreground">₹{totalCost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-chart-3/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-chart-3" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{(totalTokens / 1000).toFixed(1)}K</div>
                <div className="text-sm text-muted-foreground">Tokens Used</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-chart-4/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-chart-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">₹{avgCostPerQuery.toFixed(3)}</div>
                <div className="text-sm text-muted-foreground">Avg. Cost/Query</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Usage Trend */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-4">Usage Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData}>
                      <defs>
                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="queries"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorQueries)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Spending Trend */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-4">Monthly Spending</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`₹${value.toFixed(2)}`, "Spent"]}
                      />
                      <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Model Breakdown */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-4">Model Usage</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {modelBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Usage"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {modelBreakdown.map((model) => (
                    <div key={model.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: model.color }} />
                        <span className="text-muted-foreground">{model.name}</span>
                      </div>
                      <span className="text-foreground font-medium">{model.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Usage */}
              <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
                <h3 className="font-semibold text-foreground mb-4">Feature Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  {featureUsage.map((feature) => (
                    <div
                      key={feature.feature}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">{feature.queries}</div>
                        <div className="text-sm text-muted-foreground">{feature.feature}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily breakdown */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Daily Breakdown</h4>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={usageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="cost"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
