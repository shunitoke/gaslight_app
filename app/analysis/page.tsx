'use client';

import React, { useState, useEffect } from 'react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/card';
import type { AnalysisResult, AnalysisSection, Participant } from '../../features/analysis/types';
import { useLanguage } from '../../features/i18n';

export const dynamic = 'force-dynamic'; // Disable static generation

type AnalysisPageProps = {
  analysisId?: string;
};

export default function AnalysisPage() {
  const { t, locale } = useLanguage();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPremiumAnalysis, setIsPremiumAnalysis] = useState<boolean>(false);

  // Get localized section title
  const getSectionTitle = (sectionId: string, fallbackTitle: string): string => {
    const translationKey = `section_${sectionId}` as keyof typeof t;
    const translated = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translated && translated !== translationKey) {
      return translated;
    }
    // Otherwise use fallback title from AI
    return fallbackTitle;
  };

  // Ensure we only render content after client-side hydration
  useEffect(() => {
    // Use setTimeout to defer setState and avoid cascading renders warning
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    
    const stored = sessionStorage.getItem('currentAnalysis');
    const storedParticipants = sessionStorage.getItem('currentParticipants');
    const storedTier = sessionStorage.getItem('currentSubscriptionTier');
    const storedFeatures = sessionStorage.getItem('currentFeatures');
    
    if (stored) {
      try {
        setAnalysis(JSON.parse(stored));
        setLoading(false);
      } catch {
        setError('Failed to parse analysis data');
        setLoading(false);
      }
    } else {
      setError('No analysis found');
      setLoading(false);
    }
    
    if (storedParticipants) {
      try {
        setParticipants(JSON.parse(storedParticipants));
      } catch {
        // Ignore participant parsing errors
      }
    }

    // Derive whether this was a premium analysis from stored subscription info
    try {
      const tier = storedTier || 'free';
      let features: { canAnalyzeMedia?: boolean; canUseEnhancedAnalysis?: boolean } = {};
      if (storedFeatures) {
        features = JSON.parse(storedFeatures);
      }
      const premium =
        tier === 'premium' ||
        features.canAnalyzeMedia === true ||
        features.canUseEnhancedAnalysis === true;
      setIsPremiumAnalysis(premium);
    } catch {
      // If parsing fails, default to free
      setIsPremiumAnalysis(false);
    }
    
    return () => clearTimeout(timer);
  }, []);

  // Show consistent loading state with proper theme
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">{t('analyzing')}</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <p className="text-foreground">{error || t('noAnalysisFound')}</p>
          <Button onClick={() => (window.location.href = '/')}>
            {t('backToHome')}
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSectionTitle = (section: AnalysisSection): string => {
    return getSectionTitle(section.id, section.title);
  };

  const generateTextReport = (): string => {
    const dateStr = formatDate(analysis.createdAt);
    const reportTitle = t('exportReportTitle');
    const generatedBy = t('exportGeneratedBy');
    
    let report = `${reportTitle} - ${dateStr}\n\n`;
    report += `${t('exportOverview')}: ${replaceParticipantIds(analysis.overviewSummary)}\n\n`;
    
    report += `${t('exportScores')}:\n`;
    report += `- ${t('gaslightingRisk')}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%\n`;
    report += `- ${t('conflictIntensity')}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%\n`;
    report += `- ${t('supportiveness')}: ${(analysis.supportivenessScore * 100).toFixed(0)}%\n`;
    report += `- ${t('apologyFrequency')}: ${(analysis.apologyFrequencyScore * 100).toFixed(0)}%\n\n`;
    
    report += `${t('exportPatterns')}:\n`;
    analysis.sections.forEach((section) => {
      const title = formatSectionTitle(section);
      report += `\n- ${title}: `;
      if (section.score !== undefined) {
        report += `${t('score')}: ${(section.score * 100).toFixed(0)}%\n`;
      } else {
        report += '\n';
      }
      report += `  ${t('scientificAnalysis')}: ${replaceParticipantIds(section.summary)}\n`;
      if (section.plainSummary) {
        report += `  ${t('plainLanguage')}: ${replaceParticipantIds(section.plainSummary)}\n`;
      }
      if (section.evidenceSnippets.length > 0) {
        report += `  ${t('exportEvidence')}:\n`;
        section.evidenceSnippets.forEach((evidence) => {
          const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
          const formattedExplanation = replaceParticipantIds(evidence.explanation);
          const participantInfo = formatParticipantName(formattedExcerpt);
          
          if (participantInfo) {
            report += `    ${participantInfo.name}: "${participantInfo.remainingText}"\n`;
          } else {
            report += `    "${formattedExcerpt}"\n`;
          }
          report += `    ${formattedExplanation}\n\n`;
        });
      }
    });
    
    report += `\n${generatedBy}`;
    return report;
  };

  const copySummary = async () => {
    const summary = generateTextReport();
    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = summary;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  /**
   * Replace participant IDs in text with display names
   * Simple replacement - assumes AI follows format: "Name: \"text\""
   */
  const replaceParticipantIds = (text: string): string => {
    let result = text;
    
    // Replace participant IDs in various formats
    participants.forEach((participant) => {
      const id = participant.id;
      const idWithoutPrefix = id.replace(/^participant_/i, '');
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedIdWithoutPrefix = idWithoutPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Replace exact ID matches (case-insensitive)
      result = result.replace(new RegExp(`\\b${escapedId}\\b`, 'gi'), participant.displayName);
      
      // Replace "participant_xxx" patterns
      result = result.replace(new RegExp(`participant_${escapedIdWithoutPrefix}`, 'gi'), participant.displayName);
      
      // Replace patterns like "participant_xxx:" with "Name:"
      result = result.replace(new RegExp(`participant_${escapedIdWithoutPrefix}:`, 'gi'), `${participant.displayName}:`);
    });
    
    return result;
  };

  /**
   * Extract and format participant name from text
   * Assumes format: "Name: \"text\"" (no quotes before name)
   */
  const formatParticipantName = (text: string): { name: string; remainingText: string } | null => {
    // Look for patterns like "Name: \"text\"" or "Name: text"
    const match = text.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const potentialName = match[1].trim();
      let remainingText = match[2].trim();
      
      // Remove quotes from remaining text if they're at the start/end
      if ((remainingText.startsWith('"') && remainingText.endsWith('"')) ||
          (remainingText.startsWith('"') && remainingText.endsWith('"')) ||
          (remainingText.startsWith('«') && remainingText.endsWith('»'))) {
        remainingText = remainingText.slice(1, -1).trim();
      }
      
      // Find participant by ID or display name
      const participant = participants.find(p => {
        const idLower = p.id.toLowerCase();
        const idWithoutPrefix = idLower.replace(/^participant_/, '');
        const potentialNameLower = potentialName.toLowerCase();
        
        return (
          idLower === potentialNameLower ||
          idWithoutPrefix === potentialNameLower ||
          potentialNameLower.includes(idWithoutPrefix) ||
          potentialNameLower === p.displayName.toLowerCase()
        );
      });
      
      if (participant) {
        return { name: participant.displayName, remainingText };
      }
      
      // Try to extract name from participant ID format
      if (potentialName.toLowerCase().startsWith('participant_')) {
        const nameFromId = potentialName
          .replace(/^participant_/i, '')
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        return { name: nameFromId, remainingText };
      }
      
      // If it looks like a name (not an ID), use it as-is
      if (!potentialName.toLowerCase().includes('participant')) {
        return { name: potentialName, remainingText };
      }
    }
    return null;
  };

  const exportTXT = () => {
    const text = generateTextReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      analysisId: analysis.id,
      createdAt: analysis.createdAt,
      locale: locale,
      overview: analysis.overviewSummary,
      scores: {
        gaslightingRisk: analysis.gaslightingRiskScore,
        conflictIntensity: analysis.conflictIntensityScore,
        supportiveness: analysis.supportivenessScore,
        apologyFrequency: analysis.apologyFrequencyScore
      },
      sections: analysis.sections.map((s) => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        plainSummary: s.plainSummary,
        score: s.score,
        evidenceSnippets: s.evidenceSnippets.map((e) => ({
          excerpt: replaceParticipantIds(e.excerpt),
          explanation: replaceParticipantIds(e.explanation),
          messageId: e.messageId,
          mediaArtifactId: e.mediaArtifactId
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${analysis.id.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      
      // Create a temporary visible container for PDF generation
      // Make it FULLY visible in viewport for html2canvas to capture
      const container = document.createElement('div');
      container.id = 'pdf-export-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '210mm';
      container.style.minWidth = '210mm';
      container.style.maxWidth = '210mm';
      container.style.padding = '5mm';
      container.style.backgroundColor = '#fff';
      container.style.color = '#000';
      container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
      container.style.fontSize = '11px';
      container.style.lineHeight = '1.4';
      container.style.zIndex = '-1';
      container.style.boxSizing = 'border-box';
      container.style.overflow = 'visible';
      container.style.display = 'block';
      // Must be visible for html2canvas, but positioned off-screen
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      // Move off-screen but keep visible for rendering
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      container.style.transform = `translateX(${viewportWidth + 200}px)`;
      
      // Build HTML content
      let html = `
        <div style="margin-bottom: 8px;">
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportReportTitle')}</h1>
          <p style="font-size: 9px; color: #666; margin: 0;">${formatDate(analysis.createdAt)}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportOverview')}</h2>
          <p style="margin: 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(analysis.overviewSummary)}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportScores')}</h2>
          <ul style="margin: 0; padding-left: 12px;">
            <li style="margin-bottom: 2px; font-size: 10px;">${t('gaslightingRisk')}: ${(analysis.gaslightingRiskScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('conflictIntensity')}: ${(analysis.conflictIntensityScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('supportiveness')}: ${(analysis.supportivenessScore * 100).toFixed(0)}%</li>
            <li style="margin-bottom: 2px; font-size: 10px;">${t('apologyFrequency')}: ${(analysis.apologyFrequencyScore * 100).toFixed(0)}%</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 8px;">
          <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 4px; color: #000;">${t('exportPatterns')}</h2>
      `;

      analysis.sections.forEach((section) => {
        const title = formatSectionTitle(section);
        html += `
          <div style="margin-bottom: 8px; page-break-inside: avoid;">
            <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 3px; color: #000;">${title}</h3>
        `;
        
        if (section.score !== undefined) {
          html += `<p style="font-size: 9px; color: #666; margin: 0 0 4px 0;">${t('score')}: ${(section.score * 100).toFixed(0)}%</p>`;
        }
        
        html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('scientificAnalysis')}:</p>
            <p style="margin: 0 0 4px 0; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(section.summary)}</p>
        `;
        
        if (section.plainSummary) {
          html += `
            <p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('plainLanguage')}:</p>
            <p style="margin: 0 0 4px 0; font-style: italic; color: #333; text-align: justify; word-wrap: break-word; font-size: 10px;">${replaceParticipantIds(section.plainSummary)}</p>
          `;
        }
        
        if (section.evidenceSnippets.length > 0) {
          html += `<p style="font-size: 10px; font-weight: bold; margin: 4px 0 2px 0; color: #000;">${t('exportEvidence')}:</p>`;
          section.evidenceSnippets.forEach((evidence) => {
            const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
            const formattedExplanation = replaceParticipantIds(evidence.explanation);
            const participantInfo = formatParticipantName(formattedExcerpt);
            
            html += `
              <div style="margin: 4px 0; padding-left: 8px; border-left: 2px solid #22c55e; page-break-inside: avoid;">
            `;
            
            if (participantInfo) {
              html += `
                <p style="margin: 0 0 2px 0; font-weight: bold; font-style: italic; color: #22c55e; word-wrap: break-word; font-size: 9px;">
                  ${participantInfo.name}: "${participantInfo.remainingText}"
                </p>
              `;
            } else {
              html += `
                <p style="margin: 0 0 2px 0; font-style: italic; color: #22c55e; word-wrap: break-word; font-size: 9px;">
                  "${formattedExcerpt}"
                </p>
              `;
            }
            
            html += `
                <p style="margin: 0; font-size: 9px; color: #666; word-wrap: break-word;">${formattedExplanation}</p>
              </div>
            `;
          });
        }
        
        html += `</div>`;
      });

      html += `
        </div>
        <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #ddd;">
          <p style="font-size: 7px; color: #999; margin: 0; text-align: center;">${t('exportGeneratedBy')}</p>
        </div>
      `;

      container.innerHTML = html;
      
      // Add to DOM - hidden but still renderable for html2canvas
      document.body.appendChild(container);
      
      // Force layout recalculation
      void container.offsetHeight;
      
      // Wait for fonts and rendering
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Verify element is actually visible
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Container has zero dimensions');
      }

      // Get actual dimensions
      const containerWidth = container.scrollWidth || container.offsetWidth || 794;
      const containerHeight = container.scrollHeight || container.offsetHeight;
      
      console.log('Container dimensions:', { width: containerWidth, height: containerHeight });
      
      // Use html2canvas directly first to debug
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: containerWidth,
        height: containerHeight,
        windowWidth: containerWidth,
        windowHeight: containerHeight
      });
      
      console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas is empty');
      }
      
      // Convert canvas to image and add to PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const margin = 3; // Small margins on all sides
      const imgWidth = 210 - 2 * margin; // A4 width minus small margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add image to PDF with proper page breaks and margins
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableHeight = pageHeight - 2 * margin; // Usable height per page (with top and bottom margins)
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / usableHeight);
      
      // Split image across pages with proper margins
      let sourceY = 0;
      let remainingHeight = imgHeight;
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          doc.addPage();
        }
        
        // Calculate how much of the image to show on this page
        const heightOnThisPage = Math.min(remainingHeight, usableHeight);
        const sourceHeight = (heightOnThisPage / imgHeight) * canvas.height;
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          // Draw the slice of the original canvas
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
          // Add to PDF with top margin
          doc.addImage(pageImgData, 'PNG', margin, margin, imgWidth, heightOnThisPage);
        }
        
        sourceY += sourceHeight;
        remainingHeight -= heightOnThisPage;
      }
      
      doc.save(`analysis-${analysis.id.substring(0, 8)}.pdf`);
      
      // Clean up
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(locale === 'ru' 
        ? 'Ошибка при создании PDF. Попробуйте экспортировать в TXT или JSON.' 
        : 'Error generating PDF. Please try exporting as TXT or JSON.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{t('analysisReport')}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isPremiumAnalysis
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted text-muted-foreground border border-border/60'
                }`}
              >
                {isPremiumAnalysis ? t('premium_badge') : t('free_badge')}
              </span>
            </div>
            <p className="text-muted-foreground mb-1">{analysis.overviewSummary}</p>
            <p className="text-xs text-muted-foreground">
              {isPremiumAnalysis ? t('premium_hint') : t('free_hint')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={copySummary} variant="outline" size="sm">
              {copySuccess ? (locale === 'ru' ? 'Скопировано!' : 'Copied!') : (locale === 'ru' ? 'Копировать' : 'Copy Summary')}
            </Button>
            <Button onClick={exportTXT} variant="outline" size="sm">
              {t('exportTXT')}
            </Button>
            <Button onClick={exportJSON} variant="outline" size="sm">
              {t('exportJSON')}
            </Button>
            <Button onClick={exportPDF} variant="outline" size="sm">
              {t('exportPDF')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-sm text-muted-foreground">{t('gaslightingRisk')}</div>
            <div className="text-2xl font-bold text-foreground">
              {(analysis.gaslightingRiskScore * 100).toFixed(0)}%
            </div>
          </Card>
          <Card>
            <div className="text-sm text-muted-foreground">{t('conflictIntensity')}</div>
            <div className="text-2xl font-bold text-foreground">
              {(analysis.conflictIntensityScore * 100).toFixed(0)}%
            </div>
          </Card>
          <Card>
            <div className="text-sm text-muted-foreground">{t('supportiveness')}</div>
            <div className="text-2xl font-bold text-foreground">
              {(analysis.supportivenessScore * 100).toFixed(0)}%
            </div>
          </Card>
          <Card>
            <div className="text-sm text-muted-foreground">{t('apologyFrequency')}</div>
            <div className="text-2xl font-bold text-foreground">
              {(analysis.apologyFrequencyScore * 100).toFixed(0)}%
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {analysis.sections.map((section: AnalysisSection, index: number) => (
            <Card key={`${section.id}-${index}`}>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {getSectionTitle(section.id, section.title)}
              </h2>
              {section.score !== undefined && (
                <div className="text-sm text-muted-foreground mb-3">
                  {t('score')}: {(section.score * 100).toFixed(0)}%
                </div>
              )}
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{t('scientificAnalysis')}:</p>
                  <p className="text-foreground">{section.summary}</p>
                </div>
                {section.plainSummary && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{t('plainLanguage')}:</p>
                    <p className="text-foreground italic">{section.plainSummary}</p>
                  </div>
                )}
              </div>
              {section.evidenceSnippets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">{t('evidence')}</h3>
                  {section.evidenceSnippets.map((evidence, idx) => {
                    // Replace participant IDs in excerpt and explanation
                    const formattedExcerpt = replaceParticipantIds(evidence.excerpt);
                    const formattedExplanation = replaceParticipantIds(evidence.explanation);
                    
                    // Try to extract participant name from excerpt
                    const participantInfo = formatParticipantName(formattedExcerpt);
                    
                    return (
                      <div key={idx} className="border-l-4 border-primary/50 pl-4 py-2">
                        {participantInfo ? (
                          <div className="mb-2">
                            <span className="font-semibold italic text-primary text-base mr-2">
                              {participantInfo.name}:
                            </span>
                            <span className="italic text-foreground/90">&ldquo;{participantInfo.remainingText}&rdquo;</span>
                          </div>
                        ) : (
                          <p className="italic text-foreground/90 mb-1">&ldquo;{formattedExcerpt}&rdquo;</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">{formattedExplanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Disclaimers about purpose and limitations */}
        <div className="mt-4 text-xs text-muted-foreground space-y-1.5">
          <p>{t('report_disclaimer_main')}</p>
          <p>{t('report_disclaimer_safety')}</p>
        </div>
      </div>
    </div>
  );
}
