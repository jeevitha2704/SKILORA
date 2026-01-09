
'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth'
import { createJobAnalysis } from '@/lib/database'
import { ArrowRight, Brain, FileSearch, FileText, Loader2, Sparkles, Target, Upload, X } from 'lucide-react'

// TypeScript declarations for PDF.js
declare global {
  interface Window {
    pdfjsLib: any
  }
}

interface ParsedJD {
  title: string
  company: string
  experience: string
  education: string
  skills: Array<{
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    category: 'technical' | 'tool' | 'soft' | 'domain'
    required: boolean
  }>
}

interface ResumeCompareAnalysis {
  resume_match_summary?: {
    matched_skills: string[]
    partially_matched_skills: string[]
    missing_skills: string[]
  }
  resume_strengths?: string[]
  resume_weaknesses?: string[]
  overall_match_percentage?: number
  resume_alignment_note?: string
  error?: string
}

const sampleJD = `Full Stack Developer at TechCorp
 
 We are looking for a talented Full Stack Developer to join our growing team. You will be responsible for building and maintaining web applications using modern technologies.
 
 Requirements:
 - 5+ years of experience in full stack development
 - Strong proficiency in JavaScript, TypeScript, and React
 - Experience with Node.js, Express, and MongoDB
 - Knowledge of RESTful APIs and GraphQL
 - Understanding of agile methodologies and DevOps practices
 - Excellent problem-solving and communication skills
 
 Responsibilities:
 - Develop and maintain scalable web applications
 - Design and implement RESTful APIs and GraphQL endpoints
 - Write clean, maintainable, and well-documented code
 - Collaborate with cross-functional teams
 - Participate in code reviews and provide constructive feedback
 - Optimize application performance and ensure scalability
 - Stay up-to-date with emerging technologies and best practices
 
 Qualifications:
 - Bachelor's degree in Computer Science or related field
 - Experience with modern web development frameworks
 - Strong portfolio of full-stack projects
 - Proficiency in version control and CI/CD pipelines
 - Certifications in relevant technologies
 `

 export default function JobAnalyzer() {
   const { user } = useAuth()
   const [jobDescription, setJobDescription] = useState('')
   const [analysis, setAnalysis] = useState<ParsedJD | null>(null)
   const [analysisRaw, setAnalysisRaw] = useState<any | null>(null)
   const [isLoading, setIsLoading] = useState(false)
   const [pdfProcessingLoading, setPdfProcessingLoading] = useState(false)

   const [resumeText, setResumeText] = useState('')
   const [resumeFileName, setResumeFileName] = useState<string | null>(null)
   const [compareLoading, setCompareLoading] = useState(false)
   const [resumeCompare, setResumeCompare] = useState<ResumeCompareAnalysis | null>(null)
   const resumeFileInputRef = useRef<HTMLInputElement>(null)

   const handleResumeUpload = async (file: File) => {
    const isTxt = file.name.toLowerCase().endsWith('.txt')
    const isPdf = file.name.toLowerCase().endsWith('.pdf')
    
    if (!isTxt && !isPdf) {
      alert('Please upload a TXT or PDF resume file.')
      return
    }

    try {
      if (isPdf) {
        setPdfProcessingLoading(true)
        // For PDF files, we'll need to read them as binary and convert to text
        // Using a simple approach that works in the browser
        const arrayBuffer = await file.arrayBuffer()
        const text = await extractTextFromPDF(arrayBuffer)
        setResumeText(text)
        setResumeFileName(file.name)
        setResumeCompare(null)
        setPdfProcessingLoading(false)
      } else {
        // For TXT files, use the existing logic
        const reader = new FileReader()
        reader.onload = () => {
          const text = typeof reader.result === 'string' ? reader.result : ''
          setResumeText(text)
          setResumeFileName(file.name)
          setResumeCompare(null)
        }
        reader.onerror = () => {
          alert('Failed to read resume file')
        }
        reader.readAsText(file)
      }
    } catch (error) {
      console.error('Error processing file:', error)
      setPdfProcessingLoading(false)
      alert('Failed to process resume file. Please try uploading a text file instead.')
    }
  }

  // PDF text extraction using PDF.js
  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      // Dynamically load PDF.js from CDN
      if (typeof window === 'undefined') {
        return 'PDF processing is only available in the browser.'
      }

      // Load PDF.js script if not already loaded
      if (!window.pdfjsLib) {
        await loadPDFJS()
      }

      // Load the PDF document
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      let fullText = ''
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }

      // Clean up the extracted text
      const cleanText = fullText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
        .trim()

      return cleanText || 'No readable text found in PDF. Please try uploading a text file or copy-paste your resume.'
    } catch (error) {
      console.error('PDF extraction error:', error)
      return 'PDF text extraction failed. Please copy and paste your resume text manually or upload a TXT file.'
    }
  }

  // Load PDF.js library dynamically
  const loadPDFJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        // Set worker source
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve()
        } else {
          reject(new Error('Failed to load PDF.js'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load PDF.js script'))
      document.head.appendChild(script)
    })
  }

   const removeResume = () => {
     setResumeText('')
     setResumeFileName(null)
     setResumeCompare(null)
     if (resumeFileInputRef.current) {
       resumeFileInputRef.current.value = ''
     }
   }

   const getSkillLevelColor = (level: string): string => {
     switch (level) {
       case 'beginner':
         return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
       case 'intermediate':
         return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
       case 'advanced':
         return 'bg-green-500/20 text-green-400 border-green-500/30'
       case 'expert':
         return 'bg-teal-500/20 text-teal-400 border-teal-500/30'
       default:
         return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
     }
   }

   const getCategoryColor = (category: string): string => {
     switch (category) {
       case 'technical':
         return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
       case 'soft':
         return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
       case 'tool':
         return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
       case 'domain':
         return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
       default:
         return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
     }
   }

   const analyzeJob = async () => {
     if (!jobDescription.trim()) {
       alert('Please enter a job description to analyze')
       return
     }

     setIsLoading(true)
 
     try {
       const response = await fetch('/api/analyze-job', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           jobDescription: jobDescription.trim(),
           userId: user?.id,
         }),
       })

       const data = await response.json()
       if (!response.ok) {
         throw new Error(data.error || 'Analysis failed')
       }

       setAnalysisRaw(data.analysis || null)
       setResumeCompare(null)

       const parsed: ParsedJD = {
         title: data.analysis?.title || 'Position',
         company: data.analysis?.company || 'Company',
         experience: data.analysis?.experienceLevel || 'Not specified',
         education: data.analysis?.educationRequirements || 'Not specified',
         skills: (data.analysis?.requiredSkills || []).map((skill: any) => ({
           name: skill.name,
           category: skill.category,
           level: skill.level,
           required: Boolean(skill.required),
         })),
       }

       setAnalysis(parsed)

       // Persist analysis so Skill Gap can load it (client-side insert uses the user session and passes RLS)
       if (user?.id) {
         try {
           await createJobAnalysis(user.id, {
             title: parsed.title,
             company: parsed.company,
             experience: parsed.experience,
             education: parsed.education,
             raw_text: jobDescription.trim(),
             parsed_skills: parsed.skills,
           })
         } catch (e) {
           console.error('Failed to save job analysis from client:', e)
         }
       }
     } catch (error) {
       console.error('Analysis error:', error)
       alert(error instanceof Error ? error.message : 'Analysis failed')
     } finally {
       setIsLoading(false)
     }
   }

   const compareResume = async () => {
     if (!analysisRaw) {
       alert('Analyze a job description first')
       return
     }
     if (!resumeText.trim()) {
       alert('Please paste your resume text')
       return
     }

     setCompareLoading(true)
     try {
       const response = await fetch('/api/compare-resume', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           job_analysis: analysisRaw,
           resume_text: resumeText,
         }),
       })

       const data = await response.json()
       if (!response.ok) {
         throw new Error(data.error || 'Resume comparison failed')
       }

       setResumeCompare(data.analysis)
     } catch (error) {
       console.error('Resume compare error:', error)
       alert(error instanceof Error ? error.message : 'Resume comparison failed')
     } finally {
       setCompareLoading(false)
     }
   }

   const loadSample = () => {
     setJobDescription(sampleJD)
   }

   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
         <div className="text-center mb-8">
           <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
             <Sparkles className="h-4 w-4 mr-2" />
             Powered by AI
           </div>
           <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4 font-space-grotesk">
             Job Description Analyzer
           </h1>
           <p className="text-xl text-gray-300">AI-powered extraction of skills and requirements</p>
         </div>

         <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-accent hover-lift">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste a job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[220px] resize-none"
              />
            </CardContent>
          </Card>

          <Card className="glass-accent hover-lift">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Resume (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={resumeFileInputRef}
                type="file"
                accept=".txt,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleResumeUpload(file)
                }}
              />

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => resumeFileInputRef.current?.click()}
                  disabled={pdfProcessingLoading}
                >
                  {pdfProcessingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume (.txt, .pdf)
                    </>
                  )}
                </Button>

                {resumeFileName && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="truncate max-w-[180px]">{resumeFileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:bg-white/10"
                      onClick={removeResume}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[180px] resize-none"
              />
              <div className="text-center">
                <Button
                  onClick={compareResume}
                  disabled={compareLoading || !analysisRaw || !resumeText.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {compareLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Compare Resume
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Below both boxes */}
        <div className="flex justify-between items-center">
          <Button onClick={loadSample} variant="outline" className="text-gray-300 hover:text-white">
            <FileSearch className="h-4 w-4 mr-2" />
            Load Sample
          </Button>

          <Button
            onClick={analyzeJob}
            disabled={isLoading || !jobDescription.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>

           <div className="space-y-6">
             {analysis ? (
               <Card className="glass border-white/10">
                 <CardHeader>
                   <CardTitle className="text-white flex items-center gap-2">
                     <Brain className="h-5 w-5 text-primary" />
                     Analysis Results
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <h3 className="text-lg font-semibold text-white">{analysis.title}</h3>
                       <p className="text-gray-400">{analysis.company}</p>
                     </div>

                     <div className="text-sm text-gray-300">
                       <span className="font-medium">Experience:</span>
                       <span className="text-white ml-2">{analysis.experience}</span>
                     </div>

                     <div className="text-sm text-gray-300">
                       <span className="font-medium">Education:</span>
                       <span className="text-white ml-2">{analysis.education}</span>
                     </div>
                   </div>

                   <div className="mt-6">
                     <h4 className="text-lg font-semibold text-white mb-4">Required Skills</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {analysis.skills.map((skill, index) => (
                         <div key={index} className="p-3 border border-white/10 rounded-lg bg-white/5">
                           <div className="flex items-center justify-between">
                             <span className="text-white font-medium">{skill.name}</span>
                             <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getSkillLevelColor(skill.level)}`}>
                               {skill.level}
                             </span>
                           </div>
                           <div className="mt-2">
                             <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getCategoryColor(skill.category)}`}>
                               {skill.category}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ) : (
               <Card className="glass border-white/10">
                 <CardContent className="p-6 text-center text-gray-300">
                   Paste a job description and click Analyze.
                 </CardContent>
               </Card>
             )}

             {analysis && resumeCompare && (
               <Card className="glass border-white/10">
                 <CardHeader>
                   <CardTitle className="text-white flex items-center gap-2">
                     <Target className="h-5 w-5 text-primary" />
                     Resume vs Job Match
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-5">
                   <div className="text-3xl font-bold text-white">
                     {typeof resumeCompare.overall_match_percentage === 'number'
                       ? `${resumeCompare.overall_match_percentage}%`
                       : 'N/A'}
                   </div>

                   {resumeCompare.resume_alignment_note && (
                     <div className="text-gray-300">{resumeCompare.resume_alignment_note}</div>
                   )}

                   <div className="space-y-3">
                     <div>
                       <div className="text-sm font-semibold text-white mb-2">Matched</div>
                       <div className="flex flex-wrap gap-2">
                         {(resumeCompare.resume_match_summary?.matched_skills || []).length > 0 ? (
                           resumeCompare.resume_match_summary!.matched_skills.map((s, i) => (
                             <Badge key={`ms-${i}`} className="bg-green-500/20 text-green-300 border border-green-500/30">
                               {s}
                             </Badge>
                           ))
                         ) : (
                           <span className="text-sm text-gray-400">None</span>
                         )}
                       </div>
                     </div>

                     <div>
                       <div className="text-sm font-semibold text-white mb-2">Partially Matched</div>
                       <div className="flex flex-wrap gap-2">
                         {(resumeCompare.resume_match_summary?.partially_matched_skills || []).length > 0 ? (
                           resumeCompare.resume_match_summary!.partially_matched_skills.map((s, i) => (
                             <Badge key={`ps-${i}`} className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                               {s}
                             </Badge>
                           ))
                         ) : (
                           <span className="text-sm text-gray-400">None</span>
                         )}
                       </div>
                     </div>

                     <div>
                       <div className="text-sm font-semibold text-white mb-2">Missing</div>
                       <div className="flex flex-wrap gap-2">
                         {(resumeCompare.resume_match_summary?.missing_skills || []).length > 0 ? (
                           resumeCompare.resume_match_summary!.missing_skills.map((s, i) => (
                             <Badge key={`xs-${i}`} className="bg-red-500/20 text-red-300 border border-red-500/30">
                               {s}
                             </Badge>
                           ))
                         ) : (
                           <span className="text-sm text-gray-400">None</span>
                         )}
                       </div>
                     </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-4">
                     <div>
                       <div className="text-sm font-semibold text-white mb-2">Strengths</div>
                       {(resumeCompare.resume_strengths || []).length > 0 ? (
                         <div className="space-y-1 text-gray-300">
                           {resumeCompare.resume_strengths!.map((t, i) => (
                             <div key={`st-${i}`}>- {t}</div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-sm text-gray-400">None</div>
                       )}
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-white mb-2">Weaknesses</div>
                       {(resumeCompare.resume_weaknesses || []).length > 0 ? (
                         <div className="space-y-1 text-gray-300">
                           {resumeCompare.resume_weaknesses!.map((t, i) => (
                             <div key={`wk-${i}`}>- {t}</div>
                           ))}
                         </div>
                       ) : (
                         <div className="text-sm text-gray-400">None</div>
                       )}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             )}

             <Card className="glass border-white/10">
               <CardContent className="p-6 text-center">
                 <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                   <Link href="/skill-gap">
                     View Skill Gap Analysis
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                 </Button>
               </CardContent>
             </Card>
           </div>
       </div>
     </div>
   )
 }
