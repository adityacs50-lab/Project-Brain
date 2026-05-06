from fpdf import FPDF

class AuditPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Company Brain: Strategic Audit & Roadmap', 0, 1, 'C')
        self.set_font('Arial', '', 10)
        self.cell(0, 5, 'Date: May 6, 2026 | Prepared by: Antigravity AI', 0, 1, 'C')
        self.ln(10)

    def chapter_title(self, label):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(230, 230, 230)
        self.cell(0, 10, label, 0, 1, 'L', 1)
        self.ln(4)

    def chapter_body(self, body):
        self.set_font('Arial', '', 12)
        self.multi_cell(0, 7, body)
        self.ln()

    def section_title(self, label):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, label, 0, 1, 'L')
        self.ln(2)

pdf = AuditPDF()
pdf.add_page()

# Section 1
pdf.chapter_title('SECTION 1: WHAT ACTUALLY EXISTS AND WORKS RIGHT NOW')
content1 = [
    ("Slack Ingestor", "Captures real-time Slack messages and stores them in Supabase with workspace isolation."),
    ("Logic Extraction Engine", "Uses Gemini 2.5 Flash to synthesize chat history into structured YAML rules."),
    ("Semantic Rule Search", "Uses pgvector to match user queries to relevant company policies instantly."),
    ("Deterministic Response API", "Generates source-cited answers for AI agents based purely on approved rules."),
    ("Tenant Isolation", "Ensures data siloing at the database and prompt level via workspace IDs.")
]
for title, desc in content1:
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 7, f"- {title}:", 0, 1)
    pdf.set_font('Arial', '', 11)
    pdf.multi_cell(0, 7, desc)
    pdf.ln(2)

# Section 2
pdf.chapter_title('SECTION 2: WHAT WE ARE BUILDING NEXT (ROADMAP)')
content2 = [
    ("1. Manager Review UI", "Essential for human approval of AI rules. Time: 7-10 Days."),
    ("2. Scheduled Syncing", "Background jobs to keep knowledge fresh without manual triggers. Time: 3 Days."),
    ("3. Deep-Link Citations", "Direct links back to Slack threads for absolute trust. Time: 4 Days."),
    ("4. Notion/Jira Connectors", "Ingesting knowledge from the company's full stack. Time: 14 Days."),
    ("5. Conflict Detection", "Handling contradictions in company policy automatically. Time: 7 Days.")
]
for title, desc in content2:
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 7, f"- {title}", 0, 1)
    pdf.set_font('Arial', '', 11)
    pdf.multi_cell(0, 7, desc)
    pdf.ln(2)

# Section 3
pdf.chapter_title('SECTION 3: LANDING PAGE STRATEGY')
pdf.section_title('Value Proposition:')
pdf.chapter_body('The Deterministic Control Plane for your AI Agents.')

pdf.section_title('Key Features to Showcase:')
pdf.chapter_body('1. Automated Policy Extraction\n2. Source-Cited Reasoning\n3. Human-in-the-loop Governance')

pdf.section_title('CTAs & Warnings:')
pdf.chapter_body('CTA: "Apply for our 10-Company Private Pilot Program."\nWarning: DO NOT promise full autonomy or 100% hallucination-free AI yet.')

# Final Note
pdf.chapter_title('AUDITOR\'S FINAL NOTE')
pdf.chapter_body('You are in the "Vulnerable MVP" stage. The core engine is solid, but you need the "Review UI" to turn this from a cool tool into an enterprise-grade platform.')

pdf.output('Company_Brain_Audit_May_2026.pdf')
print("PDF generated successfully.")
