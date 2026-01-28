# Professional Resume Analyzer 🧭

## Overview

The Professional Resume Analyzer is a comprehensive AI-powered tool that acts like a careful recruiter with a microscope in one hand and a checklist in the other. It analyzes your resume against a job description and provides detailed, actionable feedback.

## Features

### 1. **Resume & Job Description Analysis**
- Upload resume (PDF or TXT format)
- Paste job description
- AI extracts and structures all information

### 2. **Comprehensive Skill Matching**
- **Overall Match Score**: 0-100% compatibility
- **Matched Skills**: Skills you have that align with job
- **Partially Matched**: Skills with partial alignment
- **Missing Skills**: Critical skills not in your resume

### 3. **Experience Assessment**
- Verdict: Overqualified, Ideal, or Underqualified
- Years of experience comparison
- Relevant roles identification
- Industry alignment analysis

### 4. **Education Evaluation**
- Degree relevance to job
- Institution rating consideration
- Certification value assessment

### 5. **Project Evaluation**
- Count of relevant projects
- Technology stack alignment
- Problem-solving depth analysis

### 6. **ATS (Applicant Tracking System) Score**
- Resume keyword density analysis
- ATS pass probability
- Keyword matching percentage

### 7. **Gap Analysis**
- Missing skills identification
- Weak resume sections
- Areas needing improvement
- Generic phrases to replace

### 8. **Actionable Recommendations**
- **Skills to Learn**: Prioritized list (High/Medium/Low)
- **Resume Improvements**: Specific, direct fixes
- **Section-wise Feedback**:
  - Summary: Quality and relevance
  - Skills: Organization and prominence
  - Experience: Action verb usage, metrics
  - Projects: Results and impact
  - Education: Alignment and relevance

### 9. **Course Recommendations**
- Curated list based on missing skills
- Provider and duration information
- Relevance rating (Critical/Important/Nice-to-have)

### 10. **Related Job Opportunities**
- Similar positions you'd be good for
- Match percentage for each opportunity
- Career progression suggestions

### 11. **Overall Fit Verdict**
- **Strong Fit** ✅: Excellent match, apply immediately
- **Partial Fit** ⚠️: Good match but needs upskilling
- **Weak Fit** ❌: Consider gaining more experience

## How to Use

1. **Upload Resume**
   - Click "Upload Resume" or drag & drop
   - Supports PDF and TXT formats
   - Or paste resume text directly

2. **Provide Job Description**
   - Paste the full job description
   - Include all requirements and responsibilities

3. **Analyze**
   - Click "Analyze Resume & Job Fit"
   - Wait for AI to process both documents

4. **Review Results**
   - Scroll through comprehensive analysis
   - Pay special attention to:
     - Overall fit score
     - Missing critical skills
     - Gap analysis recommendations
   - Use course recommendations to upskill

5. **Download Report** (Coming Soon)
   - Export analysis as PDF
   - Share with mentors or career coaches

## What the Analysis Provides

### Dashboard Summary
```
Overall Match Score: 72%
ATS Compatibility: 85%
Skill Match: 72%
Experience Fit: Ideal
Education: Aligned
Verdict: PARTIAL FIT (Good match, needs upskilling)
```

### Detailed Breakdowns
- Job requirements (must-have and nice-to-have skills)
- Your current skill inventory
- Direct comparison and gaps
- Specific improvement suggestions
- Learning path recommendations

## Pro Tips 💡

1. **For Missing Skills**: Start with "High Priority" recommendations
2. **For Resume Improvement**: Use section feedback to rewrite bullet points
3. **ATS Optimization**: Add missing keywords naturally into your resume
4. **Multiple Jobs**: Analyze your resume against different job descriptions to:
   - Identify common missing skills
   - Tailor your resume accordingly
   - Plan targeted upskilling

5. **Career Planning**: Use related jobs section to explore career progression paths

## API Endpoints

### POST `/api/analyze-resume`

Request:
```json
{
  "resume": "Your resume text here...",
  "jobDescription": "Your job description here..."
}
```

Response:
```json
{
  "jobOverview": {...},
  "resumeData": {...},
  "skillMatch": {...},
  "experienceMatch": {...},
  "educationMatch": {...},
  "projectEvaluation": {...},
  "atsScore": {...},
  "gapAnalysis": {...},
  "recommendations": {...},
  "courseRecommendations": [...],
  "relatedJobs": [...],
  "overallFit": {...}
}
```

## Configuration

Set OpenAI API key in `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

Without the API key, basic regex-based analysis will be used.

## Browser Requirements

- Modern browser with JavaScript enabled
- PDF support requires PDF.js library (loaded via CDN)
- Minimum 2GB RAM recommended for PDF processing

## Future Enhancements

- [ ] Download analysis as PDF report
- [ ] Multiple job comparison
- [ ] Resume version comparison
- [ ] LinkedIn profile integration
- [ ] Interview preparation guide based on job
- [ ] Salary negotiation insights
- [ ] Career roadmap generation
