let path = require('path')
if(process.argv.length < 3) {
  console.log("PASS THE FILENAME")
  process.exit(1)
}
let texFile = process.argv[2]
let pdfFile = path.dirname(texFile) + path.sep + path.basename(texFile,'.tex') + '.pdf';

let express = require('express')
let app = express()
let server = require('http').Server(app)
app.use(express.static('dist'))
app.get('/latex.pdf',(req,res)=>{
  res.sendFile(pdfFile)
})
let io = require('socket.io')(server)
io.on('connection',(socket)=>{})


let fs = require('fs')
fs.watchFile(texFile,(curr,prev)=>{
  if(curr.mtime != prev.mtime) {
    genLatex()
  }
})


let childProcess = require('child_process')
function genLatex() {
  childProcess.exec('pdflatex -interaction=nonstopmode '+path.basename(texFile),{
    cwd:path.dirname(texFile)
  },(error)=>{
    if(!error) {
      pdfFile = path.dirname(texFile) + path.sep + path.basename(texFile,'.tex') + '.pdf'
    }
    else {
      pdfFile = path.dirname(texFile) + path.sep + path.basename(texFile,'.tex') + '.log'
    }
    io.emit('reload')
  })

}

genLatex()

server.listen(process.argv[3] || 3000)
