let path = require('path')
let texFile = 'E:\\MATH3310 LaTeX\\Homework 2\\Answer.tex';
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
    console.log("regen")
    genLatex()
  }
})


let childProcess = require('child_process')
function genLatex() {
  let child = childProcess.exec('pdflatex -interaction=nonstopmode '+path.basename(texFile),{
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


server.listen(3000)
