# Google Sheets Webhook Setup

Every PawPrint scan POSTs a JSON payload to `GOOGLE_SHEET_WEBHOOK_URL`.
Follow these steps to wire it up in under 5 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new sheet
2. Name it **PawPrint Submissions**
3. Add these headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | pet_name | pet_type | breed_identified | confidence | temperament | care_notes | owner_name | twitter_handle | origin | fun_fact |

---

## Step 2 — Create the Apps Script

1. In your sheet, click **Extensions → Apps Script**
2. Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || '',
      data.pet_name || '',
      data.pet_type || '',
      data.breed_identified || '',
      data.confidence || '',
      data.temperament || '',
      data.care_notes || '',
      data.owner_name || '',
      data.twitter_handle || '',
      data.origin || '',
      data.fun_fact || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (give the project any name, e.g. "PawPrint Webhook")

---

## Step 3 — Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type" → choose **Web app**
3. Set:
   - **Description:** PawPrint webhook
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. Authorise the permissions when prompted
6. Copy the **Web app URL** — it looks like:
   `https://script.google.com/macros/s/XXXXXXXXXX/exec`

---

## Step 4 — Add to Vercel

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add:
   - **Name:** `GOOGLE_SHEET_WEBHOOK_URL`
   - **Value:** the Web app URL from Step 3
   - **Environment:** Production (and Preview if desired)
3. Click **Save** and **Redeploy**

---

## Testing

After deploying, make a test scan on the live app.
Within seconds a new row should appear in your sheet.

You can also test the webhook directly:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2025-01-01T00:00:00Z","pet_name":"Diesel","pet_type":"dog","breed_identified":"English Springer Spaniel","confidence":94,"fun_fact":"Test row"}'
```

---

## Notes

- The webhook is **fire-and-forget** — if it fails it logs to Vercel but never blocks the user
- If `GOOGLE_SHEET_WEBHOOK_URL` is not set, the app works normally and just skips the sheet write
- You can add more columns to the sheet freely — the script only appends the fields it receives
