var express = require('express')
var fs = require('fs');
var path = require('path');

var multer = require('multer')
var upload = multer({ dest: __dirname })

const directory = 'uploads';

var app = express()

app.use(function (req, res, next) {
	const whitelist = ['https://55ahmedsalah.github.io/', 'http://localhost:5500', 'http://127.0.0.1:5500/', 'http://localhost:3000', 'http://127.0.0.1:3000/']; // array of whitelisted website
	const origin = req.headers["origin"];
	if(whitelist.includes(origin)){
		res.header("Access-Control-Allow-Origin", origin)
		res.header("Access-Control-Allow-Credentials", true);
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
	}
	next();
});

// app.use(express.static(path.join(__dirname, 'public')))
// app.set('uploads', path.join(__dirname, 'uploads'))
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'ejs')

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.post('/upload', upload.single("video"), function (req, res) {
	console.log("Received file " + req.file.originalname);
	var src = fs.createReadStream(req.file.path);
	var dest = fs.createWriteStream('uploads/' + req.file.originalname);
	src.pipe(dest);
	src.on('end', function () {
		fs.unlinkSync(req.file.path);
		res.json('OK: received ' + req.file.originalname);
		return;
	});
	src.on('error', function (err) { res.json('Upload went wrong!'); });
})

app.get('/text', function (req, res) {
  var spawn = require("child_process").spawn;
  var process = spawn('python', ["./main.py"]);

  console.log("-------------------------");
  console.log("Sending predicted text...");

  let timerId = setInterval(function () {
    fs.readFile('prediction.txt', 'utf8', function (err, prediction) {
      if (prediction !== "") {
        clearInterval(timerId);

        // Clear file
        fs.writeFile('prediction.txt', '', function () { console.log('File Cleared\n') })

        // Delete uploads folder content
        fs.readdir(directory, (err, files) => {
          if (err) throw err;
          for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
              if (err) throw err;
            });
          }
        });

        console.log("Prediction: " + prediction);
        console.log("-------------------------");
        console.log("Deleted user videos");
        res.json(prediction);
        return;
      } else {
        console.log("...");
      }
    });
  }, 5000);
})

app.get('/folder', function (req, res) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      console.log(file);
    }
  });
})

let port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', function () {
  return console.log("Server started on port " + port + "\n");
});