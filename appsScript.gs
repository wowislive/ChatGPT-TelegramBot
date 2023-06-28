const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("msgData");

function doPost(e) {
  try {
    const inputData = JSON.parse(e.postData.contents);
    const inputText = inputData.inputString;
    const userId = inputData.userId;
    const lastRow = sheet.getLastRow();
    let rowIndex = 1;

    if (lastRow > 0) {
      const dataRange = sheet.getRange(1, 2, lastRow, 1);
      const userIds = dataRange.getValues().flat();
      rowIndex = userIds.indexOf(parseInt(userId)) + 1;
      if (rowIndex == 0) {
        rowIndex = lastRow + 1;
        if (sheet.getRange(1, 1).getValue() == "") {
          rowIndex = 1;
        }
      }
    }

    if (inputData.inputString === "reset") {
      sheet.getRange(rowIndex, 1).setValue("");
      sheet.getRange(rowIndex, 2).setValue("");
      return ContentService.createTextOutput("");
    } else {
      const sheetData = sheet.getRange(rowIndex, 1).getValue();
      const newData = sheetData + inputText;
      sheet.getRange(rowIndex, 1).setValue(newData);
      sheet.getRange(rowIndex, 2).setValue(userId);
      return ContentService.createTextOutput(newData);
    }
  } catch (e) {
    Logger.log(e);
  }
}
