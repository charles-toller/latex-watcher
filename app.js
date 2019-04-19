#!/usr/bin/env node
let path = require('path')
if (process.argv.length < 3) {
  console.log("PASS THE FILENAME")
  process.exit(1)
}
let texFile = process.argv[2]
let pdfFile = path.dirname(texFile) + path.sep + path.basename(texFile, '.tex') + '.pdf';
let logText = "";

let express = require('express')
let app = express()
let server = require('http').Server(app)
app.use(express.static('dist'))
app.get('/latex.pdf', (req, res) => {
  if (pdfFile === "LOG") {
    res.send(logText);
    return;
  }
  res.sendFile(pdfFile)
});
let io = require('socket.io')(server)
io.on('connection', (socket) => {
})


let fs = require('fs')
fs.watchFile(texFile, (curr, prev) => {
  if (curr.mtime != prev.mtime) {
    genLatex()
  }
})


let childProcess = require('child_process')

function genLatex() {
  childProcess.exec('pdflatex -interaction=nonstopmode ' + path.basename(texFile), {
    cwd: path.dirname(texFile),
  }, (error) => {
    if (!error) {
      pdfFile = path.dirname(texFile) + path.sep + path.basename(texFile, '.tex') + '.pdf'
    } else {
      let logFile = path.dirname(texFile) + path.sep + path.basename(texFile, '.tex') + '.log';
      pdfFile = "LOG";
      let log = fs.readFileSync(logFile).toString().split("\n");
      let errorIndex = log.findIndex((a) => a.slice(0,1) === "!");
      let errorText = "";
      for (;;errorIndex++) {
        if (log[errorIndex].trim() === "") break;
        errorText += log[errorIndex] + "\n";
      }
      logText = `
<html>
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>
<body>
    <div class="container-fluid" style="padding-top: 10px;">
        <div class="alert alert-danger"><pre>${errorText}</pre></div><pre>${log.join("\n")}</pre>
    </div>
</body>
</html>`;
    }
    io.emit('reload')
  })

}

genLatex()

server.listen(process.argv[3] || 3000)
