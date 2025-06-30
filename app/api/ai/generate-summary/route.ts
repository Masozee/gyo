import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, experience, skills, industry } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // For now, we'll create a structured summary based on the provided information
    // In production, you would integrate with Google's Gemini API
    
    const experienceText = experience ? `with ${experience} years of experience` : '';
    const skillsText = skills ? `skilled in ${skills}` : '';
    const industryText = industry ? `in the ${industry} industry` : '';

    let summary = `Dedicated ${jobTitle} ${experienceText}${industryText}. `;

    if (skillsText) {
      summary += `Highly ${skillsText}. `;
    }

    summary += `Proven track record of delivering high-quality results and driving organizational success through innovative solutions and collaborative teamwork. `;
    summary += `Passionate about continuous learning and professional development, with strong problem-solving abilities and attention to detail.`;

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      summary: summary.trim(),
      suggestions: [
        'Consider adding specific achievements or metrics',
        'Mention relevant certifications or qualifications',
        'Include leadership or teamwork experience',
        'Highlight your unique value proposition'
      ]
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

// Alternative implementation with actual Gemini API (commented out)
/*
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, experience, skills, industry } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a professional summary for a resume with the following details:
    - Job Title: ${jobTitle}
    - Years of Experience: ${experience || 'Not specified'}
    - Key Skills: ${skills || 'Not specified'}
    - Industry: ${industry || 'Not specified'}

    Please write a concise, professional summary that:
    1. Is 3-4 sentences long
    2. Highlights key strengths and experience
    3. Is tailored to the job title
    4. Uses action words and professional language
    5. Is suitable for ATS systems

    Return only the summary text, no additional formatting or explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    return NextResponse.json({
      success: true,
      summary,
      suggestions: [
        'Review for industry-specific keywords',
        'Consider quantifying achievements',
        'Ensure it matches the job requirements',
        'Keep it concise and impactful'
      ]
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary with AI' },
      { status: 500 }
    );
  }
}
*/