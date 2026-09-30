import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportToCsv, exportToPdf, type ExportColumn } from "./export";

interface Row {
  name: string | number | null;
}

const columns: ExportColumn<Row>[] = [
  { header: "Name", accessor: (r) => r.name },
];

const BOM = String.fromCharCode(0xfeff);

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe("exportToCsv", () => {
  let captured: Blob | undefined;

  beforeEach(() => {
    captured = undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      captured = blob;
      return "blob:test";
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function csvLines(rows: Row[], cols = columns): Promise<string[]> {
    exportToCsv(rows, cols, "out");
    const text = await readBlob(captured as Blob);
    const body = text.startsWith(BOM) ? text.slice(BOM.length) : text;
    return body.split("\r\n");
  }

  it.each([
    ["=1+1", "'=1+1"],
    ["+233201234567", "'+233201234567"],
    ["-2+3", "'-2+3"],
    ["@SUM(A1)", "'@SUM(A1)"],
    ["\tcmd", "'\tcmd"],
  ])("prefixes a quote when a cell starts a formula: %j", async (input, expected) => {
    const [, line] = await csvLines([{ name: input }]);
    expect(line).toBe(expected);
  });

  it("neutralizes a formula and still quotes commas and double quotes", async () => {
    const [, line] = await csvLines([{ name: '=HYPERLINK("http://x","c")' }]);
    expect(line).toBe(`"'=HYPERLINK(""http://x"",""c"")"`);
  });

  it("neutralizes a header that starts a formula", async () => {
    const lines = await csvLines([{ name: "ok" }], [
      { header: "=evil()", accessor: (r) => r.name },
    ]);
    expect(lines[0]).toBe("'=evil()");
  });

  it("leaves numeric cells untouched, including negatives", async () => {
    const [, line] = await csvLines([{ name: -5 }]);
    expect(line).toBe("-5");
  });

  it("leaves ordinary text and mid-string symbols untouched", async () => {
    const lines = await csvLines([{ name: "Alice" }, { name: "a=b" }, { name: null }]);
    expect(lines.slice(1)).toEqual(["Alice", "a=b", ""]);
  });

  it("quotes a cell containing a carriage return", async () => {
    exportToCsv([{ name: "line1\rline2" }], columns, "out");
    const text = await readBlob(captured as Blob);
    expect(text).toContain('"line1\rline2"');
  });
});

describe("exportToPdf", () => {
  const payload = `<img src=x onerror="alert(1)">`;
  let written = "";

  beforeEach(() => {
    written = "";
    const fakeWindow = {
      document: {
        write: (html: string) => {
          written = html;
        },
        close: vi.fn(),
        title: "",
      },
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
      matchMedia: vi.fn(() => ({ addEventListener: vi.fn() })),
      onload: null as null | (() => void),
    };
    vi.spyOn(window, "open").mockReturnValue(fakeWindow as unknown as Window);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("escapes the title in the tab title, header block and heading", () => {
    exportToPdf([], columns, "report", { title: payload });

    expect(written).not.toContain(payload);
    expect(written.match(/&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/g)).toHaveLength(3);
  });

  it("escapes filters and generatedAt", () => {
    exportToPdf([], columns, "report", {
      title: "T",
      filters: `"><script>alert(1)</script>`,
      generatedAt: `<b>now</b>`,
    });

    expect(written).not.toContain("<script>alert(1)</script>");
    expect(written).not.toContain("<b>now</b>");
    expect(written).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(written).toContain("&lt;b&gt;now&lt;/b&gt;");
  });

  it("escapes column headers and cell values", () => {
    exportToPdf(
      [{ name: `<svg onload=alert(1)>` }],
      [{ header: `<u>H</u>`, accessor: (r: Row) => r.name }],
      "report",
      { title: "T" },
    );

    expect(written).not.toContain("<svg onload=alert(1)>");
    expect(written).not.toContain("<u>H</u>");
    expect(written).toContain("<th>&lt;u&gt;H&lt;/u&gt;</th>");
    expect(written).toContain("<td>&lt;svg onload=alert(1)&gt;</td>");
  });

  it("keeps ampersands and apostrophes readable and renders an empty cell as a dash", () => {
    exportToPdf([{ name: "Tom & Jerry's" }, { name: null }], columns, "report", {
      title: "T",
    });

    expect(written).toContain("<td>Tom &amp; Jerry&#39;s</td>");
    expect(written).toContain("<td>&mdash;</td>");
  });
});
