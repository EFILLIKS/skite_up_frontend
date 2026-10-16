import type { QuestionFormData, QuestionOptionItem } from "./QuestionBankSchema";

export interface ParsedQuestionRow {
  rowNumber: number;
  questionText: string;
  questionType: string;
  skill: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  negativeMarks: number;
  options: QuestionOptionItem[];
  explanation: string;
  isValid: boolean;
  errors: string[];
}

export const normalizeHeader = (header: string): string => {
  return String(header || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
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

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((c) => c !== "")) rows.push(currentRow);
  }

  return rows;
};

export const parseXlsxNative = async (buffer: ArrayBuffer): Promise<string[][]> => {
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  let offset = 0;
  const files: Record<string, Uint8Array> = {};

  while (offset < uint8.length - 30) {
    const sig = view.getUint32(offset, true);
    if (sig === 0x04034b50) {
      const compressionMethod = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const fileNameBytes = uint8.subarray(offset + 30, offset + 30 + fileNameLen);
      const fileName = new TextDecoder().decode(fileNameBytes);

      const dataStart = offset + 30 + fileNameLen + extraLen;
      const compressedData = uint8.subarray(dataStart, dataStart + compressedSize);

      let fileData: Uint8Array = new Uint8Array(0);
      if (compressionMethod === 0) {
        fileData = compressedData;
      } else if (compressionMethod === 8 && typeof DecompressionStream !== "undefined") {
        try {
          const ds = new DecompressionStream("deflate-raw");
          const writer = ds.writable.getWriter();
          writer.write(compressedData);
          writer.close();
          const decompressed = await new Response(ds.readable).arrayBuffer();
          fileData = new Uint8Array(decompressed);
        } catch {
          fileData = new Uint8Array(0);
        }
      }

      files[fileName] = fileData;
      offset = dataStart + compressedSize;
    } else {
      offset++;
    }
  }

  const sharedStrings: string[] = [];
  const sstKey = Object.keys(files).find((k) => k.endsWith("sharedStrings.xml"));
  if (sstKey && files[sstKey].length > 0) {
    const sstXml = new TextDecoder().decode(files[sstKey]);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sstXml, "application/xml");
    const siElements = doc.getElementsByTagName("si");
    for (let i = 0; i < siElements.length; i++) {
      const si = siElements[i];
      const tElements = si.getElementsByTagName("t");
      let itemText = "";
      for (let j = 0; j < tElements.length; j++) {
        itemText += tElements[j].textContent || "";
      }
      sharedStrings.push(itemText);
    }
  }

  const sheetKey =
    Object.keys(files).find((k) => k.includes("worksheets/sheet") && k.endsWith(".xml")) ||
    Object.keys(files).find((k) => k.endsWith(".xml") && k.includes("sheet"));
  if (!sheetKey || files[sheetKey].length === 0) {
    return [];
  }

  const sheetXml = new TextDecoder().decode(files[sheetKey]);
  const parser = new DOMParser();
  const doc = parser.parseFromString(sheetXml, "application/xml");
  const rowElements = doc.getElementsByTagName("row");

  const colLetterToIndex = (colLetters: string): number => {
    let index = 0;
    const clean = colLetters.toUpperCase();
    for (let i = 0; i < clean.length; i++) {
      index = index * 26 + (clean.charCodeAt(i) - 64);
    }
    return Math.max(0, index - 1);
  };

  const parsed2DRows: string[][] = [];

  for (let r = 0; r < rowElements.length; r++) {
    const rowEl = rowElements[r];
    const cellElements = rowEl.getElementsByTagName("c");
    const rowData: string[] = [];

    for (let c = 0; c < cellElements.length; c++) {
      const cell = cellElements[c];
      const rAttr = cell.getAttribute("r") || "";
      const tAttr = cell.getAttribute("t") || "";

      const colLetters = rAttr.replace(/[0-9]/g, "");
      const colIndex = colLetters ? colLetterToIndex(colLetters) : c;

      let cellValue = "";
      if (tAttr === "s") {
        const vEl = cell.getElementsByTagName("v")[0];
        const sstIndex = vEl ? parseInt(vEl.textContent || "", 10) : -1;
        if (sstIndex >= 0 && sstIndex < sharedStrings.length) {
          cellValue = sharedStrings[sstIndex];
        }
      } else if (tAttr === "inlineStr") {
        const tEl = cell.getElementsByTagName("t")[0];
        cellValue = tEl?.textContent || "";
      } else {
        const vEl = cell.getElementsByTagName("v")[0];
        cellValue = vEl?.textContent || "";
      }

      while (rowData.length < colIndex) {
        rowData.push("");
      }
      rowData[colIndex] = cellValue.trim();
    }

    if (rowData.some((cell) => cell && cell.trim() !== "")) {
      parsed2DRows.push(rowData);
    }
  }

  return parsed2DRows;
};

export const loadXlsxLibrary = async (): Promise<any> => {
  if (typeof window !== "undefined" && (window as any).XLSX) {
    return (window as any).XLSX;
  }

  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }

    const existing = document.querySelector('script[data-xlsx-loader="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).XLSX));
      existing.addEventListener("error", () => resolve(null));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    script.setAttribute("data-xlsx-loader", "true");
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = () => {
      const fallbackScript = document.createElement("script");
      fallbackScript.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
      fallbackScript.onload = () => resolve((window as any).XLSX);
      fallbackScript.onerror = () => resolve(null);
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
};

export const convertCSVRowsToQuestions = (rows: string[][]): ParsedQuestionRow[] => {
  if (!rows || rows.length < 2) return [];

  let headerRowIndex = 0;
  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const rowHeaders = (rows[r] || []).map(normalizeHeader);
    const hasQuestionCol = rowHeaders.some(
      (h) => h.includes("question") || h.includes("problem") || h.includes("statement") || h.includes("title")
    );
    if (hasQuestionCol) {
      headerRowIndex = r;
      break;
    }
  }

  const headers = (rows[headerRowIndex] || []).map(normalizeHeader);
  const findCol = (aliases: string[]): number => {
    return headers.findIndex((h) =>
      aliases.some((a) => {
        const normA = normalizeHeader(a);
        return h === normA || h.includes(normA);
      })
    );
  };

  const colQuestion = findCol(["question", "questiontext", "problem", "qtext", "statement", "title"]);
  const colType = findCol(["questiontype", "type", "subtype", "qtype"]);
  const colSkill = findCol(["skill", "skillname", "category", "subject"]);
  const colTopic = findCol(["topic", "topicname", "subtopic", "chapter"]);
  const colDifficulty = findCol(["difficulty", "diff", "level"]);
  const colMarks = findCol(["positivemarks", "marks", "mark", "positivemark", "score"]);
  const colNegMarks = findCol(["negativemarks", "negativemark", "negative", "negmarks", "negmark", "penalty"]);

  let colOptA = findCol(["optiona", "option1", "opt1", "choicea", "choice1"]);
  let colOptB = findCol(["optionb", "option2", "opt2", "choiceb", "choice2"]);
  let colOptC = findCol(["optionc", "option3", "opt3", "choicec", "choice3"]);
  let colOptD = findCol(["optiond", "option4", "opt4", "choiced", "choice4"]);
  let colOptE = findCol(["optione", "option5", "opt5", "choicee", "choice5"]);

  if (colOptA < 0) colOptA = headers.indexOf("a");
  if (colOptB < 0) colOptB = headers.indexOf("b");
  if (colOptC < 0) colOptC = headers.indexOf("c");
  if (colOptD < 0) colOptD = headers.indexOf("d");
  if (colOptE < 0) colOptE = headers.indexOf("e");

  const colCorrect = findCol(["correctoption", "correctanswer", "correct", "answer", "ans", "answerkey", "key"]);
  const colExpl = findCol(["explanation", "reason", "solution", "rationale", "notes"]);

  const result: ParsedQuestionRow[] = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((cell) => !cell || String(cell).trim() === "")) continue;

    const errors: string[] = [];

    const questionText = colQuestion >= 0 ? String(row[colQuestion] ?? "").trim() : "";
    if (!questionText) {
      errors.push("Question text is missing");
    }

    const rawType = colType >= 0 ? String(row[colType] ?? "").trim() : "Single choice";
    const questionType =
      rawType.toLowerCase().includes("multi")
        ? "Multiple choice"
        : rawType.toLowerCase().includes("true")
        ? "True/False"
        : "Single choice";

    const skill = colSkill >= 0 && row[colSkill] ? String(row[colSkill]).trim() : "Quantitative Ability";
    const topic = colTopic >= 0 && row[colTopic] ? String(row[colTopic]).trim() : "Time & Work";

    const rawDiff = colDifficulty >= 0 ? String(row[colDifficulty] ?? "").trim().toLowerCase() : "easy";
    const difficulty: "Easy" | "Medium" | "Hard" =
      rawDiff.includes("hard") ? "Hard" : rawDiff.includes("med") ? "Medium" : "Easy";

    const marks = colMarks >= 0 && !isNaN(parseFloat(String(row[colMarks]))) ? parseFloat(String(row[colMarks])) : 2;
    const negativeMarks =
      colNegMarks >= 0 && !isNaN(parseFloat(String(row[colNegMarks])))
        ? Math.abs(parseFloat(String(row[colNegMarks])))
        : 0.5;

    const optAText = colOptA >= 0 ? String(row[colOptA] ?? "").trim() : "";
    const optBText = colOptB >= 0 ? String(row[colOptB] ?? "").trim() : "";
    const optCText = colOptC >= 0 ? String(row[colOptC] ?? "").trim() : "";
    const optDText = colOptD >= 0 ? String(row[colOptD] ?? "").trim() : "";
    const optEText = colOptE >= 0 ? String(row[colOptE] ?? "").trim() : "";

    const correctRaw = colCorrect >= 0 ? String(row[colCorrect] ?? "").trim().toUpperCase() : "A";

    const isMatchCorrect = (key: string, numKey: string, optText: string) => {
      if (!correctRaw) return false;
      const cleanOptText = optText.trim().toUpperCase();
      return (
        correctRaw === key ||
        correctRaw === numKey ||
        correctRaw === `OPTION ${key}` ||
        correctRaw === `OPTION ${numKey}` ||
        correctRaw.includes(key) ||
        (cleanOptText.length > 0 && correctRaw === cleanOptText)
      );
    };

    const options: QuestionOptionItem[] = [];
    if (optAText) {
      options.push({
        id: `opt-${r}-A`,
        optionKey: "A",
        optionText: optAText,
        isCorrect: isMatchCorrect("A", "1", optAText),
      });
    }
    if (optBText) {
      options.push({
        id: `opt-${r}-B`,
        optionKey: "B",
        optionText: optBText,
        isCorrect: isMatchCorrect("B", "2", optBText),
      });
    }
    if (optCText) {
      options.push({
        id: `opt-${r}-C`,
        optionKey: "C",
        optionText: optCText,
        isCorrect: isMatchCorrect("C", "3", optCText),
      });
    }
    if (optDText) {
      options.push({
        id: `opt-${r}-D`,
        optionKey: "D",
        optionText: optDText,
        isCorrect: isMatchCorrect("D", "4", optDText),
      });
    }
    if (optEText) {
      options.push({
        id: `opt-${r}-E`,
        optionKey: "E",
        optionText: optEText,
        isCorrect: isMatchCorrect("E", "5", optEText),
      });
    }

    if (options.length < 2) {
      errors.push("At least 2 options are required (Option A and Option B)");
    }

    if (!options.some((o) => o.isCorrect)) {
      if (options.length > 0) {
        options[0].isCorrect = true;
      } else {
        errors.push("No correct option marked");
      }
    }

    const explanation = colExpl >= 0 ? String(row[colExpl] ?? "").trim() : "";

    result.push({
      rowNumber: result.length + 1,
      questionText,
      questionType,
      skill,
      topic,
      difficulty,
      marks,
      negativeMarks,
      options,
      explanation,
      isValid: errors.length === 0,
      errors,
    });
  }

  return result;
};

export const parseXMLQuestions = (xmlText: string): ParsedQuestionRow[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const qElements = doc.getElementsByTagName("question");
  const result: ParsedQuestionRow[] = [];

  for (let i = 0; i < qElements.length; i++) {
    const qEl = qElements[i];
    const getText = (tag: string) => qEl.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

    const questionText = getText("questionText") || getText("question") || getText("title");
    const questionType = getText("questionType") || getText("type") || "Single choice";
    const skill = getText("skill") || getText("category") || "Quantitative Ability";
    const topic = getText("topic") || getText("subtopic") || "Time & Work";
    const difficultyRaw = getText("difficulty") || getText("level") || "Easy";
    const difficulty: "Easy" | "Medium" | "Hard" = difficultyRaw.toLowerCase().includes("hard")
      ? "Hard"
      : difficultyRaw.toLowerCase().includes("med")
      ? "Medium"
      : "Easy";

    const marks = parseFloat(getText("marks")) || 2;
    const negativeMarks = Math.abs(parseFloat(getText("negativeMarks"))) || 0.5;
    const explanation = getText("explanation") || "";

    const optElements = qEl.getElementsByTagName("option");
    const options: QuestionOptionItem[] = [];

    for (let j = 0; j < optElements.length; j++) {
      const optEl = optElements[j];
      const key = optEl.getAttribute("key") || optEl.getAttribute("optionKey") || String.fromCharCode(65 + j);
      const isCorrect =
        optEl.getAttribute("isCorrect") === "true" ||
        optEl.getAttribute("correct") === "true" ||
        optEl.getAttribute("correct") === "1";
      const text = optEl.textContent?.trim() || "";
      if (text) {
        options.push({
          id: `opt-${i}-${key}`,
          optionKey: key,
          optionText: text,
          isCorrect,
        });
      }
    }

    const errors: string[] = [];
    if (!questionText) errors.push("Question text is missing");
    if (options.length < 2) errors.push("At least 2 options are required");
    if (!options.some((o) => o.isCorrect) && options.length > 0) {
      options[0].isCorrect = true;
    }

    result.push({
      rowNumber: i + 1,
      questionText,
      questionType,
      skill,
      topic,
      difficulty,
      marks,
      negativeMarks,
      options,
      explanation,
      isValid: errors.length === 0,
      errors,
    });
  }

  return result;
};

export const parseImportFile = async (file: File): Promise<ParsedQuestionRow[]> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();

    let xlsxLib = (window as any).XLSX;
    if (!xlsxLib) {
      xlsxLib = await loadXlsxLibrary();
    }

    if (xlsxLib) {
      try {
        const workbook = xlsxLib.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetRows: (string | number)[][] = xlsxLib.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });
        const stringRows = sheetRows.map((row) =>
          (row || []).map((cell) => (cell == null ? "" : String(cell).trim()))
        );
        return convertCSVRowsToQuestions(stringRows);
      } catch (err) {
        console.warn("SheetJS parse failed, falling back to native ZIP reader:", err);
      }
    }

    const native2DRows = await parseXlsxNative(buffer);
    if (native2DRows.length > 0) {
      return convertCSVRowsToQuestions(native2DRows);
    }

    throw new Error("Unable to parse Excel file format");
  }

  if (fileName.endsWith(".xml")) {
    const text = await file.text();
    return parseXMLQuestions(text);
  }

  if (fileName.endsWith(".json")) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
    return questionsArray.map((q: any, idx: number) => {
      const options: QuestionOptionItem[] = (q.options || []).map((opt: any, optIdx: number) => ({
        id: opt.id || `opt-${idx}-${optIdx}`,
        optionKey: opt.optionKey || String.fromCharCode(65 + optIdx),
        optionText: opt.optionText || opt.text || "",
        isCorrect: Boolean(opt.isCorrect),
      }));

      const errors: string[] = [];
      if (!q.questionText) errors.push("Question text is missing");
      if (options.length < 2) errors.push("At least 2 options are required");

      return {
        rowNumber: idx + 1,
        questionText: q.questionText || "",
        questionType: q.questionType || "Single choice",
        skill: q.skill || "Quantitative Ability",
        topic: q.topic || "Time & Work",
        difficulty: (q.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
        marks: Number(q.marks) || 2,
        negativeMarks: Number(q.negativeMarks) || 0.5,
        options,
        explanation: q.explanation || "",
        isValid: errors.length === 0,
        errors,
      };
    });
  }

  const text = await file.text();
  const rawRows = parseCSV(text);
  return convertCSVRowsToQuestions(rawRows);
};

export const toQuestionFormData = (
  parsed: ParsedQuestionRow,
  index: number
): QuestionFormData => ({
  questionNumber: index + 1,
  questionType: parsed.questionType,
  questionText: parsed.questionText,
  explanation: parsed.explanation,
  skill: parsed.skill,
  topic: parsed.topic,
  difficulty: parsed.difficulty,
  marks: parsed.marks,
  negativeMarks: parsed.negativeMarks,
  status: "Published",
  options: parsed.options,
});

export const downloadSampleQuestionCSV = async () => {
  const token = localStorage.getItem("accessToken");
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

  try {
    const res = await fetch(`${baseUrl}/app/question-bank/sample-file?format=csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "skiteup_question_bank_template.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
  } catch {
  }

  const headers = [
    "Question",
    "Type",
    "Category",
    "Skill",
    "Topic",
    "Difficulty",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Option",
    "Marks",
    "Negative Marks",
    "Explanation",
    "Status",
  ];

  const sampleRow1 = [
    '"A can finish a piece of work in 12 days and B in 15 days. How many days will they take together?"',
    '"Single choice"',
    '"MCQ"',
    '"Quantitative Ability"',
    '"Time & Work"',
    '"Easy"',
    '"6.67 days"',
    '"7.5 days"',
    '"8 days"',
    '"9 days"',
    '"A"',
    "2",
    "0.5",
    '"Total work = LCM(12, 15) = 60. Combined rate = 5 + 4 = 9. Days = 60/9 = 6.67 days."',
    '"Published"',
  ];

  const sampleRow2 = [
    '"What is the next number in the series: 2, 6, 12, 20, 30, ...?"',
    '"Single choice"',
    '"MCQ"',
    '"Logical Reasoning"',
    '"Series"',
    '"Medium"',
    '"40"',
    '"42"',
    '"44"',
    '"48"',
    '"B"',
    "2",
    "0.5",
    '"Differences are +4, +6, +8, +10, +12. 30 + 12 = 42."',
    '"Published"',
  ];

  const csvContent =
    "\uFEFF" + headers.join(",") + "\r\n" + sampleRow1.join(",") + "\r\n" + sampleRow2.join(",") + "\r\n";

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "skiteup_question_bank_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadSampleQuestionExcel = async () => {
  let xlsxLib = (window as any).XLSX;
  if (!xlsxLib) {
    xlsxLib = await loadXlsxLibrary();
  }

  if (xlsxLib) {
    const data = [
      [
        "Question",
        "Type",
        "Category",
        "Skill",
        "Topic",
        "Difficulty",
        "Option A",
        "Option B",
        "Option C",
        "Option D",
        "Correct Option",
        "Marks",
        "Negative Marks",
        "Explanation",
        "Status",
      ],
      [
        "A can finish a piece of work in 12 days and B in 15 days. How many days will they take together?",
        "Single choice",
        "MCQ",
        "Quantitative Ability",
        "Time & Work",
        "Easy",
        "6.67 days",
        "7.5 days",
        "8 days",
        "9 days",
        "A",
        2,
        0.5,
        "Total work = LCM(12, 15) = 60. Combined rate = 5 + 4 = 9. Days = 60/9 = 6.67 days.",
        "Published",
      ],
      [
        "What is the next number in the series: 2, 6, 12, 20, 30, ...?",
        "Single choice",
        "MCQ",
        "Logical Reasoning",
        "Series",
        "Medium",
        "40",
        "42",
        "44",
        "48",
        "B",
        2,
        0.5,
        "Differences are +4, +6, +8, +10, +12. 30 + 12 = 42.",
        "Published",
      ],
    ];

    const ws = xlsxLib.utils.aoa_to_sheet(data);
    const wb = xlsxLib.utils.book_new();
    xlsxLib.utils.book_append_sheet(wb, ws, "Question Bank");
    xlsxLib.writeFile(wb, "skiteup_question_bank_template.xlsx");
    return;
  }

  downloadSampleQuestionCSV();
};

export const downloadSampleQuestionXML = () => {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<questionBank>
  <question>
    <questionText>A can finish a piece of work in 12 days and B in 15 days. How many days will they take together?</questionText>
    <questionType>Single choice</questionType>
    <category>MCQ</category>
    <skill>Quantitative Ability</skill>
    <topic>Time &amp; Work</topic>
    <difficulty>Easy</difficulty>
    <marks>2</marks>
    <negativeMarks>0.5</negativeMarks>
    <explanation>Combined rate = 1/12 + 1/15 = 9/60 = 3/20. Days = 20/3 = 6.67 days.</explanation>
    <options>
      <option key="A" isCorrect="true">6.67 days</option>
      <option key="B" isCorrect="false">7.5 days</option>
      <option key="C" isCorrect="false">8 days</option>
      <option key="D" isCorrect="false">9 days</option>
    </options>
  </question>
</questionBank>`;

  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "skiteup_question_bank_template.xml");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
