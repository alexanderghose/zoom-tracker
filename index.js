let conf = require('./config/conf.json').CONF;
let imap = require('./config/conf.json').IMAP;
let sheetParams = require('./config/conf.json').SHEET;

var MailListener = require("mail-listener2");


const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./config/zoom-recording-tracker-6a8bd724ca99.json");

/* DIRTY REGEX FOR PULLING THE URL AND PASSWORD */
const regex = /(?<=share this recording with viewers\:\n)(.*)|(?<=Passcode\:\n)(.*)/g;
/* ----------------------------- */
// readXML.loadDoc();


var mailListener = new MailListener({
  username: imap.name,
  password: imap.pass,
  host: imap.host,
  port: imap.port, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  markSeen: false, // all fetched email willbe marked as seen and not fetched next time
  attachments: false,
});

mailListener.start(); // start listening
mailListener.on("server:connected", function () {
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function () {
  console.log("imapDisconnected");
});

mailListener.on("error", function (err) {
  console.log(err);
});

mailListener.on("mail", async function (mail, seqno, attributes) {
  let newMessage = "";
  if (mail.from[0].address == conf.email && mail.subject == conf.catchSubject) {
    let parsedMessage = mail.text.match(regex);
    if (parsedMessage && parsedMessage.length === 2){
      try {
        let sheet = await sheetsConnect();
        await updateRow(sheet, parsedMessage);
      } catch (err) {
        console.log(err);
      }
      
    } 
  }
});

/* rows = total rows in cell selection
  column = column id to check for empty val
  start = header column position (i.e. "URL" )
*/
function firstEmptyRow(sheet) {
  for (let i = sheetParams.headerRow; i < sheet.gridProperties.rowCount; i++) {
    let thisCell = sheet.getCell(i, sheetParams.urlCol);
    if (thisCell.value === null) {
      return i;
    }
  }
}
/* 
  using first empty row, populate with values passed from imap checker
*/
async function updateRow(sheet, parsedMessage, topic="UPDATE TOPIC") {
  try {
    await sheet.loadCells("A:D");
    let newRow = firstEmptyRow(sheet);
    sheet.getCell(newRow, sheetParams.dateCol).value = new Date().getDateForHTML();
    sheet.getCell(newRow, 1).value = require('./topic.json').TOPIC;
    sheet.getCell(newRow, sheetParams.passCol).value = parsedMessage[1];
    sheet.getCell(newRow, sheetParams.urlCol).value = parsedMessage[0];
    sheet.saveUpdatedCells();
  } catch (err) {
    console.log(err);
  }
}

async function sheetsConnect() {
  try {
    const doc = new GoogleSpreadsheet(sheetParams.id);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
  } catch (err) {
    console.log(err);
  }
}
Date.prototype.getDateForHTML = function () {
  return `${this.getUTCFullYear()}/${(this.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}/${this.getUTCDate().toString().padStart(2, "0")}`;
};

