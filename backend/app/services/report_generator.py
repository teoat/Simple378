from datetime import datetime
from typing import Dict, Any, List
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as ReportLabImage
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    def _setup_styles(self):
        self.doc_title_style = ParagraphStyle(
            'DocTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            leading=30,
            alignment=1, # Center
            spaceAfter=20,
            textColor=colors.HexColor('#1e40af') # Blue-800
        )
        self.section_header = ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            leading=20,
            spaceBefore=15,
            spaceAfter=10,
            textColor=colors.HexColor('#1f2937'), # Gray-800
            borderPadding=(0, 0, 5, 0),
            borderColor=colors.HexColor('#e5e7eb'),
            borderWidth=1
        )
        self.normal_style = self.styles['Normal']
        self.normal_style.fontSize = 11
        self.normal_style.leading = 14

    def generate_pdf(self, case_id: str, case_data: Dict[str, Any]) -> bytes:
        """
        Generate a professional PDF report for a given case using ReportLab.
        Returns the PDF content as bytes.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch,
            title=f"Case Report - {case_id}"
        )

        story = []

        # 1. Header & Title
        story.append(Paragraph(f"Investigation Report", self.doc_title_style))
        story.append(Paragraph(f"CONFIDENTIAL", ParagraphStyle('Confidential', parent=self.normal_style, alignment=1, textColor=colors.red)))
        story.append(Spacer(1, 0.25 * inch))

        # 2. Case Information Table
        case_info = [
            ["Case ID:", case_id],
            ["Subject:", case_data.get('subject_name', 'Unknown')],
            ["Status:", case_data.get('status', 'Unknown')],
            ["Generated Date:", datetime.utcnow().strftime('%Y-%m-%d')],
            ["Risk Score:", f"{case_data.get('risk_score', 0)}/100"]
        ]
        
        t = Table(case_info, colWidths=[2*inch, 4*inch])
        t.setStyle(TableStyle([
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#4b5563')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#f9fafb')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.3 * inch))

        # 3. Executive Summary
        story.append(Paragraph("Executive Summary", self.section_header))
        summary_text = case_data.get('description', 'No summary provided for this case.')
        story.append(Paragraph(summary_text, self.normal_style))
        story.append(Spacer(1, 0.2 * inch))

        # 4. Key Findings
        story.append(Paragraph("Key Findings", self.section_header))
        findings = case_data.get('findings', [])
        
        if findings:
            for i, finding in enumerate(findings, 1):
                f_title = f"<b>{i}. {finding.get('title', 'Untitled Finding')}</b>"
                f_desc = finding.get('description', '')
                f_type = f"<i>Type: {finding.get('type', 'General')}</i>"
                
                story.append(Paragraph(f_title, self.normal_style))
                story.append(Paragraph(f_type, ParagraphStyle('Type', parent=self.normal_style, leftIndent=15, textColor=colors.gray)))
                story.append(Paragraph(f_desc, ParagraphStyle('Desc', parent=self.normal_style, leftIndent=15)))
                story.append(Spacer(1, 0.1 * inch))
        else:
             story.append(Paragraph("No specific findings recorded.", self.normal_style))

        # 5. Financial Overview (if stats available)
        story.append(Paragraph("Financial Summary", self.section_header))
        stats = case_data.get('reconciliation_stats', {})
        if stats:
             fin_data = [
                 ["Match Rate:", f"{stats.get('match_rate', 0)}%"],
                 ["Conflicts Resolved:", str(stats.get('conflicts_resolved', 0))],
             ]
             story.append(Table(fin_data, colWidths=[2*inch, 4*inch], style=TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey)])))
        else:
            story.append(Paragraph("No financial reconciliation data available.", self.normal_style))

        # 6. Conclusion
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("Verdict & Recommendations", self.section_header))
        rec = case_data.get('recommendation', 'No recommendation provided.')
        story.append(Paragraph(rec, self.normal_style))

        # Footer / Disclaimer
        story.append(Spacer(1, 1 * inch))
        disclaimer = "This document contains confidential information. Unauthorized distribution is prohibited. Generated by Simple378."
        story.append(Paragraph(disclaimer, ParagraphStyle('Footer', parent=self.normal_style, fontSize=8, textColor=colors.gray, alignment=1)))

        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

report_generator = ReportGenerator()
