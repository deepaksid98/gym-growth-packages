// ================================================
// GYM GROWTH SYSTEM — Google Apps Script Backend
// Paste this into: script.google.com → New Project
// Deploy as: Web App → Anyone → Execute as: Me
// ================================================

const SHEET_NAME = "Clients";
const LOG_SHEET  = "WeeklyLogs";

// ── Entry point ──────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  if (action === "getClients")   return ok(getClients());
  if (action === "getLogs")      return ok(getLogs(e.parameter.clientId));
  return ok({ error: "Unknown action" });
}

function doPost(e) {
  const data   = JSON.parse(e.postData.contents);
  const action = data.action;
  if (action === "addClient")    return ok(addClient(data.client));
  if (action === "logWeight")    return ok(logWeight(data.log));
  if (action === "deleteClient") return ok(deleteClient(data.clientId));
  return ok({ error: "Unknown action" });
}

// ── Helpers ──────────────────────────────────────
function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Create headers
    if (name === SHEET_NAME) {
      sheet.appendRow(["ID","Name","Phone","Age","StartWeight","Goal","Notes","JoinedAt"]);
      sheet.getRange(1,1,1,8).setFontWeight("bold").setBackground("#E53935").setFontColor("#fff");
    } else {
      sheet.appendRow(["ClientID","Week","Weight","Notes","Date"]);
      sheet.getRange(1,1,1,5).setFontWeight("bold").setBackground("#333").setFontColor("#fff");
    }
  }
  return sheet;
}

function uid() {
  return Utilities.getUuid().slice(0, 8);
}

// ── Client CRUD ──────────────────────────────────
function getClients() {
  const sheet = getSheet(SHEET_NAME);
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(r => ({
    id: r[0], name: r[1], phone: r[2], age: r[3],
    startWeight: r[4], goal: r[5], notes: r[6], joinedAt: r[7]
  }));
}

function addClient(client) {
  const sheet = getSheet(SHEET_NAME);
  const id    = uid();
  const date  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
  sheet.appendRow([id, client.name, client.phone, client.age, client.startWeight, client.goal, client.notes, date]);
  return { success: true, id };
}

function deleteClient(clientId) {
  const sheet = getSheet(SHEET_NAME);
  const data  = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === clientId) { sheet.deleteRow(i + 1); break; }
  }
  // Also remove logs
  const logSheet = getSheet(LOG_SHEET);
  const logs     = logSheet.getDataRange().getValues();
  for (let i = logs.length - 1; i >= 1; i--) {
    if (logs[i][0] === clientId) logSheet.deleteRow(i + 1);
  }
  return { success: true };
}

// ── Weekly Log ───────────────────────────────────
function getLogs(clientId) {
  const sheet = getSheet(LOG_SHEET);
  const rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1)
    .filter(r => r[0] === clientId)
    .map(r => ({ clientId: r[0], week: r[1], weight: r[2], notes: r[3], date: r[4] }));
}

function logWeight(log) {
  const sheet = getSheet(LOG_SHEET);
  const date  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
  sheet.appendRow([log.clientId, log.week, log.weight, log.notes, date]);
  return { success: true };
}
