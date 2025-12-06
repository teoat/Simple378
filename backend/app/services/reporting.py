from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from typing import Dict, Any

class ReportingService:
    def __init__(self):
        self.styles = getSampleStyleSheet()

    async def generate_evidence_package(self, case_data: Dict[str, Any]) -> bytes:
        """
        Generates a PDF report for the given case data.
        Returns the PDF content as bytes.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []

        # Title
        title_style = self.styles['Title']
        story.append(Paragraph(f"Evidence Package: Case {case_data.get('id', 'Unknown')}", title_style))
        story.append(Spacer(1, 12))

        # Case Details
        normal_style = self.styles['Normal']
        story.append(Paragraph(f"<b>Subject:</b> {case_data.get('subject_id', 'N/A')}", normal_style))
        story.append(Paragraph(f"<b>Status:</b> {case_data.get('status', 'Open')}", normal_style))
        story.append(Paragraph(f"<b>Risk Score:</b> {case_data.get('risk_score', 'N/A')}", normal_style))
        story.append(Spacer(1, 12))

        # Summary
        story.append(Paragraph("<b>Investigation Summary:</b>", normal_style))
        story.append(Paragraph(case_data.get('description', 'No description provided.'), normal_style))
        story.append(Spacer(1, 24))

        # Evidence Table
        evidence_list = case_data.get('evidence', [])
        if evidence_list:
            story.append(Paragraph("<b>Evidence Log:</b>", normal_style))
            story.append(Spacer(1, 6))
            
            table_data = [['ID', 'Type', 'Description', 'Date']]
            for item in evidence_list:
                table_data.append([
                    item.get('id', ''),
                    item.get('type', ''),
                    item.get('description', ''),
                    item.get('date', '')
                ])
                
            t = Table(table_data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(t)
        else:
            story.append(Paragraph("No evidence items recorded.", normal_style))

        # Chain of Custody
        story.append(Spacer(1, 24))
        story.append(Paragraph("<b>Chain of Custody:</b>", normal_style))
        
        custody_log = case_data.get('chain_of_custody', [])
        if custody_log:
            # Create custody log table
            custody_headers = ['Timestamp', 'Action', 'Actor', 'Evidence Hash (SHA-256)']
            custody_data = [custody_headers]
            
            for entry in custody_log:
                custody_data.append([
                    entry.get('timestamp', 'N/A'),
                    entry.get('action', 'N/A'),
                    str(entry.get('actor_id', 'System'))[:8] + '...',  # Truncate ID
                    entry.get('evidence_hash', 'N/A')[:16] + '...'  # Truncate hash for display
                ])
            
            custody_table = Table(custody_data)
            custody_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
            ]))
            story.append(custody_table)
        else:
            story.append(Paragraph("No custody log entries. System generated report.", normal_style))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
