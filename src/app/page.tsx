import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/Navbar'
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  Users,
  ArrowRight,
  CheckCircle,
  Zap,
  BarChart3,
  Sparkles
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Get instant insights from job descriptions with advanced AI parsing'
    },
    {
      icon: Target,
      title: 'Skill Gap Tracking',
      description: 'Identify and bridge the gap between your current skills and dream job requirements'
    },
    {
      icon: BookOpen,
      title: 'Personalized Roadmaps',
      description: 'Receive customized learning paths tailored to your career goals'
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Track your progress and earn badges as you complete milestones'
    }
  ]

  const stats = [
    { label: 'Skill Match Accuracy', value: '95%', icon: Target },
    { label: 'Job Descriptions', value: '10K+', icon: Brain },
    { label: 'Learning Paths', value: '500+', icon: BookOpen },
    { label: 'AI Mentorship', value: '24/7', icon: Zap }
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Analyze Job Descriptions',
      description: 'Paste any job description and let our AI extract key requirements and skills'
    },
    {
      step: '2',
      title: 'Build Your Profile',
      description: 'Add your skills, projects, and experience to create a comprehensive profile'
    },
    {
      step: '3',
      title: 'Identify Skill Gaps',
      description: 'Compare your profile against job requirements to see where you stand'
    },
    {
      step: '4',
      title: 'Follow Your Roadmap',
      description: 'Get a personalized learning plan with resources to bridge the gaps'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(174 72% 46%) 0%, transparent 50%)',
          }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 animate-float" />
          <div className="absolute top-40 right-10 w-24 h-24 rounded-full bg-secondary/10 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-space-grotesk">
            Bridge the Gap Between
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" style={{
              backgroundImage: 'linear-gradient(to right, hsl(174 72% 46%), hsl(262 83% 65%))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}>
              {' '}Skills & Opportunities
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-powered career readiness platform that helps students bridge the gap between their current skills and dream job requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/analyzer">
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="py-1 px-3">
                  <h3 className="font-semibold text-gray-900 text-center text-sm">Analyze a Job</h3>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/profile">
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="py-1 px-3">
                  <h3 className="font-semibold text-gray-900 text-center text-sm">Build Your Profile</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4" style={{
        background: 'linear-gradient(135deg, hsl(174 72% 46%) 0%, transparent 50%)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl glass backdrop-blur-sm border-white/10">
                <stat.icon className="h-8 w-8 text-white mb-3" style={{
                  color: index === 0 ? 'hsl(174 72% 46%)' :
                  index === 1 ? 'hsl(199 89% 48%)' :
                  index === 2 ? 'hsl(262 83% 65%)' :
                  'hsl(28 100% 58%)'
                }} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-300">
              Powerful features designed to accelerate your career growth
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="feature" className="hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{
                    background: index === 0 ? 'linear-gradient(135deg, hsl(174 72% 46%), hsl(199 89% 48%))' :
                    index === 1 ? 'linear-gradient(135deg, hsl(262 83% 65%), hsl(142 76% 36%))' :
                    index === 2 ? 'linear-gradient(135deg, hsl(28 100% 58%), hsl(38 92% 58%))' :
                    'linear-gradient(135deg, hsl(199 89% 48%), hsl(174 72% 46%))'
                  }}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-300">
              Get started in four simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass border-white/10 gradient-border">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold skilora-text mb-4">
                Ready to Master Your Skills?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of students who are already using <span className="font-bold skilora-text">SKILORA</span> to accelerate their careers
              </p>
              <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200" asChild>
                <Link href="/auth">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
