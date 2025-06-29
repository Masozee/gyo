import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { type CVData } from '@/lib/cv-types';

// Simple PDF generation function
async function generateCVPDF(data: CVData, template: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  let currentY = height - 50;
  const margin = 50;
  const lineHeight = 20;
  
  // Helper function to add text
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const fontSize = options.fontSize || 12;
    const fontType = options.bold ? boldFont : font;
    const color = options.color || rgb(0, 0, 0);
    
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: fontType,
      color,
    });
    
    return y - (options.lineHeight || lineHeight);
  };
  
  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number = 12) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  // Add title
  currentY = addText(data.personalInfo.fullName, margin, currentY, {
    fontSize: 24,
    bold: true,
  });
  
  currentY -= 10;
  
  // Add contact info
  const contactInfo = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.website,
  ].filter(Boolean).join(' | ');
  
  currentY = addText(contactInfo, margin, currentY, { fontSize: 10 });
  currentY -= 20;
  
  // Add summary
  if (data.personalInfo.summary) {
    currentY = addText('PROFESSIONAL SUMMARY', margin, currentY, {
      fontSize: 14,
      bold: true,
    });
    currentY -= 5;
    
    const summaryLines = wrapText(data.personalInfo.summary, width - 2 * margin);
    for (const line of summaryLines) {
      currentY = addText(line, margin, currentY);
    }
    currentY -= 15;
  }
  
  // Add experience
  if (data.experience.length > 0) {
    currentY = addText('WORK EXPERIENCE', margin, currentY, {
      fontSize: 14,
      bold: true,
    });
    currentY -= 5;
    
    for (const exp of data.experience) {
      currentY = addText(`${exp.jobTitle} - ${exp.company}`, margin, currentY, {
        fontSize: 12,
        bold: true,
      });
      
      const dateLocation = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate} | ${exp.location}`;
      currentY = addText(dateLocation, margin, currentY, { fontSize: 10 });
      
      const descLines = wrapText(exp.description, width - 2 * margin);
      for (const line of descLines) {
        currentY = addText(line, margin, currentY, { fontSize: 10 });
      }
      currentY -= 10;
      
      // Check if we need a new page
      if (currentY < 100) {
        const newPage = pdfDoc.addPage([595, 842]);
        currentY = height - 50;
        // Continue on new page...
      }
    }
    currentY -= 5;
  }
  
  // Add education
  if (data.education.length > 0) {
    currentY = addText('EDUCATION', margin, currentY, {
      fontSize: 14,
      bold: true,
    });
    currentY -= 5;
    
    for (const edu of data.education) {
      currentY = addText(`${edu.degree} - ${edu.institution}`, margin, currentY, {
        fontSize: 12,
        bold: true,
      });
      
      const eduInfo = `${edu.startDate} - ${edu.endDate} | ${edu.location}`;
      currentY = addText(eduInfo, margin, currentY, { fontSize: 10 });
      
      if (edu.gpa) {
        currentY = addText(`GPA: ${edu.gpa}`, margin, currentY, { fontSize: 10 });
      }
      currentY -= 10;
    }
    currentY -= 5;
  }
  
  // Add skills
  if (data.skills.length > 0) {
    currentY = addText('SKILLS', margin, currentY, {
      fontSize: 14,
      bold: true,
    });
    currentY -= 5;
    
    for (const skillGroup of data.skills) {
      const skillText = `${skillGroup.category}: ${skillGroup.items.join(', ')}`;
      const skillLines = wrapText(skillText, width - 2 * margin);
      for (const line of skillLines) {
        currentY = addText(line, margin, currentY, { fontSize: 10 });
      }
    }
  }
  
  return pdfDoc.save();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, template } = body;

    if (!data || !template) {
      return NextResponse.json(
        { error: 'Missing CV data or template' },
        { status: 400 }
      );
    }

    const pdfBytes = await generateCVPDF(data as CVData, template);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.personalInfo.fullName || 'CV'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}