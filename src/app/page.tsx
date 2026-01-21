import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Logo } from '@/components/logo'
import { 
  Sparkles, 
  Target, 
  Trophy, 
  ChevronRight,
  GitBranch,
  BarChart3,
  Users,
  Star
} from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/tree')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-[#0a0f1a] dark:via-[#0d1321] dark:to-[#0a1628] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50 dark:opacity-30" />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <nav className="max-w-6xl mx-auto px-6 py-3 rounded-2xl bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20">
            <div className="flex items-center justify-between">
              <Logo size={40} showText />

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  How It Works
                </a>
                <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  Testimonials
                </a>
              </div>

              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <Link
                  href="/sign-in"
                  className="hidden sm:flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                Transform how you achieve goals
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
              Your goals,{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  visualized
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#06b6d4"/>
                      <stop offset="1" stopColor="#34d399"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Map your ambitions as an interactive skill tree. 
              <span className="text-gray-800 dark:text-gray-200 font-medium"> Unlock achievements</span>, 
              track progress, and 
              <span className="text-gray-800 dark:text-gray-200 font-medium"> level up your life</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/sign-in"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-lg shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-1"
              >
                Start Building Your Tree
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
              </Link>
              
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-semibold text-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                See How It Works
              </a>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-3xl blur-3xl" />
              <div className="relative p-2 rounded-3xl bg-gradient-to-r from-cyan-500/50 to-emerald-500/50">
                <div className="rounded-2xl bg-white/90 dark:bg-[#0f1729]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100/80 dark:bg-black/20 border-b border-gray-200 dark:border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">LifeTree Canvas</span>
                  </div>
                  <div className="relative h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0f1a] dark:to-[#111827]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
                    
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="font-semibold text-emerald-300">My Life Goals</span>
                      </div>
                    </div>
                    
                    <svg className="absolute top-[42%] left-1/2 -translate-x-1/2 w-32 h-16" viewBox="0 0 128 64">
                      <path d="M64 0 L32 64 M64 0 L96 64" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
                    </svg>
                    
                    <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 px-5 py-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium text-cyan-300 text-sm">Learn Piano</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-1/4 left-2/3 px-5 py-3 rounded-xl bg-gray-800/50 dark:bg-gray-700/50 border-2 border-gray-500 opacity-60">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-400 text-sm">Run Marathon</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-white/10">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">2 goals completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to <span className="text-cyan-500">succeed</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful features designed to help you visualize, track, and achieve your goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: GitBranch,
                title: 'Infinite Canvas',
                description: 'Pan and zoom freely. Your goals deserve unlimited space to grow and branch out.',
                gradient: 'from-cyan-500 to-blue-500',
                bgGlow: 'bg-cyan-500/10',
              },
              {
                icon: Target,
                title: 'Smart Dependencies',
                description: 'Create prerequisites between goals. Unlock paths as you complete milestones.',
                gradient: 'from-emerald-500 to-teal-500',
                bgGlow: 'bg-emerald-500/10',
              },
              {
                icon: Trophy,
                title: 'Gamified Progress',
                description: 'Celebrate achievements with visual rewards. Track your journey to success.',
                gradient: 'from-amber-500 to-orange-500',
                bgGlow: 'bg-amber-500/10',
              },
              {
                icon: BarChart3,
                title: 'Progress Analytics',
                description: 'Visual insights into your progress. See patterns and optimize your workflow.',
                gradient: 'from-violet-500 to-purple-500',
                bgGlow: 'bg-violet-500/10',
              },
              {
                icon: Sparkles,
                title: 'Priority Levels',
                description: 'Mark goals as high, medium, or low priority. Focus on what matters most.',
                gradient: 'from-pink-500 to-rose-500',
                bgGlow: 'bg-pink-500/10',
              },
              {
                icon: Users,
                title: 'Share Progress',
                description: 'Share your skill tree with friends and mentors. Get accountability and support.',
                gradient: 'from-indigo-500 to-blue-500',
                bgGlow: 'bg-indigo-500/10',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 rounded-2xl ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How it <span className="text-emerald-500">works</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in minutes with our intuitive interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Tree',
                description: 'Start with your main life goal and branch out into sub-goals.',
              },
              {
                step: '02',
                title: 'Set Dependencies',
                description: 'Connect goals to create a roadmap. Some goals unlock others.',
              },
              {
                step: '03',
                title: 'Track & Celebrate',
                description: 'Mark goals complete and watch your tree flourish with progress.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-cyan-500/10 dark:text-cyan-500/5 absolute -top-4 left-0">
                  {item.step}
                </div>
                <div className="relative pt-12 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by <span className="text-cyan-500">achievers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "LifeTree changed how I think about goals. The visual representation makes complex goals feel achievable.",
                author: "Sarah K.",
                role: "Product Designer",
              },
              {
                quote: "Finally, a tool that gamifies productivity without being childish. The dependency system is genius.",
                author: "Mike R.",
                role: "Software Engineer",
              },
              {
                quote: "I've tried dozens of goal apps. This is the first one that actually stuck. Love the skill tree concept!",
                author: "Emma L.",
                role: "Entrepreneur",
              },
            ].map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-r from-cyan-500 to-emerald-500 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
            <div className="relative text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to visualize your success?
              </h2>
              <p className="text-cyan-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of goal-setters who are achieving more with LifeTree.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-cyan-600 font-semibold text-lg hover:bg-cyan-50 transition-colors shadow-xl"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-gray-200 dark:border-white/10 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size={32} showText />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Built for dreamers, doers, and lifelong learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
