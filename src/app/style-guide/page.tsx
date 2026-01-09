'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Palette,
  Sparkles,
  Eye,
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Moon,
  Sun,
  Target,
  Code2,
  MessageSquare,
  Trophy,
  BarChart3,
  Calendar,
  Flame,
  Award,
  Lock,
  Play,
  Eye as EyeIcon,
  GraduationCap,
  Briefcase,
  TrendingUp,
  MapPin,
  Clock,
  ChevronDown,
  BookOpen
} from 'lucide-react'

const colorTokens = [
  { name: 'Primary', value: '217 91% 60%', hex: '#3B82F6', usage: 'Primary buttons, links, accents' },
  { name: 'Secondary', value: '172 66% 50%', hex: '#14B8A6', usage: 'Secondary elements' },
  { name: 'Accent', value: '38 92% 50%', hex: '#F59E0B', usage: 'Highlights, CTA accents' },
  { name: 'Success', value: '142 71% 45%', hex: '#22C55E', usage: 'Matched skills, success states' },
  { name: 'Warning', value: '38 92% 50%', hex: '#F59E0B', usage: 'Partial matches, beginner level' },
  { name: 'Info', value: '217 91% 60%', hex: '#3B82F6', usage: 'Information badges' },
  { name: 'Destructive', value: '0 84% 60%', hex: '#EF4444', usage: 'Missing skills, errors' },
  { name: 'Background', value: '220 50% 8%', hex: '#1E293B', usage: 'Page background' },
  { name: 'Foreground', value: '0 0% 95%', hex: '#F2F2F2', usage: 'Main text color' },
  { name: 'Muted', value: '220 30% 18%', hex: '#334155', usage: 'Muted backgrounds' },
  { name: 'Border', value: '220 30% 22%', hex: '#475569', usage: 'Borders and dividers' }
]

const buttonVariants = [
  { name: 'Default', colors: 'bg-primary text-primary-foreground', description: 'Standard primary action buttons' },
  { name: 'Hero', colors: 'bg-gradient-to-r from-primary to-info shadow-glow', description: 'Main call-to-action buttons' },
  { name: 'Accent', colors: 'bg-gradient-to-r from-accent to-warning', description: 'Accent call-to-action buttons' },
  { name: 'Success', colors: 'bg-success', description: 'Success action buttons' },
  { name: 'Glass', colors: 'bg-muted/50 backdrop-blur-sm border-border/50', description: 'Secondary action buttons' },
  { name: 'Skill', colors: 'bg-muted hover:bg-primary/20 hover:text-primary', description: 'Skill tag buttons' },
  { name: 'Outline', colors: 'border-input bg-background', description: 'Outline style buttons' },
  { name: 'Ghost', colors: 'hover:bg-accent', description: 'Subtle navigation buttons' },
  { name: 'Destructive', colors: 'bg-destructive', description: 'Delete or danger actions' }
]

const cardVariants = [
  { name: 'Default', colors: 'border-border shadow-sm', description: 'Basic content cards' },
  { name: 'Glass', colors: 'bg-muted/30 backdrop-blur-sm border-border/50', description: 'Transparent overlay cards' },
  { name: 'Gradient', colors: 'bg-gradient-to-br from-card to-muted', description: 'Gradient background cards' },
  { name: 'Glow', colors: 'border-primary/20 shadow-glow', description: 'Highlighted cards with glow' },
  { name: 'Interactive', colors: 'hover:border-primary/50 hover:shadow-glow cursor-pointer', description: 'Clickable cards with hover' },
  { name: 'Feature', colors: 'bg-gradient-to-br from-card via-card to-muted/50 hover:border-primary/30', description: 'Feature showcase cards' }
]

const animations = [
  { name: 'fade-in', description: 'Fade up from 10px below', duration: '0.5s' },
  { name: 'scale-in', description: 'Scale from 0.95 with fade', duration: '0.3s' },
  { name: 'float', description: 'Vertical float 0→-10px', duration: '3s infinite' },
  { name: 'glow-pulse', description: 'Box-shadow pulse effect', duration: '2s infinite' },
  { name: 'pulse-subtle', description: 'Opacity 1→0.8 pulse', duration: '2s infinite' },
  { name: 'spin-slow', description: '8s rotation animation', duration: '8s infinite' },
  { name: 'progress', description: 'Stroke-dashoffset animation for rings', duration: '1.5s' }
]

const iconColors = [
  { context: 'Primary Actions', icons: ['Target', 'Code2', 'TrendingUp'], color: 'text-primary' },
  { context: 'Secondary', icons: ['User', 'MessageSquare'], color: 'text-secondary' },
  { context: 'Success/Matched', icons: ['CheckCircle2'], color: 'text-success' },
  { context: 'Warning/Partial', icons: ['AlertCircle', 'Flame'], color: 'text-warning' },
  { context: 'Missing/Error', icons: ['XCircle'], color: 'text-destructive' },
  { context: 'Info', icons: ['Map', 'Calendar'], color: 'text-info' },
  { context: 'Accent/Highlight', icons: ['Target (in badges)'], color: 'text-accent' },
  { context: 'Muted/Inactive', icons: ['ChevronDown', 'BookOpen'], color: 'text-muted-foreground' }
]

const pageBreakdown = [
  {
    page: 'Home (Index.tsx)',
    features: [
      'Hero section with floating animated circles',
      'Feature cards with gradient backgrounds',
      'How it works timeline with 5 colored steps',
      'Call-to-action with gradient background'
    ],
    colors: ['Primary', 'Secondary', 'Accent', 'Success', 'Info']
  },
  {
    page: 'Analyzer (Analyzer.tsx)',
    features: [
      'File upload with glass input',
      'Job parsing with glow effects',
      'Dynamic skill badges with levels',
      'Interactive result cards'
    ],
    colors: ['Primary', 'Success', 'Warning', 'Info', 'Muted']
  },
  {
    page: 'Profile (Profile.tsx)',
    features: [
      'Avatar with gradient background',
      'Dynamic skill level badges',
      'Project timeline cards',
      'Overall score with gradient text'
    ],
    colors: ['Primary', 'Secondary', 'Success', 'Info']
  },
  {
    page: 'Skill Gap (SkillGap.tsx)',
    features: [
      'Progress ring with animated stroke',
      'Comparison charts with colored bars',
      'Status-based skill cards',
      'Interactive CTA to roadmap'
    ],
    colors: ['Accent', 'Success', 'Warning', 'Destructive']
  },
  {
    page: 'Roadmap (Roadmap.tsx)',
    features: [
      'Timeline with gradient line',
      'Status-based milestone cards',
      'Type-specific icon backgrounds',
      'Expandable milestone details'
    ],
    colors: ['Success', 'Primary', 'Info', 'Secondary']
  },
  {
    page: 'Practice (Practice.tsx)',
    features: [
      'Tabbed interface for content types',
      'Category filter buttons',
      'Difficulty-based color coding',
      'Interactive challenge cards'
    ],
    colors: ['Primary', 'Success', 'Warning', 'Destructive']
  },
  {
    page: 'Progress (Progress.tsx)',
    features: [
      'SVG progress rings with animation',
      'Weekly activity bar charts',
      'Achievement cards with states',
      'Skill progress with target markers'
    ],
    colors: ['Accent', 'Warning', 'Info', 'Success']
  }
]

export default function StyleGuide() {
  const [activeTab, setActiveTab] = useState('colors')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-4 font-space-grotesk">
            Style Guide
          </h1>
          <p className="text-xl text-gray-300">
            Complete documentation of colors, animations, and design system
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1 glass rounded-lg">
          {['colors', 'buttons', 'cards', 'animations', 'icons', 'pages'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'ghost'}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Colors Section */}
        {activeTab === 'colors' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-teal hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {colorTokens.map((color) => (
                    <div key={color.name} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg border-2 border-white/20"
                          style={{ backgroundColor: `hsl(${color.value})` }}
                        />
                        <div>
                          <h4 className="text-white font-semibold">{color.name}</h4>
                          <p className="text-gray-400 text-sm font-mono">{color.hex}</p>
                          <p className="text-gray-400 text-sm font-mono">{color.value}</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{color.usage}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Buttons Section */}
        {activeTab === 'buttons' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-orange hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Button Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {buttonVariants.map((variant) => (
                    <div key={variant.name} className="space-y-3">
                      <h4 className="text-white font-semibold">{variant.name}</h4>
                      <div className={`p-3 rounded-lg ${variant.colors}`}>
                        <span className="text-sm">Example Button</span>
                      </div>
                      <p className="text-gray-300 text-sm">{variant.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cards Section */}
        {activeTab === 'cards' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-green hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Card Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cardVariants.map((variant) => (
                    <div key={variant.name} className="space-y-3">
                      <h4 className="text-white font-semibold">{variant.name}</h4>
                      <Card className={variant.colors.split(' ')[0]}>
                        <CardContent className="p-4">
                          <p className="text-sm">Example card content</p>
                        </CardContent>
                      </Card>
                      <p className="text-gray-300 text-sm">{variant.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Animations Section */}
        {activeTab === 'animations' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-teal hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Animations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {animations.map((animation) => (
                    <div key={animation.name} className="space-y-3">
                      <h4 className="text-white font-semibold">.{animation.name}</h4>
                      <div className={`p-4 rounded-lg glass animate-${animation.name}`}>
                        <span className="text-sm">Animated Content</span>
                      </div>
                      <p className="text-gray-300 text-sm">{animation.description}</p>
                      <p className="text-gray-400 text-xs">{animation.duration}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Icons Section */}
        {activeTab === 'icons' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-orange hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Icon Color Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {iconColors.map((group) => (
                    <div key={group.context} className="space-y-3">
                      <h4 className="text-white font-semibold">{group.context}</h4>
                      <div className="flex flex-wrap gap-3">
                        {group.icons.map((iconName) => {
                          let IconComponent
                          switch (iconName) {
                            case 'Target':
                              IconComponent = Target
                              break
                            case 'Code2':
                              IconComponent = Code2
                              break
                            case 'TrendingUp':
                              IconComponent = TrendingUp
                              break
                            case 'User':
                              IconComponent = () => <div className="w-5 h-5 bg-primary rounded" />
                              break
                            case 'MessageSquare':
                              IconComponent = MessageSquare
                              break
                            case 'CheckCircle2':
                              IconComponent = CheckCircle2
                              break
                            case 'AlertCircle':
                              IconComponent = AlertCircle
                              break
                            case 'XCircle':
                              IconComponent = XCircle
                              break
                            case 'Map':
                              IconComponent = MapPin
                              break
                            case 'Calendar':
                              IconComponent = Calendar
                              break
                            case 'Flame':
                              IconComponent = Flame
                              break
                            case 'Eye':
                              IconComponent = EyeIcon
                              break
                            case 'GraduationCap':
                              IconComponent = GraduationCap
                              break
                            case 'Briefcase':
                              IconComponent = Briefcase
                              break
                            case 'ChevronDown':
                              IconComponent = ChevronDown
                              break
                            case 'BookOpen':
                              IconComponent = BookOpen
                              break
                            default:
                              return null
                          }
                          return IconComponent ? (
                            <div key={iconName} className={`p-2 rounded-lg glass ${group.color}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                          ) : null
                        })}
                      </div>
                      <p className="text-gray-300 text-sm">{group.color}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pages Section */}
        {activeTab === 'pages' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="glass-green hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Page-by-Page Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pageBreakdown.map((page) => (
                    <div key={page.page} className="p-4 rounded-lg glass">
                      <h4 className="text-white font-semibold mb-3">{page.page}</h4>
                      <div className="space-y-2">
                        {page.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {page.colors.map((color) => (
                          <Badge key={color} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <Card className="glass-teal hover-lift inline-block">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/">
                  <Button variant="outline" size="sm">Home</Button>
                </Link>
                <Link href="/analyzer">
                  <Button variant="outline" size="sm">Analyzer</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm">Profile</Button>
                </Link>
                <Link href="/skill-gap">
                  <Button variant="outline" size="sm">Skill Gap</Button>
                </Link>
                <Link href="/roadmap">
                  <Button variant="outline" size="sm">Roadmap</Button>
                </Link>
                <Link href="/practice">
                  <Button variant="outline" size="sm">Practice</Button>
                </Link>
                <Link href="/progress">
                  <Button variant="outline" size="sm">Progress</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
