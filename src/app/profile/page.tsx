'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth'
import { 
  getProfile, 
  getUserSkills, 
  addUserSkill, 
  deleteUserSkill, 
  updateProfile as updateProfileDB,
  getProjects,
  addProject as addProjectToDB,
  updateProject,
  deleteProject as deleteProjectFromDB
} from '@/lib/database'
import { 
  User, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Star,
  Award,
  Target,
  BookOpen,
  ArrowRight
} from 'lucide-react'

interface Skill {
  id: string
  skill_name: string
  level: number
  category: string
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  project_url?: string
  github_url?: string
  start_date?: string
  end_date?: string
}

interface Profile {
  id?: string
  full_name?: string
  bio?: string
  avatar_url?: string
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile>({})
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)

  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    level: 2,
    category: 'technical'
  })

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    project_url: '',
    github_url: ''
  })

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
      loadSkills()
      loadProjects()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const data = await getProfile(user?.id || '')
      if (data) {
        setProfile(data)
        setProfileForm({
          full_name: data.full_name || '',
          bio: data.bio || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadSkills = async () => {
    try {
      const data = await getUserSkills(user?.id || '')
      setSkills(
        (data || []).map((s: any) => ({
          ...s,
          category: s.category === 'tools' ? 'tool' : s.category
        }))
      )
    } catch (error) {
      console.error('Error loading skills:', error)
    }
    setLoading(false)
  }

  const loadProjects = async () => {
    try {
      const data = await getProjects(user?.id || '')
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
      setProjects([])
    }
    setLoading(false)
  }

  const addSkill = async () => {
    if (!newSkill.skill_name.trim()) {
      console.log('Skill name is empty')
      alert('Please enter a skill name')
      return
    }

    if (!user?.id) {
      alert('Please sign in to add skills')
      return
    }

    try {
      console.log('Adding skill:', newSkill)
      console.log('User ID:', user.id)
      const data = await addUserSkill(user.id, newSkill.skill_name, newSkill.level, newSkill.category)
      console.log('Skill added successfully:', data)
      
      setSkills([...skills, data])
      setNewSkill({ skill_name: '', level: 2, category: 'technical' })
      setIsAddSkillOpen(false)
      alert('Skill added successfully!')
    } catch (error) {
      console.error('Error adding skill:', error)
      alert('Error adding skill: ' + (error as Error).message)
    }
  }

  const deleteSkill = async (skillId: string) => {
    try {
      await deleteUserSkill(skillId)
      setSkills(skills.filter(skill => skill.id !== skillId))
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }

  const addProject = async () => {
    if (!newProject.title.trim()) {
      alert('Please enter a project title')
      return
    }

    if (!user?.id) {
      alert('Please sign in to add projects')
      return
    }

    try {
      console.log('Adding project:', newProject)
      const data = await addProjectToDB(user.id, {
        title: newProject.title,
        description: newProject.description,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t),
        project_url: newProject.project_url,
        github_url: newProject.github_url
      })
      console.log('Project added successfully:', data)
      
      setProjects([...projects, data])
      setNewProject({ title: '', description: '', technologies: '', project_url: '', github_url: '' })
      setIsAddProjectOpen(false)
      alert('Project added successfully!')
    } catch (error) {
      console.error('Error adding project:', error)
      alert('Error adding project: ' + (error as Error).message)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!user?.id) {
      alert('Please sign in to delete projects')
      return
    }

    try {
      console.log('Deleting project:', projectId)
      await deleteProjectFromDB(projectId)
      setProjects(projects.filter(project => project.id !== projectId))
      alert('Project deleted successfully!')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project: ' + (error as Error).message)
    }
  }

  const testDatabase = async () => {
    try {
      console.log('Testing database connection...')
      const result = await getUserSkills(user?.id || '')
      console.log('Database test result:', result)
      alert('Database connection test: ' + (result ? 'SUCCESS' : 'FAILED'))
    } catch (error) {
      console.error('Database test error:', error)
      alert('Database connection failed: ' + (error as Error).message)
    }
  }

  const updateProfile = async () => {
    if (!user?.id) {
      alert('Please sign in to update your profile')
      return
    }

    try {
      console.log('Updating profile:', profileForm)
      console.log('User ID:', user.id)
      
      await updateProfileDB(user.id, profileForm)
      setProfile({ ...profile, full_name: profileForm.full_name, bio: profileForm.bio })
      setEditingProfile(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + (error as Error).message)
    }
  }

  const getSkillLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 2: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 3: return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 4: return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const calculateSkillScore = () => {
    if (skills.length === 0) return 0
    const totalScore = skills.reduce((sum, skill) => sum + skill.level, 0)
    return Math.round((totalScore / (skills.length * 4)) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  // Show profile page even if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
          <Card className="glass border-white/10 max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Please Sign In
              </h3>
              <p className="text-gray-400 mb-6">
                You need to be signed in to view and manage your profile
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-secondary" />
                    Profile
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Section */}
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Avatar className="h-16 w-16 text-white">
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || user?.email} />
                      <AvatarFallback className="bg-white text-gray-900 text-lg">
                        {(profile.full_name || user?.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {editingProfile ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Full Name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="bg-background/50 border-white/20 text-white"
                    />
                    <Textarea
                      placeholder="Bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="bg-background/50 border-white/20 text-white min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={updateProfile} className="bg-primary hover:bg-primary/90">
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(false)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={testDatabase}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Test DB
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {profile.full_name || user?.email}
                      </h3>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                    {profile.bio && (
                      <p className="text-gray-300">{profile.bio}</p>
                    )}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Skill Score</span>
                        <span className="text-2xl font-bold gradient-text">{calculateSkillScore()}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateSkillScore()}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Skills & Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Skills ({skills.length})
                  </div>
                  <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-white/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Skill</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Skill name"
                          value={newSkill.skill_name}
                          onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                          className="bg-background/50 border-white/20 text-white"
                        />
                        <Select
                          value={newSkill.level.toString()}
                          onValueChange={(value) => setNewSkill({ ...newSkill, level: parseInt(value) })}
                        >
                          <SelectTrigger className="bg-background/50 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-white/20">
                            <SelectItem value="1">Beginner</SelectItem>
                            <SelectItem value="2">Intermediate</SelectItem>
                            <SelectItem value="3">Advanced</SelectItem>
                            <SelectItem value="4">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={newSkill.category}
                          onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                        >
                          <SelectTrigger className="bg-background/50 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-white/20">
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="tool">Tools</SelectItem>
                            <SelectItem value="soft">Soft Skills</SelectItem>
                            <SelectItem value="domain">Domain</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button onClick={addSkill} className="bg-primary hover:bg-primary/90">
                            Add Skill
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddSkillOpen(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {skills.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Skills Yet</h3>
                    <p className="text-gray-400 mb-4">Start adding your skills to build your profile</p>
                    <Button onClick={() => setIsAddSkillOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        className={`${getSkillLevelColor(skill.level)} border flex items-center gap-2`}
                      >
                        {skill.skill_name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card className="glass-orange hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Projects ({projects.length})
                  </div>
                  <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-white/20 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">Add New Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Project title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          className="bg-background/50 border-white/20 text-white"
                        />
                        <Textarea
                          placeholder="Project description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          className="bg-background/50 border-white/20 text-white min-h-[100px]"
                        />
                        <Input
                          placeholder="Technologies (comma-separated)"
                          value={newProject.technologies}
                          onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                          className="bg-background/50 border-white/20 text-white"
                        />
                        <Input
                          placeholder="Project URL (optional)"
                          value={newProject.project_url}
                          onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })}
                          className="bg-background/50 border-white/20 text-white"
                        />
                        <Input
                          placeholder="GitHub URL (optional)"
                          value={newProject.github_url}
                          onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                          className="bg-background/50 border-white/20 text-white"
                        />
                        <div className="flex gap-2">
                          <Button onClick={addProject} className="bg-primary hover:bg-primary/90">
                            Add Project
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddProjectOpen(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Projects Yet</h3>
                    <p className="text-gray-400 mb-4">Showcase your work by adding projects</p>
                    <Button onClick={() => setIsAddProjectOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <Card key={project.id} className="glass border-white/10">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-white">{project.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {project.description && (
                            <p className="text-gray-300 mb-3">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.technologies.map((tech, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {project.project_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={project.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  View Project
                                </a>
                              </Button>
                            )}
                            {project.github_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  GitHub
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
