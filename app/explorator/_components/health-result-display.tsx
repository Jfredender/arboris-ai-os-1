
'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Pill, 
  Stethoscope, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText,
  ExternalLink,
  Shield,
  Activity,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HealthResultDisplayProps {
  result: any;
  onClose?: () => void;
}

export default function HealthResultDisplay({ result, onClose }: HealthResultDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-[var(--md-text-secondary)]';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10';
      case 'high':
        return 'bg-orange-500/10';
      case 'medium':
        return 'bg-yellow-500/10';
      case 'low':
        return 'bg-green-500/10';
      default:
        return 'bg-[var(--md-surface-elevated1)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[var(--md-surface-elevated1)] rounded-2xl p-6 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-[var(--md-primary-container)]">
              <Heart className="w-6 h-6 text-[var(--md-primary-main)]" />
            </div>
            <div>
              <h2 className={`${typography.titleLarge}`}>Análise de Saúde</h2>
              <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                {result.specialtyArea}
              </p>
            </div>
          </div>
          <Badge className={`${getSeverityBg(result.severity)} ${getSeverityColor(result.severity)}`}>
            {result.severity?.toUpperCase()}
          </Badge>
        </div>

        {/* Emergency Warning */}
        {result.emergencyWarning && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border-2 border-red-500 flex items-start gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className={`${typography.titleMedium} text-red-500 mb-2`}>
                ⚠️ ATENÇÃO URGENTE
              </h3>
              <p className={`${typography.bodyMedium} text-red-400`}>
                {result.emergencyWarning}
              </p>
            </div>
          </motion.div>
        )}

        {/* Diagnosis */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--md-surface-elevated2)]">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-5 h-5 text-[var(--md-primary-main)]" />
            <h3 className={`${typography.titleMedium}`}>Diagnóstico</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-1`}>
                Diagnóstico Principal
              </p>
              <p className={`${typography.bodyLarge} text-[var(--md-text-primary)]`}>
                {result.diagnosis?.primary}
              </p>
            </div>
            {result.diagnosis?.description && (
              <div>
                <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-1`}>
                  Descrição
                </p>
                <p className={`${typography.bodyMedium} text-[var(--md-text-secondary)]`}>
                  {result.diagnosis.description}
                </p>
              </div>
            )}
            {result.diagnosis?.differential && result.diagnosis.differential.length > 0 && (
              <div>
                <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}>
                  Diagnósticos Diferenciais
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.diagnosis.differential.map((diag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-[var(--md-surface-elevated3)]">
                      {diag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-[var(--md-text-secondary)]">
              <Activity className="w-4 h-4" />
              <span className={`${typography.bodySmall}`}>
                Confiança: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Prescription */}
        {result.prescription?.medications && result.prescription.medications.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--md-surface-elevated2)]">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-[var(--md-secondary-main)]" />
              <h3 className={`${typography.titleMedium}`}>Prescrição</h3>
            </div>
            <div className="space-y-3">
              {result.prescription.medications.map((med: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-[var(--md-surface-elevated3)]">
                  <p className={`${typography.titleSmall} mb-2`}>{med.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--md-text-secondary)]">Dosagem:</span>
                      <span className="ml-2">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-[var(--md-text-secondary)]">Frequência:</span>
                      <span className="ml-2">{med.frequency}</span>
                    </div>
                    <div>
                      <span className="text-[var(--md-text-secondary)]">Duração:</span>
                      <span className="ml-2">{med.duration}</span>
                    </div>
                  </div>
                  {med.instructions && (
                    <p className={`${typography.bodySmall} text-[var(--md-text-secondary)] mt-2`}>
                      {med.instructions}
                    </p>
                  )}
                </div>
              ))}
              {result.prescription.restrictions && result.prescription.restrictions.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10">
                  <Shield className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className={`${typography.labelSmall} text-orange-500 mb-1`}>Restrições:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.prescription.restrictions.map((restriction: string, idx: number) => (
                        <li key={idx} className={`${typography.bodySmall} text-orange-400`}>
                          {restriction}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Treatment Plan */}
        {result.treatment && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--md-surface-elevated2)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[var(--md-info)]" />
              <h3 className={`${typography.titleMedium}`}>Plano de Tratamento</h3>
            </div>
            <div className="space-y-4">
              {result.treatment.immediate && result.treatment.immediate.length > 0 && (
                <div>
                  <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}>
                    Ações Imediatas
                  </p>
                  <ul className="space-y-1">
                    {result.treatment.immediate.map((action: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span className={`${typography.bodyMedium}`}>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.treatment.shortTerm && result.treatment.shortTerm.length > 0 && (
                <div>
                  <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}>
                    Curto Prazo
                  </p>
                  <ul className="space-y-1">
                    {result.treatment.shortTerm.map((action: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className={`${typography.bodyMedium}`}>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.treatment.lifestyle && result.treatment.lifestyle.length > 0 && (
                <div>
                  <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}>
                    Mudanças no Estilo de Vida
                  </p>
                  <ul className="space-y-1">
                    {result.treatment.lifestyle.map((change: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                        <span className={`${typography.bodyMedium}`}>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended Professionals */}
        {result.recommendedProfessionals && result.recommendedProfessionals.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--md-surface-elevated2)]">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-[var(--md-primary-main)]" />
              <h3 className={`${typography.titleMedium}`}>Profissionais Recomendados</h3>
            </div>
            <div className="space-y-3">
              {result.recommendedProfessionals.map((prof: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-[var(--md-surface-elevated3)] border border-[var(--md-divider)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`${typography.titleMedium} mb-1`}>{prof.name}</p>
                      <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                        {prof.specialty} • {prof.crm}
                      </p>
                    </div>
                    {prof.rating && (
                      <Badge className="bg-yellow-500/20 text-yellow-500">
                        ★ {prof.rating}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {prof.phone && (
                      <div className="flex items-center gap-2 text-[var(--md-text-secondary)]">
                        <Phone className="w-4 h-4" />
                        <span className={`${typography.bodySmall}`}>{prof.phone}</span>
                      </div>
                    )}
                    {prof.email && (
                      <div className="flex items-center gap-2 text-[var(--md-text-secondary)]">
                        <Mail className="w-4 h-4" />
                        <span className={`${typography.bodySmall}`}>{prof.email}</span>
                      </div>
                    )}
                    {prof.address && (
                      <div className="flex items-center gap-2 text-[var(--md-text-secondary)] col-span-2">
                        <MapPin className="w-4 h-4" />
                        <span className={`${typography.bodySmall}`}>
                          {prof.address}, {prof.city} - {prof.state}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {prof.telehealth && (
                      <Badge variant="outline" className="text-green-500">Telemedicina</Badge>
                    )}
                    {prof.acceptsInsurance && (
                      <Badge variant="outline" className="text-blue-500">Aceita Convênio</Badge>
                    )}
                    {prof.yearsExperience && (
                      <Badge variant="outline">{prof.yearsExperience} anos</Badge>
                    )}
                  </div>
                  {prof.consultationFee && (
                    <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                      Consulta: R$ {prof.consultationFee.toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up */}
        {result.followUpNeeded && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h3 className={`${typography.titleSmall} text-blue-500 mb-1`}>
                  Acompanhamento Necessário
                </h3>
                <p className={`${typography.bodyMedium} text-blue-400`}>
                  {result.followUpTimeframe}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Tests */}
        {result.additionalTests && result.additionalTests.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--md-surface-elevated2)]">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[var(--md-secondary-main)]" />
              <h3 className={`${typography.titleMedium}`}>Exames Recomendados</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.additionalTests.map((test: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-[var(--md-surface-elevated3)]">
                  {test}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-6">
          <p className={`${typography.bodySmall} text-orange-400`}>
            ⚠️ <strong>Importante:</strong> Esta é uma análise preliminar baseada em inteligência artificial. 
            Não substitui consulta médica profissional. Consulte sempre um médico qualificado para diagnóstico 
            e tratamento adequados.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)]"
          >
            Fechar
          </Button>
          <Button
            variant="outline"
            className="border-[var(--md-divider)]"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
