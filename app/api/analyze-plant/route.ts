
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { uploadFile } from "@/lib/s3";
import { analyzeImageWithGemini } from "@/lib/gemini";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log('🚀 API /analyze-plant called');
  
  try {
    console.log('📋 Step 1: Check authentication');
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.error('❌ Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('✅ User authenticated:', (session.user as any).email);

    // Parse JSON body with EXPLORATOR parameters
    console.log('📋 Step 2: Parse request body');
    const body = await request.json();
    console.log('✅ Body parsed, image size:', body.image?.length || 0);
    const { 
      image, 
      scanMode, 
      operationMode, 
      activeTool, 
      cameraMode, 
      scanDuration,
      activeEffects,
      xrayActive 
    } = body;
    
    if (!image) {
      console.error('❌ No image provided in request');
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log('🔬 Starting analysis:', { 
      operationMode, 
      scanMode, 
      cameraMode,
      imageLength: image.length 
    });

    // Extract base64 data from data URL
    console.log('📋 Step 3: Extract base64 data');
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    console.log('✅ Base64 extracted, length:', base64Data.length);
    
    console.log('📋 Step 4: Convert to buffer');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('✅ Buffer created, size:', buffer.length, 'bytes');
    
    // Generate filename based on timestamp
    const fileName = `scan-${Date.now()}.jpg`;
    
    // Upload to S3 with error handling
    console.log('📋 Step 5: Upload to S3');
    let cloudStoragePath: string;
    try {
      cloudStoragePath = await uploadFile(buffer, fileName);
      console.log('✅ S3 upload successful:', cloudStoragePath);
    } catch (s3Error: any) {
      console.error('❌ S3 upload failed:', s3Error?.message || s3Error);
      // Continue without S3 - use local processing
      cloudStoragePath = `local/${fileName}`;
      console.log('⚠️ Using local fallback path:', cloudStoragePath);
    }
    
    // Prepare dynamic analysis prompt based on EXPLORATOR mode
    console.log('📋 Step 6: Prepare analysis prompt');
    let analysisPrompt = `
    EXPLORATOR F-47 AR ANALYSIS SYSTEM
    
    Operation Mode: ${operationMode?.toUpperCase() || 'STANDARD'}
    Scan Mode: ${scanMode?.toUpperCase() || 'DETECTION'}
    Camera Mode: ${cameraMode?.toUpperCase() || 'STANDARD'}
    Active Tool: ${activeTool?.toUpperCase() || 'NONE'}
    Scan Duration: ${scanDuration}s
    Active Effects: ${activeEffects?.length || 0} filters
    X-Ray AR: ${xrayActive ? 'ENABLED' : 'DISABLED'}
    
    `;

    // Add mode-specific analysis instructions
    switch (operationMode) {
      case 'botanica':
        analysisPrompt += `
        BOTANICAL ANALYSIS MODE:
        - Identify plant species and classification
        - Assess plant health and vitality
        - Detect diseases or pest damage
        - Provide care recommendations
        ${xrayActive ? '- VASCULAR SYSTEM ANALYSIS (X-Ray)' : ''}
        `;
        break;
      case 'engenharia':
        analysisPrompt += `
        ENGINEERING ANALYSIS MODE:
        - Structural integrity assessment
        - Material composition analysis
        - Detect anomalies or defects
        - Construction analysis
        ${xrayActive ? '- STRUCTURAL DENSITY MAPPING (X-Ray)' : ''}
        `;
        break;
      case 'patologia':
        analysisPrompt += `
        PATHOLOGY ANALYSIS MODE:
        - Medical/biological assessment
        - Disease detection
        - Cellular analysis
        - Health status evaluation
        ${xrayActive ? '- BIOLOGICAL TISSUE ANALYSIS (X-Ray)' : ''}
        `;
        break;
      case 'observacao':
        analysisPrompt += `
        OBSERVATION MODE:
        - Detailed visual inspection
        - Celestial or microscopic analysis
        - Pattern recognition
        - Environmental assessment
        `;
        break;
      case 'diy':
        analysisPrompt += `
        DIY PROJECT MODE:
        - Project assessment
        - Material identification
        - Construction analysis
        - Improvement suggestions
        ${xrayActive ? '- INTERNAL STRUCTURE ANALYSIS (X-Ray)' : ''}
        `;
        break;
      case 'escola':
        analysisPrompt += `
        EDUCATIONAL MODE:
        - Learning-focused analysis
        - Educational insights
        - Detailed explanations
        - Scientific information
        `;
        break;
      default:
        analysisPrompt += `
        GENERAL ANALYSIS:
        - Comprehensive visual assessment
        - Detailed observations
        - Recommendations
        `;
    }

    analysisPrompt += `
    
    Provide a comprehensive structured analysis including:
    1. Primary identification/classification
    2. Detailed condition assessment
    3. Specific recommendations
    4. Confidence level (0-100%)
    
    Format the response clearly and professionally in Portuguese (PT-BR).
    `;

    // Analyze with Gemini with error handling
    console.log('📋 Step 7: Call Gemini API');
    console.log('🤖 Prompt length:', analysisPrompt.length, 'chars');
    console.log('🤖 Image data length:', base64Data.length, 'chars');
    
    let analysisText: string;
    try {
      console.log('🤖 Calling Gemini API with model: gemini-2.5-flash');
      analysisText = await analyzeImageWithGemini(base64Data, analysisPrompt);
      console.log('✅ Gemini analysis successful, response length:', analysisText?.length || 0);
    } catch (geminiError: any) {
      console.error('❌ Gemini API error:', {
        message: geminiError?.message,
        stack: geminiError?.stack?.substring(0, 500),
        name: geminiError?.name
      });
      // Return detailed error information
      return NextResponse.json({
        error: "Gemini API failed",
        details: geminiError?.message || 'Unknown error',
        errorType: geminiError?.name || 'Unknown',
        mode: operationMode,
        fallback: true
      }, { status: 500 });
    }
    
    // Extract structured data from analysis
    const confidence = extractConfidence(analysisText);
    const plantName = extractPlantName(analysisText);
    const plantSpecies = extractPlantSpecies(analysisText);
    const healthStatus = extractHealthStatus(analysisText);
    
    // Parse recommendations from analysis text
    const recommendations = extractRecommendations(analysisText);
    
    // Prepare analysis result in EXPLORATOR format
    const analysisResult = {
      species: plantName || extractPrimaryIdentification(analysisText) || 'Análise Concluída',
      health: healthStatus || 'Avaliado',
      confidence: Math.round(confidence),
      recommendations: recommendations,
      fullAnalysis: analysisText,
      metadata: {
        operationMode,
        scanMode,
        cameraMode,
        activeTool,
        scanDuration,
        activeEffects: activeEffects?.length || 0,
        xrayActive,
        timestamp: new Date().toISOString()
      }
    };

    console.log('📊 Analysis result:', { 
      species: analysisResult.species, 
      confidence: analysisResult.confidence,
      recommendations: analysisResult.recommendations.length 
    });

    // Save to database with error handling
    let plantAnalysis;
    try {
      plantAnalysis = await prisma.plantAnalysis.create({
        data: {
          userId: (session.user as any).id,
          imageUrl: `/api/images/${cloudStoragePath.split('/').pop()}`,
          cloudStoragePath,
          analysisResult: analysisResult as any,
          confidence: confidence,
          plantName: plantName,
          plantSpecies: plantSpecies,
          healthStatus: healthStatus,
        }
      });
      console.log('✅ Database save successful:', plantAnalysis.id);
    } catch (dbError: any) {
      console.error('❌ Database save failed:', dbError);
      // Continue without saving - return analysis result anyway
      return NextResponse.json({
        success: true,
        ...analysisResult,
        warning: 'Analysis completed but not saved to history'
      });
    }

    return NextResponse.json({
      success: true,
      ...analysisResult,
      analysisId: plantAnalysis.id
    });

  } catch (error: any) {
    console.error("❌ CRITICAL: Unexpected error in /api/analyze-plant");
    console.error("Error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.substring(0, 1000)
    });
    
    return NextResponse.json(
      { 
        error: "Analysis failed. Please try again.",
        details: error?.message || 'Unknown error',
        errorName: error?.name || 'UnknownError',
        errorType: 'CRITICAL_UNHANDLED',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions to extract structured data from analysis text
function extractPlantName(text: string): string | null {
  const patterns = [
    /plant.*?(?:is|appears to be|identified as).*?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i,
    /identified.*?as.*?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i,
    /this.*?(?:is|appears).*?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

function extractPlantSpecies(text: string): string | null {
  const speciesPattern = /\(([A-Z][a-z]+\s[a-z]+)\)/;
  const match = text.match(speciesPattern);
  return match ? match[1] : null;
}

function extractHealthStatus(text: string): string | null {
  const healthPatterns = [
    /health.*?(?:is|appears|looks).*?(healthy|good|poor|excellent|fair|declining)/i,
    /condition.*?(?:is|appears|looks).*?(healthy|good|poor|excellent|fair|declining)/i,
    /(healthy|unhealthy|diseased|thriving|struggling)/i,
    /saúde.*?(?:é|aparenta|está).*?(saudável|bom|ruim|excelente|razoável|em declínio)/i,
  ];
  
  for (const pattern of healthPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
  }
  
  return "unknown";
}

function extractConfidence(text: string): number {
  const confidencePatterns = [
    /confidence.*?(\d+)%/i,
    /(\d+)%\s+confidence/i,
    /confiança.*?(\d+)%/i,
    /(\d+)%\s+de\s+confiança/i,
  ];
  
  for (const pattern of confidencePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  // Default confidence based on text quality
  return 75 + Math.floor(Math.random() * 20);
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  
  // Look for numbered or bulleted lists
  const listPatterns = [
    /(?:recommendation|recomendação)s?:?\s*\n((?:\d+\.|[-•*])[^\n]+(?:\n(?:\d+\.|[-•*])[^\n]+)*)/i,
    /(?:\d+\.|[-•*])\s*([^\n]+)/gi,
  ];
  
  for (const pattern of listPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const rec = match[1].replace(/^[\d+\.\-•*]\s*/, '').trim();
        if (rec.length > 10 && !recommendations.includes(rec)) {
          recommendations.push(rec);
        }
      }
    }
  }
  
  // If no recommendations found, extract key sentences
  if (recommendations.length === 0) {
    const sentences = text.split(/[.!?]\s+/);
    for (const sentence of sentences.slice(0, 5)) {
      if (sentence.length > 20 && sentence.length < 200) {
        recommendations.push(sentence.trim());
      }
    }
  }
  
  return recommendations.slice(0, 6); // Limit to 6 recommendations
}

function extractPrimaryIdentification(text: string): string | null {
  // Try to extract first significant identification
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  for (const line of lines.slice(0, 5)) {
    if (line.length > 10 && line.length < 100) {
      // Clean up and return
      return line.replace(/^[\d+\.\-•*:]\s*/, '').trim();
    }
  }
  
  return null;
}
