// Importing xslx module
const reader = require('xlsx');

// Importing fs module
const fs = require('fs');

// Importing config file
const Config = require('../configs/config');
// Importing dropbox module
const Dropbox = require('dropbox').Dropbox;
// Initializing dropbox class
const dbx = new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });

exports.extractJsonFromSheet = (filePath, dbFilePath) => {
    // Reading the file from the app folder
    const file = reader.readFile(filePath);
    // All the data available in the excel sheet
    let allExcelData = [];
    // The sheets name
    const sheets = file.SheetNames;
    // For each sheet in all the sheets
    sheets.forEach((sheet) => {
        const temp = reader.utils.sheet_to_json(file.Sheets[sheet], { raw: false, defval: "undefined" });
        temp.forEach((result) => {
            allExcelData.push(result);
        });
    });

    this.extractSheetFromJson(allExcelData,  dbFilePath);

    return allExcelData;
}

exports.extractSheetFromJson = async (json, dbFilepath) => {
    // Creating a new workbook
    let workbook = reader.utils.book_new();
    // Converting from json to sheet
    let worksheet = reader.utils.json_to_sheet(json);
    // Adding the worksheet to the workbook
    reader.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    // Writting the 
    reader.writeFile(workbook, dbFilepath);
    const file = fs.readFileSync(dbFilepath);

    const uploadFileName = Date.now();
    const uploadFilePath = `/File Requests/test/${uploadFileName}.xlsx`;

    try {
        await dbx.filesUpload({ path: uploadFilePath, contents: file });
    } catch (error) {
        console.log(error);
    }
}