import type { InstitutionType, StudentManualRow } from "../types/Student.types";

export const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const detectDelimiter = (text: string): string => {
  let commaCount = 0;
  let semiCount = 0;
  let inQuote = false;
  for (let i = 0; i < Math.min(text.length, 2000); i++) {
    const c = text[i];
    if (c === '"') inQuote = !inQuote;
    if (!inQuote) {
      if (c === ",") commaCount++;
      if (c === ";") semiCount++;
    }
  }
  return semiCount > commaCount ? ";" : ",";
};

export const parseCSV = (csvText: string): string[][] => {
  const delimiter = detectDelimiter(csvText);
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter || char === "\t") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== "")) rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some((c) => c !== "")) rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== "")) rows.push(currentRow);
  }

  return rows;
};

export const colRefToIndex = (cellRef: string): number => {
  const letters = cellRef.replace(/[0-9]/g, "").toUpperCase();
  let index = 0;
  for (let i = 0; i < letters.length; i++) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }
  return Math.max(0, index - 1);
};

export const convertRowsToStudents = (
  rawRows: string[][],
  institutionType: InstitutionType
): StudentManualRow[] => {
  if (rawRows.length === 0) return [];

  const firstRow = rawRows[0];
  const headerMap: Record<string, number> = {};
  let hasRecognizedHeader = false;

  firstRow.forEach((col, idx) => {
    if (!col) return;
    const norm = normalizeHeader(col);
    if (
      [
        "registernumber",
        "regno",
        "registerno",
        "rollno",
        "rollnumber",
        "studentid",
        "registrationnumber",
        "reg",
      ].includes(norm)
    ) {
      headerMap.registerNumber = idx;
      hasRecognizedHeader = true;
    } else if (
      ["studentname", "name", "fullname", "student", "firstname"].includes(norm)
    ) {
      headerMap.studentName = idx;
      hasRecognizedHeader = true;
    } else if (
      ["batch", "year", "passoutyear", "batchyear", "academicyear"].includes(norm)
    ) {
      headerMap.batch = idx;
      hasRecognizedHeader = true;
    } else if (["degree", "deg", "program"].includes(norm)) {
      headerMap.degree = idx;
      hasRecognizedHeader = true;
    } else if (
      ["department", "dept", "branch", "stream", "course"].includes(norm)
    ) {
      headerMap.department = idx;
      hasRecognizedHeader = true;
    } else if (["section", "sec", "division", "div"].includes(norm)) {
      headerMap.section = idx;
      hasRecognizedHeader = true;
    } else if (["email", "emailaddress", "mail", "studentemail"].includes(norm)) {
      headerMap.email = idx;
      hasRecognizedHeader = true;
    } else if (
      [
        "phonenumber",
        "phone",
        "mobilenumber",
        "mobile",
        "contact",
        "contactnumber",
      ].includes(norm)
    ) {
      headerMap.phoneNumber = idx;
      hasRecognizedHeader = true;
    }
  });

  const dataRows = hasRecognizedHeader ? rawRows.slice(1) : rawRows;

  return dataRows
    .map((row) => {
      let registerNumber = "";
      let studentName = "";
      let degree = institutionType === "College" ? "B.E" : "";
      let batch = "2026";
      let department = "";
      let section = institutionType === "College" ? "A" : "";
      let email = "";
      let phoneNumber = "";

      if (hasRecognizedHeader) {
        if (headerMap.registerNumber !== undefined)
          registerNumber = row[headerMap.registerNumber] || "";
        if (headerMap.studentName !== undefined)
          studentName = row[headerMap.studentName] || "";
        if (headerMap.degree !== undefined)
          degree = row[headerMap.degree] || "";
        if (headerMap.batch !== undefined)
          batch = row[headerMap.batch] || "2026";
        if (headerMap.department !== undefined)
          department = row[headerMap.department] || "";
        if (headerMap.section !== undefined)
          section = row[headerMap.section] || "";
        if (headerMap.email !== undefined)
          email = row[headerMap.email] || "";
        if (headerMap.phoneNumber !== undefined)
          phoneNumber = row[headerMap.phoneNumber] || "";
      } else {
        registerNumber = row[0] || "";
        studentName = row[1] || "";
        batch = row[2] || "2026";
        department = row[3] || "";
        if (institutionType === "College") {
          section = row[4] || "A";
          email = row[5] || "";
          phoneNumber = row[6] || "";
        } else {
          email = row[4] || "";
          phoneNumber = row[5] || "";
        }
      }

      return {
        registerNumber: (registerNumber || "").trim(),
        studentName: (studentName || "").trim(),
        degree: (degree || "").trim() || (institutionType === "College" ? "B.E" : ""),
        batch: (batch || "").trim() || "2026",
        department: (department || "").trim(),
        section: institutionType === "College" ? (section || "").trim() || "A" : "",
        email: (email || "").trim(),
        phoneNumber: (phoneNumber || "").trim(),
        institutionType,
      };
    })
    .filter((r) => r.registerNumber !== "" || r.studentName !== "");
};

export const parseXLSX = async (
  file: File,
  institutionType: InstitutionType
): Promise<StudentManualRow[]> => {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream is not supported in this browser");
  }
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  const files: Record<string, Uint8Array> = {};
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;

    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const nameBytes = bytes.slice(offset + 30, offset + 30 + nameLen);
    const filename = new TextDecoder().decode(nameBytes);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = bytes.slice(dataStart, dataStart + compSize);

    if (method === 0) {
      files[filename] = compData;
    } else if (method === 8) {
      try {
        const stream = new Blob([compData])
          .stream()
          .pipeThrough(new DecompressionStream("deflate-raw"));
        const decompressed = await new Response(stream).arrayBuffer();
        files[filename] = new Uint8Array(decompressed);
      } catch {
      }
    }

    offset = dataStart + compSize;
  }

  const sharedStrings: string[] = [];
  const sstBytes = files["xl/sharedStrings.xml"];
  if (sstBytes) {
    const sstXml = new TextDecoder().decode(sstBytes);
    const doc = new DOMParser().parseFromString(sstXml, "text/xml");
    const siNodes = doc.querySelectorAll("si");
    siNodes.forEach((si) => {
      sharedStrings.push(si.textContent || "");
    });
  }

  const sheetKey =
    Object.keys(files).find((k) => k === "xl/worksheets/sheet1.xml") ||
    Object.keys(files).find((k) => k.startsWith("xl/worksheets/sheet"));
  const sheetBytes = sheetKey ? files[sheetKey] : null;
  if (!sheetBytes) return [];

  const sheetXml = new TextDecoder().decode(sheetBytes);
  const sheetDoc = new DOMParser().parseFromString(sheetXml, "text/xml");
  const rowNodes = sheetDoc.querySelectorAll("row");

  const matrix: string[][] = [];
  rowNodes.forEach((rNode) => {
    const rowCells: string[] = [];
    const cNodes = rNode.querySelectorAll("c");
    cNodes.forEach((cNode) => {
      const ref = cNode.getAttribute("r");
      const colIdx = ref ? colRefToIndex(ref) : rowCells.length;
      const type = cNode.getAttribute("t");
      const vNode = cNode.querySelector("v");
      let val = vNode?.textContent || "";
      if (type === "s") {
        const idx = parseInt(val, 10);
        val = sharedStrings[idx] ?? "";
      } else if (type === "inlineStr") {
        val = cNode.querySelector("is t")?.textContent || "";
      }
      rowCells[colIdx] = val;
    });
    if (rowCells.some((c) => c && c.trim() !== "")) {
      matrix.push(rowCells);
    }
  });

  return convertRowsToStudents(matrix, institutionType);
};

export const parseXML = (
  xmlText: string,
  institutionType: InstitutionType
): StudentManualRow[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const studentNodes = xmlDoc.querySelectorAll("student, Student, record, Record, row, Row");

  const results: StudentManualRow[] = [];
  studentNodes.forEach((node) => {
    const getText = (selector: string): string => {
      const el = node.querySelector(selector);
      return el?.textContent?.trim() || "";
    };

    const registerNumber =
      getText("registerNumber") ||
      getText("regNumber") ||
      getText("regNo") ||
      getText("rollNo") ||
      getText("rollNumber") ||
      node.getAttribute("registerNumber") ||
      node.getAttribute("rollNo") ||
      "";

    const studentName =
      getText("studentName") ||
      getText("name") ||
      getText("fullName") ||
      node.getAttribute("studentName") ||
      node.getAttribute("name") ||
      "";

    if (!registerNumber && !studentName) return;

    results.push({
      registerNumber,
      studentName,
      batch: getText("batch") || getText("year") || "2026",
      department: getText("department") || getText("dept") || "",
      section:
        institutionType === "College"
          ? getText("section") || getText("sec") || "A"
          : "",
      email: getText("email") || getText("mail") || "",
      phoneNumber:
        getText("phoneNumber") || getText("phone") || getText("mobile") || "",
      institutionType,
    });
  });

  return results;
};

export const downloadSampleCSV = (institutionType: InstitutionType) => {
  const headers =
    institutionType === "College"
      ? "Register Number,Student Name,Degree,Batch,Department,Section,Email,Phone Number\n621321106001,Priya Raman,B.E,2026,ECE,A,priya@example.com,9876543210\n621321106002,Arjun Mehta,B.Tech,2026,CSE,B,arjun@example.com,9123456789"
      : "Register Number,Student Name,Degree,Batch,Department,Email,Phone Number\n621321106001,Priya Raman,B.E,2026,ECE,priya@example.com,9876543210\n621321106002,Arjun Mehta,B.Tech,2026,CSE,arjun@example.com,9123456789";

  const blob = new Blob([headers], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `students_sample_template_${institutionType.toLowerCase()}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
