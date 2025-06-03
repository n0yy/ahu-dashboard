"use server";

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
  return await fn();
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isQuotaError =
        (error as Error).message.includes("429") ||
        (error as Error).message.includes("Quota exceeded");

      if (isQuotaError && attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        console.log(
          `Quota exceeded, retrying in ${delayTime}ms... (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await delay(delayTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function getSheetData(
  worksheetName: string
): Promise<{ title: string; data: any[] }> {
  const cacheKey = `${process.env.SHEET_ID}_${worksheetName}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Returning cached data");
    return cached.data;
  }

  try {
    const result = await retryWithBackoff(async () => {
      return await rateLimitedRequest(async () => {
        const doc = new GoogleSpreadsheet(
          process.env.SHEET_ID!,
          new JWT({
            email: process.env.CLIENT_EMAIL!,
            key: process.env.PRIVATE_KEY!.replace(/\\n/g, "\n"),
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
          })
        );

        await doc.loadInfo();

        const sheet = doc.sheetsByTitle[worksheetName];
        if (!sheet) {
          throw new Error(`Sheet ${worksheetName} not found in spreadsheet`);
        }

        await sheet.loadHeaderRow(1);
        const rows = await sheet.getRows();
        let data: { [key: string]: any }[] = [];

        if (worksheetName === "SETIAP MESIN") {
          data = rows.map((row: GoogleSpreadsheetRow) => ({
            date: row.get("Tanggal"),
            month: row.get("Bulan"),
            machine: row.get("Mesin"),
            bdDuration: row.get("Durasi BD (menit)"),
            bdFreq: row.get("Frekuensi BD"),
            mttr: row.get("MTTR"),
            mtbf: row.get("MTBF"),
          })) as { [key: string]: any }[];
        }

        if (worksheetName === "WO SELURUH") {
          data = rows.map((row: GoogleSpreadsheetRow) => ({
            date: row.get("Date"),
            month: row.get("Month"),
            description: row.get("Description"),
            causeBreakdown: row.get("Cause Breakdown"),
            machine: row.get("Machine"),
            actualStart: row.get("Actual Start"),
            complete: row.get("Complete"),
            duration: row.get("Duration"),
          }));
        }

        return {
          title: worksheetName,
          data,
        };
      });
    });

    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result; // 🔥 Tambahkan ini
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("Quota exceeded")
    ) {
      throw new Error(
        "Google Sheets API quota exceeded. Please try again in a few minutes. " +
          "Consider implementing longer caching or reducing API calls."
      );
    } else if (errorMessage.includes("403")) {
      throw new Error(
        "Access denied to Google Sheets. Please check your service account permissions."
      );
    } else if (errorMessage.includes("404")) {
      throw new Error(
        `Spreadsheet not found. Please verify the Sheet ID: ${process.env.SHEET_ID}`
      );
    }

    throw new Error(`Failed to fetch sheet data: ${errorMessage}`);
  }
}
