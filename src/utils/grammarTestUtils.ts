import type {
  GrammarCheckRequest,
  GrammarCheckResponse,
  GrammarError,
  LsrwSection,
} from "../types/Grammar.types";

export interface HighlightSegment {
  text: string;
  isError: boolean;
  error?: GrammarError;
}

export function segmentTextWithErrors(
  originalText: string,
  errors?: GrammarError[]
): HighlightSegment[] {
  if (!originalText) return [];
  if (!errors || errors.length === 0) {
    return [{ text: originalText, isError: false }];
  }

  const validErrors = [...errors]
    .filter(
      (e) =>
        typeof e.startPosition === "number" &&
        typeof e.endPosition === "number" &&
        e.startPosition >= 0 &&
        e.endPosition > e.startPosition &&
        e.startPosition < originalText.length
    )
    .sort((a, b) => a.startPosition - b.startPosition);

  if (validErrors.length === 0) {
    return [{ text: originalText, isError: false }];
  }

  const result: HighlightSegment[] = [];
  let currentIdx = 0;

  for (const err of validErrors) {
    const start = Math.max(currentIdx, err.startPosition);
    const end = Math.min(originalText.length, err.endPosition);

    if (start > currentIdx) {
      result.push({
        text: originalText.slice(currentIdx, start),
        isError: false,
      });
    }

    if (end > start) {
      result.push({
        text: originalText.slice(start, end),
        isError: true,
        error: err,
      });
      currentIdx = end;
    }
  }

  if (currentIdx < originalText.length) {
    result.push({
      text: originalText.slice(currentIdx),
      isError: false,
    });
  }

  return result;
}

export function validateGrammarRequest(req: GrammarCheckRequest): boolean {
  if (!req || typeof req !== "object") return false;
  const validSections: LsrwSection[] = ["READING", "LISTENING", "SPEAKING", "WRITING"];
  if (!validSections.includes(req.section)) return false;
  if (typeof req.text !== "string" || !req.text.trim()) return false;
  return true;
}

export function normalizeGrammarResponse(
  raw: any,
  sectionFallback: LsrwSection = "WRITING"
): GrammarCheckResponse {
  const payload = raw?.data ?? raw;
  return {
    section: payload?.section || sectionFallback,
    totalWords: Number(payload?.totalWords ?? 0),
    correctWords: Number(payload?.correctWords ?? 0),
    errorCount: Number(payload?.errorCount ?? (Array.isArray(payload?.errors) ? payload.errors.length : 0)),
    grammarScore: Number(payload?.grammarScore ?? 0),
    spellingScore: Number(payload?.spellingScore ?? 0),
    sentenceScore: Number(payload?.sentenceScore ?? 0),
    vocabularyScore: Number(payload?.vocabularyScore ?? 0),
    finalScore: Number(payload?.finalScore ?? 0),
    errors: Array.isArray(payload?.errors) ? payload.errors : [],
  };
}

export function runGrammarVerificationSuite(): {
  allPassed: boolean;
  results: Array<{ testName: string; passed: boolean; message?: string }>;
} {
  const results: Array<{ testName: string; passed: boolean; message?: string }> = [];

  const validReq: GrammarCheckRequest = {
    section: "WRITING",
    text: "He go to school yesterday.",
    assessmentId: 123,
    questionId: 456,
  };
  results.push({
    testName: "Valid GrammarCheckRequest passes validation",
    passed: validateGrammarRequest(validReq) === true,
  });

  results.push({
    testName: "Empty text GrammarCheckRequest rejected",
    passed: validateGrammarRequest({ section: "SPEAKING", text: "   " }) === false,
  });

  const rawApi = {
    statusCode: 200,
    data: {
      section: "WRITING",
      totalWords: 5,
      correctWords: 4,
      errorCount: 1,
      grammarScore: 82,
      spellingScore: 90,
      sentenceScore: 75,
      vocabularyScore: 70,
      finalScore: 81,
      errors: [
        {
          originalText: "go",
          suggestion: "went",
          errorType: "TENSE_ERROR",
          startPosition: 3,
          endPosition: 5,
          explanation: "The sentence refers to the past.",
          severity: "HIGH",
        },
      ],
    },
  };
  const normalized = normalizeGrammarResponse(rawApi);
  results.push({
    testName: "Backend response wrapper unmarshalled correctly",
    passed:
      normalized.finalScore === 81 &&
      normalized.errors.length === 1 &&
      normalized.errors[0].suggestion === "went",
  });

  const original = "He go to school yesterday.";
  const segments = segmentTextWithErrors(original, normalized.errors);
  const reconstructed = segments.map((s) => s.text).join("");
  results.push({
    testName: "Original text preserved identically without automatic alteration",
    passed: reconstructed === original,
  });

  results.push({
    testName: "Error token correctly identified and isolated by start/end positions",
    passed:
      segments.length === 3 &&
      segments[0].text === "He " &&
      segments[1].text === "go" &&
      segments[1].isError === true &&
      segments[2].text === " to school yesterday.",
  });

  const oobSegments = segmentTextWithErrors("Short", [
    {
      originalText: "exceed",
      suggestion: "safe",
      errorType: "TEST",
      startPosition: 100,
      endPosition: 120,
      explanation: "",
      severity: "LOW",
    },
  ]);
  results.push({
    testName: "Out-of-bounds startPosition/endPosition handled gracefully without crash",
    passed: oobSegments.length === 1 && oobSegments[0].text === "Short",
  });

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
