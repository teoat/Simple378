from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from typing import Dict, Any
from datetime import datetime, timedelta
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.db.models import Subject, Transaction, AuditLog
from app.db.models import AnalysisResult


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
        title_style = self.styles["Title"]
        story.append(
            Paragraph(
                f"Evidence Package: Case {case_data.get('id', 'Unknown')}", title_style
            )
        )
        story.append(Spacer(1, 12))

        # Case Details
        normal_style = self.styles["Normal"]
        story.append(
            Paragraph(
                f"<b>Subject:</b> {case_data.get('subject_id', 'N/A')}", normal_style
            )
        )
        story.append(
            Paragraph(f"<b>Status:</b> {case_data.get('status', 'Open')}", normal_style)
        )
        story.append(
            Paragraph(
                f"<b>Risk Score:</b> {case_data.get('risk_score', 'N/A')}", normal_style
            )
        )
        story.append(Spacer(1, 12))

        # Summary
        story.append(Paragraph("<b>Investigation Summary:</b>", normal_style))
        story.append(
            Paragraph(
                case_data.get("description", "No description provided."), normal_style
            )
        )
        story.append(Spacer(1, 24))

        # Evidence Table
        evidence_list = case_data.get("evidence", [])
        if evidence_list:
            story.append(Paragraph("<b>Evidence Log:</b>", normal_style))
            story.append(Spacer(1, 6))

            table_data = [["ID", "Type", "Description", "Date"]]
            for item in evidence_list:
                table_data.append(
                    [
                        item.get("id", ""),
                        item.get("type", ""),
                        item.get("description", ""),
                        item.get("date", ""),
                    ]
                )

            t = Table(table_data)
            t.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            story.append(t)
        else:
            story.append(Paragraph("No evidence items recorded.", normal_style))

        # Chain of Custody
        story.append(Spacer(1, 24))
        story.append(Paragraph("<b>Chain of Custody:</b>", normal_style))

        custody_log = case_data.get("chain_of_custody", [])
        if custody_log:
            # Create custody log table
            custody_headers = [
                "Timestamp",
                "Action",
                "Actor",
                "Evidence Hash (SHA-256)",
            ]
            custody_data = [custody_headers]

            for entry in custody_log:
                custody_data.append(
                    [
                        entry.get("timestamp", "N/A"),
                        entry.get("action", "N/A"),
                        str(entry.get("actor_id", "System"))[:8] + "...",  # Truncate ID
                        entry.get("evidence_hash", "N/A")[:16]
                        + "...",  # Truncate hash for display
                    ]
                )

            custody_table = Table(custody_data)
            custody_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                        ("BACKGROUND", (0, 1), (-1, -1), colors.lightgrey),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ]
                )
            )
            story.append(custody_table)
        else:
            story.append(
                Paragraph(
                    "No custody log entries. System generated report.", normal_style
                )
            )

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    async def generate_report(
        report_def: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Generate report data based on the report definition.
        """
        report_data = {
            "title": report_def["title"],
            "description": report_def.get("description", ""),
            "generated_at": datetime.utcnow().isoformat(),
            "components": [],
        }

        for component in report_def["components"]:
            try:
                component_data = await ReportingService._generate_component_data(
                    component, db
                )
                report_data["components"].append(
                    {
                        "id": component["id"],
                        "type": component["type"],
                        "title": component["title"],
                        "data": component_data,
                    }
                )
            except Exception as e:
                # Add error component if data generation fails
                report_data["components"].append(
                    {
                        "id": component["id"],
                        "type": "error",
                        "title": component["title"],
                        "data": {"error": str(e)},
                    }
                )

        return report_data

    @staticmethod
    async def _generate_component_data(
        component: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Generate data for a specific report component.
        """
        data_source = component["data_source"]
        component_type = component["type"]
        config = component.get("config", {})

        if data_source == "transactions":
            return await ReportingService._get_transaction_data(
                component_type, config, db
            )
        elif data_source == "cases":
            return await ReportingService._get_case_data(component_type, config, db)
        elif data_source == "subjects":
            return await ReportingService._get_subject_data(component_type, config, db)
        elif data_source == "risk_scores":
            return await ReportingService._get_risk_score_data(
                component_type, config, db
            )
        elif data_source == "audit_logs":
            return await ReportingService._get_audit_data(component_type, config, db)
        elif data_source == "user_activity":
            return await ReportingService._get_user_activity_data(
                component_type, config, db
            )
        else:
            return {"error": f"Unknown data source: {data_source}"}

    @staticmethod
    async def _get_transaction_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate transaction-related data."""
        # Base query
        query = select(Transaction)

        # Apply filters
        if config.get("date_range"):
            days = int(config["date_range"].replace("d", ""))
            start_date = datetime.utcnow() - timedelta(days=days)
            query = query.where(Transaction.date >= start_date)

        if config.get("amount_min"):
            query = query.where(Transaction.amount >= config["amount_min"])

        if config.get("amount_max"):
            query = query.where(Transaction.amount <= config["amount_max"])

        # Execute query
        result = await db.execute(query)
        transactions = result.scalars().all()

        if component_type == "chart":
            chart_type = config.get("chart_type", "bar")

            if chart_type == "bar" and config.get("group_by") == "date":
                # Group by date
                date_groups = {}
                for tx in transactions:
                    date_key = tx.date.strftime("%Y-%m-%d") if tx.date else "unknown"
                    if date_key not in date_groups:
                        date_groups[date_key] = 0
                    date_groups[date_key] += 1

                return {
                    "labels": list(date_groups.keys()),
                    "datasets": [
                        {
                            "label": "Transaction Count",
                            "data": list(date_groups.values()),
                            "backgroundColor": "rgba(59, 130, 246, 0.5)",
                            "borderColor": "rgb(59, 130, 246)",
                            "borderWidth": 1,
                        }
                    ],
                }

            elif chart_type == "pie":
                # Transaction types distribution
                type_groups = {}
                for tx in transactions:
                    tx_type = getattr(tx, "transaction_type", "unknown") or "unknown"
                    type_groups[tx_type] = type_groups.get(tx_type, 0) + 1

                return {
                    "labels": list(type_groups.keys()),
                    "datasets": [
                        {
                            "data": list(type_groups.values()),
                            "backgroundColor": [
                                "#3B82F6",
                                "#EF4444",
                                "#10B981",
                                "#F59E0B",
                                "#8B5CF6",
                            ],
                        }
                    ],
                }

        elif component_type == "table":
            # Return table data
            table_data = []
            for tx in transactions[:100]:  # Limit for performance
                table_data.append(
                    {
                        "id": str(tx.id),
                        "date": tx.date.isoformat() if tx.date else None,
                        "amount": float(tx.amount) if tx.amount else 0,
                        "description": tx.description or "",
                        "source_bank": tx.source_bank or "",
                    }
                )

            return {
                "columns": [
                    {"key": "date", "label": "Date"},
                    {"key": "amount", "label": "Amount"},
                    {"key": "description", "label": "Description"},
                    {"key": "source_bank", "label": "Source Bank"},
                ],
                "rows": table_data,
            }

        elif component_type == "metric":
            total_amount = sum(float(tx.amount or 0) for tx in transactions)
            return {
                "value": len(transactions),
                "label": "Total Transactions",
                "secondary_value": f"${total_amount:,.2f}",
                "secondary_label": "Total Amount",
            }

        return {"error": "Unsupported component type for transactions"}

    @staticmethod
    async def _get_case_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate case-related data."""
        # Query cases with analysis results
        query = select(Subject, AnalysisResult).outerjoin(
            AnalysisResult, Subject.id == AnalysisResult.subject_id
        )

        result = await db.execute(query)
        rows = result.all()

        cases = []
        for row in rows:
            subject, analysis = row
            cases.append(
                {
                    "id": str(subject.id),
                    "subject_name": f"Subject {str(subject.id)[:8]}",
                    "status": analysis.adjudication_status if analysis else "new",
                    "risk_score": analysis.risk_score if analysis else 0,
                    "created_at": (
                        subject.created_at.isoformat() if subject.created_at else None
                    ),
                }
            )

        if component_type == "chart":
            chart_type = config.get("chart_type", "pie")

            if chart_type == "pie":
                # Status distribution
                status_groups = {}
                for case in cases:
                    status = case["status"] or "unknown"
                    status_groups[status] = status_groups.get(status, 0) + 1

                return {
                    "labels": list(status_groups.keys()),
                    "datasets": [
                        {
                            "data": list(status_groups.values()),
                            "backgroundColor": [
                                "#3B82F6",
                                "#EF4444",
                                "#10B981",
                                "#F59E0B",
                                "#8B5CF6",
                            ],
                        }
                    ],
                }

        elif component_type == "table":
            return {
                "columns": [
                    {"key": "subject_name", "label": "Subject"},
                    {"key": "status", "label": "Status"},
                    {"key": "risk_score", "label": "Risk Score"},
                    {"key": "created_at", "label": "Created"},
                ],
                "rows": cases[:100],
            }

        elif component_type == "metric":
            high_risk = len([c for c in cases if c["risk_score"] > 70])
            return {
                "value": len(cases),
                "label": "Total Cases",
                "secondary_value": high_risk,
                "secondary_label": "High Risk Cases",
            }

        return {"error": "Unsupported component type for cases"}

    @staticmethod
    async def _get_risk_score_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate risk score trend data."""
        # Get risk scores over time
        days = int(config.get("time_range", "30d").replace("d", ""))
        start_date = datetime.utcnow() - timedelta(days=days)

        query = (
            select(AnalysisResult)
            .where(AnalysisResult.created_at >= start_date)
            .order_by(AnalysisResult.created_at)
        )

        result = await db.execute(query)
        analyses = result.scalars().all()

        if component_type == "chart":
            chart_type = config.get("chart_type", "line")

            if chart_type == "line":
                # Group by date
                date_groups = {}
                for analysis in analyses:
                    date_key = (
                        analysis.created_at.strftime("%Y-%m-%d")
                        if analysis.created_at
                        else "unknown"
                    )
                    if date_key not in date_groups:
                        date_groups[date_key] = []
                    date_groups[date_key].append(analysis.risk_score)

                # Calculate averages
                labels = []
                avg_scores = []
                for date, scores in sorted(date_groups.items()):
                    labels.append(date)
                    avg_scores.append(sum(scores) / len(scores))

                return {
                    "labels": labels,
                    "datasets": [
                        {
                            "label": "Average Risk Score",
                            "data": avg_scores,
                            "borderColor": "rgb(239, 68, 68)",
                            "backgroundColor": "rgba(239, 68, 68, 0.1)",
                            "tension": 0.4,
                        }
                    ],
                }

        return {"error": "Unsupported component type for risk scores"}

    @staticmethod
    async def _get_subject_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate subject-related data."""
        query = select(Subject)
        result = await db.execute(query)
        subjects = result.scalars().all()

        if component_type == "metric":
            return {
                "value": len(subjects),
                "label": "Total Subjects",
                "secondary_value": len(
                    [
                        s
                        for s in subjects
                        if s.created_at and (datetime.utcnow() - s.created_at).days < 30
                    ]
                ),
                "secondary_label": "New This Month",
            }

        elif component_type == "table":
            table_data = []
            for subject in subjects[:100]:
                table_data.append(
                    {
                        "id": str(subject.id),
                        "created_at": (
                            subject.created_at.isoformat()
                            if subject.created_at
                            else None
                        ),
                        "has_pii": subject.encrypted_pii is not None,
                    }
                )

            return {
                "columns": [
                    {"key": "id", "label": "Subject ID"},
                    {"key": "created_at", "label": "Created"},
                    {"key": "has_pii", "label": "Has PII"},
                ],
                "rows": table_data,
            }

        return {"error": "Unsupported component type for subjects"}

    @staticmethod
    async def _get_audit_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate audit log data."""
        query = select(AuditLog).order_by(desc(AuditLog.timestamp)).limit(1000)
        result = await db.execute(query)
        logs = result.scalars().all()

        if component_type == "table":
            table_data = []
            for log in logs[:100]:
                table_data.append(
                    {
                        "timestamp": (
                            log.timestamp.isoformat() if log.timestamp else None
                        ),
                        "action": log.action,
                        "actor": str(log.actor_id) if log.actor_id else "System",
                        "resource": str(log.resource_id) if log.resource_id else "N/A",
                        "details": json.dumps(log.details) if log.details else "",
                    }
                )

            return {
                "columns": [
                    {"key": "timestamp", "label": "Time"},
                    {"key": "action", "label": "Action"},
                    {"key": "actor", "label": "User"},
                    {"key": "resource", "label": "Resource"},
                    {"key": "details", "label": "Details"},
                ],
                "rows": table_data,
            }

        return {"error": "Unsupported component type for audit logs"}

    @staticmethod
    async def _get_user_activity_data(
        component_type: str, config: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Generate user activity data."""
        # This would typically come from a user activity log table
        # For now, return mock data
        return {"error": "User activity data source not yet implemented"}

    @staticmethod
    async def export_report(
        report_data: Dict[str, Any], format: str, title: str
    ) -> Dict[str, Any]:
        """
        Export report in the specified format.
        """
        if format == "html":
            # Generate HTML report
            html_content = ReportingService._generate_html_report(report_data)
            return {
                "format": "html",
                "content": html_content,
                "filename": f"{title.replace(' ', '_')}.html",
                "content_type": "text/html",
            }

        elif format == "pdf":
            # Use existing PDF generation
            pdf_content = ReportingService().generate_evidence_package(report_data)
            return {
                "format": "pdf",
                "content": pdf_content,
                "filename": f"{title.replace(' ', '_')}.pdf",
                "content_type": "application/pdf",
            }

        elif format == "excel":
            # In a real implementation, use openpyxl or similar
            return {
                "format": "excel",
                "content": "Excel generation not implemented",
                "filename": f"{title.replace(' ', '_')}.xlsx",
                "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }

        return {"error": f"Unsupported format: {format}"}

    @staticmethod
    def _generate_html_report(report_data: Dict[str, Any]) -> str:
        """Generate HTML report content."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{report_data['title']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
                .component {{ margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; }}
                .component-header {{ background: #e9ecef; padding: 10px; font-weight: bold; }}
                .component-content {{ padding: 20px; }}
                table {{ width: 100%; border-collapse: collapse; }}
                th, td {{ border: 1px solid #dee2e6; padding: 8px; text-align: left; }}
                th {{ background: #f8f9fa; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{report_data['title']}</h1>
                <p>{report_data.get('description', '')}</p>
                <p><small>Generated: {report_data['generated_at']}</small></p>
            </div>
        """

        for component in report_data.get("components", []):
            html += f"""
            <div class="component">
                <div class="component-header">{component['title']}</div>
                <div class="component-content">
            """

            if component["type"] == "table" and "data" in component:
                data = component["data"]
                if "columns" in data and "rows" in data:
                    html += "<table><thead><tr>"
                    for col in data["columns"]:
                        html += f"<th>{col['label']}</th>"
                    html += "</tr></thead><tbody>"
                    for row in data["rows"][:50]:  # Limit rows for HTML
                        html += "<tr>"
                        for col in data["columns"]:
                            value = row.get(col["key"], "")
                            html += f"<td>{value}</td>"
                        html += "</tr>"
                    html += "</tbody></table>"

            elif component["type"] == "metric" and "data" in component:
                data = component["data"]
                html += f"""
                <div style="text-align: center; font-size: 2em; font-weight: bold;">
                    {data.get('value', 'N/A')}
                </div>
                <div style="text-align: center; color: #6c757d;">
                    {data.get('label', '')}
                </div>
                """

            else:
                html += f"<p>Data visualization for {component['type']} component</p>"

            html += "</div></div>"

        html += "</body></html>"
        return html
