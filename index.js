import express from "express";
import { google } from "googleapis";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const spreadsheetId = "1Pi0jVoONxo4BbDdCotj312OiegBGWGrwlNvIx3s7atE";
const keyFileLocation = "./secrets/kamodb-a5b0919fa34c.json";
const sheetName = "TestSheet";

let cachedRows = null

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

app.get("/getRows", async (req, res) => {
    getRows().then((rows) => res.json(rows))
});

app.post("/", async (req, res) => {
    const { url, tags } = req.body;

    const [googleSheets, auth] = await getAuthAndSheets()

    const rows = await getRows()
    const id = rows.length

    console.log(`trying to insert: [${id}, ${url}, ${tags}]`)

    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: `${sheetName}!A:C`,
        valueInputOption: "USER_ENTERED",
        resource: {
        values: [[id, url, tags]],
        },
    });

    console.log("clearing cache")
    cachedRows = null

    res.send(`Successfully appended [${id}, ${url}, ${tags}]. Redirecting in 1s
        <script>
            console.log("redirecting")
            setTimeout(() => {
                console.log("now")
                window.location.replace("http://localhost:5000/")
            }, 1000)
        </script>
    `)
});

async function getAuthAndSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: keyFileLocation,
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    return [googleSheets, auth]
}

async function getRows() {
    if(cachedRows != null) {
        console.info("returning cached rows")
        return cachedRows
    } else {
        console.info("no cached rows. Calling api and caching")
        return await getRowsAndCache()
    }
}

async function getRowsAndCache() {
    const [googleSheets, auth] = await getAuthAndSheets()

    // Get metadata about spreadsheet
        const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `${sheetName}!A:C`,
    });

    cachedRows = getRows.data.values
    return cachedRows
}

app.listen(5000, (req, res) => console.log("running on 5000"));