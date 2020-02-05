var express = require("express");
var cors = require("cors")
var app = express();
var bodyParser = require("body-parser");
var request = require("request")
const { google } = require('googleapis');
var atob = require('atob');
const Blob = require("cross-blob");
var fs = require('fs');



app.use(cors())

app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/url", (req, res, next) => {
  res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  //Old Code
  //write the ArrayBuffer to a blob, and you're done
  //var bb = new BlobBuilder();
  //bb.append(ab);
  //return bb.getBlob(mimeString);

  //New Code
  return new Blob([ab], {type: mimeString});


}

function createBuffer(dataURI) {

  var regex = /^data:.+\/(.+);base64,(.*)$/;

  var matches = dataURI.match(regex);
  var ext = matches[1];
  var data = matches[2];
  return Buffer.from(data, 'base64');
}

app.post("/api/auth", cors(), function(req, res) {
  request.post('https://www.googleapis.com/oauth2/v4/token', {
    json: {
      grant_type: 'authorization_code',
      client_id: req.body.client_id,
      client_secret: 'y1b2ipHhI-EbhV81k9JdpU1D',
      redirect_uri: req.body.redirect_uri,
      code: req.body.code
    }
  }, (error, googleres, body) => {
    if (error) {
      console.error(error)
      return
    }
    res.send(body)
  })
})

app.post("/api/images/upload", cors(),function (req, res) {
  console.log(req.body.token)
  request.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
    headers : {
      "Authorization" : 'Bearer ' + req.body.token
    },
    json: req.body.data,
  }, (error, googleres, body) => {
    if (error) {
      console.error(error)
      return
    }
    res.send(body)
  })
})

app.listen(4000, () => {
  console.log("Server running on port 4000")
})