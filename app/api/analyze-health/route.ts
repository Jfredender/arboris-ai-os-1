
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sistema de banco de dados de profissionais de saúde por especialidade
const healthProfessionalsDatabase: Record<string, any[]> = {
  'Dermatologia': [
    {
      name: 'Dra. Maria Silva Santos',
      specialty: 'Dermatologista',
      crm: 'CRM-SP 123456',
      qualifications: ['Especialista em Dermatologia pela SBD', 'Mestre em Dermatologia pela USP'],
      phone: '+55 (11) 3456-7890',
      email: 'dra.maria@clinicaderma.com.br',
      address: 'Av. Paulista, 1000 - Sala 501',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      rating: 4.8,
      yearsExperience: 15,
      acceptsInsurance: true,
      insuranceTypes: ['Unimed', 'SulAmérica', 'Bradesco Saúde'],
      telehealth: true,
      consultationFee: 350,
    },
    {
      name: 'Dr. João Carlos Oliveira',
      specialty: 'Dermatologista',
      crm: 'CRM-RJ 234567',
      qualifications: ['Especialista em Dermatologia', 'Fellowship em Cirurgia Dermatológica'],
      phone: '+55 (21) 2345-6789',
      email: 'dr.joao@dermacare.com.br',
      address: 'Rua Visconde de Pirajá, 500 - Sala 302',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22410-002',
      rating: 4.9,
      yearsExperience: 20,
      acceptsInsurance: true,
      insuranceTypes: ['Amil', 'Golden Cross', 'Porto Seguro'],
      telehealth: true,
      consultationFee: 400,
    },
  ],
  'Oftalmologia': [
    {
      name: 'Dra. Ana Paula Costa',
      specialty: 'Oftalmologista',
      crm: 'CRM-SP 345678',
      qualifications: ['Especialista em Oftalmologia', 'Fellowship em Retina e Vítreo'],
      phone: '+55 (11) 4567-8901',
      email: 'dra.ana@clinicavisao.com.br',
      address: 'Av. Brigadeiro Luís Antônio, 2000 - Sala 801',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01318-000',
      rating: 4.7,
      yearsExperience: 18,
      acceptsInsurance: true,
      insuranceTypes: ['Unimed', 'Amil', 'SulAmérica'],
      telehealth: true,
      consultationFee: 380,
    },
  ],
  'Ortopedia': [
    {
      name: 'Dr. Roberto Mendes',
      specialty: 'Ortopedista',
      crm: 'CRM-SP 456789',
      qualifications: ['Especialista em Ortopedia', 'Mestre em Cirurgia Ortopédica'],
      phone: '+55 (11) 5678-9012',
      email: 'dr.roberto@ortoclinica.com.br',
      address: 'Rua Augusta, 3000 - Sala 1001',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01412-000',
      rating: 4.9,
      yearsExperience: 22,
      acceptsInsurance: true,
      insuranceTypes: ['Bradesco Saúde', 'Unimed', 'Porto Seguro'],
      telehealth: false,
      consultationFee: 420,
    },
  ],
  'Cardiologia': [
    {
      name: 'Dr. Fernando Lima',
      specialty: 'Cardiologista',
      crm: 'CRM-SP 567890',
      qualifications: ['Especialista em Cardiologia', 'Doutorado em Cardiologia pela USP'],
      phone: '+55 (11) 6789-0123',
      email: 'dr.fernando@cardioclinica.com.br',
      address: 'Av. Rebouças, 1500 - Sala 601',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05402-000',
      rating: 4.8,
      yearsExperience: 25,
      acceptsInsurance: true,
      insuranceTypes: ['Unimed', 'SulAmérica', 'Amil'],
      telehealth: true,
      consultationFee: 450,
    },
  ],
  'Clínica Geral': [
    {
      name: 'Dra. Beatriz Almeida',
      specialty: 'Clínica Geral',
      crm: 'CRM-SP 678901',
      qualifications: ['Especialista em Clínica Médica', 'Residência no HC-FMUSP'],
      phone: '+55 (11) 7890-1234',
      email: 'dra.beatriz@clinicageral.com.br',
      address: 'Rua da Consolação, 1200 - Sala 401',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01301-000',
      rating: 4.6,
      yearsExperience: 12,
      acceptsInsurance: true,
      insuranceTypes: ['Unimed', 'Bradesco Saúde', 'SulAmérica'],
      telehealth: true,
      consultationFee: 300,
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // 2. Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 3. Extrair dados do request
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const symptoms = formData.get('symptoms') as string;
    const additionalInfo = formData.get('additionalInfo') as string || '';

    // 4. Processar imagem se fornecida
    let imageBase64 = '';
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageBase64 = buffer.toString('base64');
    }

    // 5. Criar prompt para análise de saúde
    const healthPrompt = `Você é um assistente médico especializado em análise inicial de sintomas e condições de saúde.

${imageFile ? 'IMAGEM FORNECIDA: Analise a imagem fornecida junto com os sintomas descritos.' : 'APENAS SINTOMAS: Analise baseado nos sintomas descritos.'}

SINTOMAS REPORTADOS: ${symptoms}
${additionalInfo ? `INFORMAÇÕES ADICIONAIS: ${additionalInfo}` : ''}

Por favor, forneça uma análise estruturada no seguinte formato JSON:

{
  "specialtyArea": "Nome da especialidade médica adequada (ex: Dermatologia, Oftalmologia, Cardiologia, Ortopedia, Clínica Geral, etc.)",
  "diagnosis": {
    "primary": "Diagnóstico principal mais provável",
    "differential": ["Diagnóstico diferencial 1", "Diagnóstico diferencial 2"],
    "description": "Descrição detalhada da condição identificada"
  },
  "confidence": 0.85,
  "severity": "low/medium/high/critical",
  "prescription": {
    "medications": [
      {
        "name": "Nome do medicamento",
        "dosage": "Dosagem recomendada",
        "frequency": "Frequência de uso",
        "duration": "Duração do tratamento",
        "instructions": "Instruções especiais"
      }
    ],
    "restrictions": ["Restrições e precauções"]
  },
  "treatment": {
    "immediate": ["Ações imediatas recomendadas"],
    "shortTerm": ["Tratamento de curto prazo"],
    "longTerm": ["Recomendações de longo prazo"],
    "lifestyle": ["Mudanças no estilo de vida"]
  },
  "followUpNeeded": true/false,
  "followUpTimeframe": "Prazo recomendado para consulta médica",
  "emergencyWarning": "Alerta se for necessário atendimento de emergência imediato",
  "professionalConsultationRequired": true/false,
  "additionalTests": ["Exames complementares recomendados"]
}

IMPORTANTE:
1. Esta é apenas uma análise preliminar. SEMPRE recomende consulta com profissional de saúde
2. Seja conservador em diagnósticos e tratamentos
3. Priorize a segurança do paciente
4. Indique claramente quando é necessário atendimento de emergência
5. Use linguagem clara e acessível
6. Forneça apenas informações baseadas em evidências médicas
7. Nunca substitua a consulta médica profissional

Retorne APENAS o JSON, sem formatação adicional.`;

    // 6. Chamar API Gemini usando REST API
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API Key do Gemini não configurada');
    }

    const requestBody: any = {
      contents: [
        {
          parts: [{ text: healthPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    };

    // Adicionar imagem se disponível
    if (imageBase64 && imageFile) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: imageFile.type,
          data: imageBase64,
        },
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API erro: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData.candidates[0]?.content?.parts[0]?.text || '';

    // 7. Parsear resposta JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta inválida da IA');
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // 8. Buscar profissionais recomendados
    const specialty = analysisData.specialtyArea || 'Clínica Geral';
    const recommendedProfessionals = healthProfessionalsDatabase[specialty] || 
                                     healthProfessionalsDatabase['Clínica Geral'] || [];

    // 9. Salvar no banco de dados
    const healthAnalysis = await prisma.healthAnalysis.create({
      data: {
        userId: user.id,
        imageUrl: imageFile ? `health-${Date.now()}.jpg` : null,
        symptoms: symptoms.split(',').map(s => s.trim()),
        diagnosis: analysisData.diagnosis,
        specialtyArea: specialty,
        confidence: analysisData.confidence,
        severity: analysisData.severity,
        prescription: analysisData.prescription,
        treatment: analysisData.treatment,
        recommendedProfessionals: recommendedProfessionals,
        followUpNeeded: analysisData.followUpNeeded,
        followUpDate: analysisData.followUpNeeded ? 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 dias
        notes: additionalInfo,
      },
    });

    // 10. Criar notificação se for crítico
    if (analysisData.severity === 'critical' || analysisData.severity === 'high') {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: '⚠️ Análise de Saúde Requer Atenção',
          message: `Sua análise de saúde indica ${analysisData.severity === 'critical' ? 'condição crítica' : 'alta severidade'}. Consulte um profissional imediatamente.`,
          type: 'warning',
          link: `/health/analysis/${healthAnalysis.id}`,
        },
      });
    }

    // 11. Retornar resposta completa
    return NextResponse.json({
      success: true,
      analysisId: healthAnalysis.id,
      diagnosis: analysisData.diagnosis,
      specialtyArea: specialty,
      confidence: analysisData.confidence,
      severity: analysisData.severity,
      prescription: analysisData.prescription,
      treatment: analysisData.treatment,
      recommendedProfessionals: recommendedProfessionals.slice(0, 3), // Top 3 profissionais
      followUpNeeded: analysisData.followUpNeeded,
      followUpTimeframe: analysisData.followUpTimeframe,
      emergencyWarning: analysisData.emergencyWarning,
      professionalConsultationRequired: analysisData.professionalConsultationRequired,
      additionalTests: analysisData.additionalTests,
    });

  } catch (error: any) {
    console.error('Erro na análise de saúde:', error);
    return NextResponse.json({
      error: 'Erro ao processar análise de saúde',
      details: error.message,
    }, { status: 500 });
  }
}
