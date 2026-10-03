import { DocumentViewer, DocumentViewerPage } from "@rfdtech/components";
import type { CSSProperties, ReactNode } from "react";

const pageFooterStyle: CSSProperties = {
  marginTop: "auto",
  paddingTop: 16,
  fontSize: 11,
  color: "#71717a",
  display: "flex",
  justifyContent: "space-between",
};

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  letterSpacing: "0.02em",
};

const mutedStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.45,
  color: "#52525b",
};

const sectionLabelStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#71717a",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 6px",
  borderBottom: "1px solid #d4d4d8",
  fontWeight: 600,
  fontSize: 11,
  color: "#3f3f46",
};

const tdStyle: CSSProperties = {
  padding: "8px 6px",
  borderBottom: "1px solid #e4e4e7",
  verticalAlign: "top",
};

const tdRightStyle: CSSProperties = { ...tdStyle, textAlign: "right" };
const thRightStyle: CSSProperties = { ...thStyle, textAlign: "right" };

const LINE_ITEMS = [
  { code: "CLET-SVC-01", desc: "Accreditation desk assessment", qty: 1, rate: 4500 },
  { code: "CLET-SVC-02", desc: "On-site facility inspection (2 days)", qty: 2, rate: 2800 },
  { code: "CLET-SVC-03", desc: "Document review: quality manuals", qty: 1, rate: 1200 },
  { code: "CLET-SVC-04", desc: "Witness testing coordination", qty: 3, rate: 950 },
  { code: "CLET-SVC-05", desc: "Travel & logistics (Greater Accra)", qty: 1, rate: 780 },
  { code: "CLET-SVC-06", desc: "Technical assessor day rate", qty: 4, rate: 1600 },
  { code: "CLET-SVC-07", desc: "Surveillance schedule planning", qty: 1, rate: 640 },
  { code: "CLET-SVC-08", desc: "Certificate printing & courier", qty: 2, rate: 180 },
  { code: "CLET-SVC-09", desc: "Stakeholder briefing workshop", qty: 1, rate: 2100 },
  { code: "CLET-SVC-10", desc: "Corrective action follow-up", qty: 2, rate: 720 },
  { code: "CLET-SVC-11", desc: "Digital evidence archive storage (12 mo)", qty: 1, rate: 360 },
  { code: "CLET-SVC-12", desc: "Administrative processing fee", qty: 1, rate: 250 },
] as const;

const PAYMENT_SCHEDULE = [
  { milestone: "Retainer on acceptance", due: "15 Oct 2026", amount: 12000, status: "Due" },
  { milestone: "After desk assessment", due: "05 Nov 2026", amount: 10500, status: "Scheduled" },
  { milestone: "After on-site inspection", due: "28 Nov 2026", amount: 14000, status: "Scheduled" },
  { milestone: "Final on certificate issue", due: "20 Dec 2026", amount: 9334, status: "Scheduled" },
] as const;

function formatGhs(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function PageShell({
  children,
  page,
  total,
}: {
  children: ReactNode;
  page: number;
  total: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        fontFamily: "inherit",
        color: "#18181b",
      }}
    >
      {children}
      <div style={pageFooterStyle}>
        <span>CLET Finance: Confidential</span>
        <span>
          Page {page} of {total}
        </span>
      </div>
    </div>
  );
}

export function DocumentViewerA4Example() {
  const subtotal = LINE_ITEMS.reduce((sum, row) => sum + row.qty * row.rate, 0);
  const tax = Math.round(subtotal * 0.125 * 100) / 100;
  const total = subtotal + tax;

  return (
    <div style={{ height: 720 }}>
      <DocumentViewer name="INV-2026-0142">
        <DocumentViewerPage>
          <PageShell page={1} total={2}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 24,
                marginBottom: 28,
              }}
            >
              <div>
                <h1 style={headingStyle}>TAX INVOICE</h1>
                <p style={{ ...mutedStyle, marginTop: 8 }}>
                  Centre for Laboratory Equipment Testing (CLET)
                  <br />
                  Independence Avenue, Accra
                  <br />
                  TIN: C0001234567 · billing@clet.gov.gh
                </p>
              </div>
              <div style={{ textAlign: "right", minWidth: 180 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>
                  INV-2026-0142
                </p>
                <p style={mutedStyle}>Issue date: 02 Oct 2026</p>
                <p style={mutedStyle}>Due date: 01 Nov 2026</p>
                <p style={mutedStyle}>Currency: GHS</p>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={sectionLabelStyle}>Bill to</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                Accra Metrology Services Ltd
              </p>
              <p style={mutedStyle}>
                Plot 14, Ring Road Central
                <br />
                Accra, Ghana
                <br />
                accounts@ams.example · +233 30 255 0100
              </p>
            </div>

            <p style={sectionLabelStyle}>Line items</p>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Description</th>
                  <th style={thRightStyle}>Qty</th>
                  <th style={thRightStyle}>Rate</th>
                  <th style={thRightStyle}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {LINE_ITEMS.map((row) => (
                  <tr key={row.code}>
                    <td style={tdStyle}>{row.code}</td>
                    <td style={tdStyle}>{row.desc}</td>
                    <td style={tdRightStyle}>{row.qty}</td>
                    <td style={tdRightStyle}>{formatGhs(row.rate)}</td>
                    <td style={tdRightStyle}>{formatGhs(row.qty * row.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 16,
                marginLeft: "auto",
                width: 240,
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>Subtotal</span>
                <span>{formatGhs(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>VAT (12.5%)</span>
                <span>{formatGhs(tax)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0 0",
                  marginTop: 4,
                  borderTop: "2px solid #18181b",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <span>Total due</span>
                <span>{formatGhs(total)}</span>
              </div>
            </div>
          </PageShell>
        </DocumentViewerPage>

        <DocumentViewerPage>
          <PageShell page={2} total={2}>
            <h2 style={{ ...headingStyle, fontSize: 18, marginBottom: 8 }}>
              Payment schedule
            </h2>
            <p style={{ ...mutedStyle, marginBottom: 16 }}>
              Invoice INV-2026-0142 continued: staged payments for accreditation
              engagement AMS-2026-Q4.
            </p>

            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Milestone</th>
                  <th style={thStyle}>Due date</th>
                  <th style={thRightStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_SCHEDULE.map((row) => (
                  <tr key={row.milestone}>
                    <td style={tdStyle}>{row.milestone}</td>
                    <td style={tdStyle}>{row.due}</td>
                    <td style={tdRightStyle}>{formatGhs(row.amount)}</td>
                    <td style={tdStyle}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 28 }}>
              <p style={sectionLabelStyle}>Notes and terms</p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: "#3f3f46",
                }}
              >
                <li>
                  Payment by bank transfer to CLET Collection Account (GCB Bank,
                  Accra Main). Quote INV-2026-0142 on the remittance.
                </li>
                <li>
                  Late balances after the final due date attract 1.5% per month
                  on the outstanding amount.
                </li>
                <li>
                  This invoice is issued under the CLET service agreement dated
                  12 Sep 2026. Work product remains CLET property until paid in
                  full.
                </li>
                <li>
                  For queries contact billing@clet.gov.gh or +233 30 266 8800
                  (Finance desk).
                </li>
              </ul>
            </div>

            <div
              style={{
                marginTop: 40,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
              }}
            >
              <div>
                <p style={sectionLabelStyle}>Prepared by</p>
                <p style={{ margin: "28px 0 4px", borderTop: "1px solid #d4d4d8", paddingTop: 8, fontSize: 13 }}>
                  Ama Mensah
                </p>
                <p style={mutedStyle}>Finance Officer, CLET</p>
              </div>
              <div>
                <p style={sectionLabelStyle}>Authorised by</p>
                <p style={{ margin: "28px 0 4px", borderTop: "1px solid #d4d4d8", paddingTop: 8, fontSize: 13 }}>
                  Kwesi Boateng
                </p>
                <p style={mutedStyle}>Director of Finance</p>
              </div>
            </div>

            <p style={{ ...mutedStyle, marginTop: 32 }}>
              Thank you for your partnership with CLET. Please retain this
              invoice with your accreditation records.
            </p>
          </PageShell>
        </DocumentViewerPage>
      </DocumentViewer>
    </div>
  );
}
