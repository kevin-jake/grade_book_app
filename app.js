const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const db = require("./db");

const collection = "grades";


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dataProcess.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dataProcess.js'));
});

app.get('/getGrades', (req, res) => {
    db.getDB().collection(collection).find().toArray(function(err, results) {
        console.log(results)
      })
});


db.connect((err)=>{
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    else {
        console.log('DB Connected!')
    }
});

app.listen(3000,()=>{
    console.log('App listening on port 3000');
});

module.export = app;