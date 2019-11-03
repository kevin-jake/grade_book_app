const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const db = require("./db");
const Joi = require('joi');

const collection = "grades";

// schema used for data validation for our todo document
const schema = Joi.object().keys({
    id : Joi.number().required(),
    fullName: Joi.string(),
    quarterGrades: Joi.array().items(
        Joi.object().keys({
            quarter: Joi.string(),
            year: Joi.string(),
            homeworkGrade: Joi.array().items( Joi.number()),
            testGrade: Joi.array().items( Joi.number()),
            finalGrade: Joi.number()
        })
    )
        
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
    db.getDB().collection(collection).find().toArray(function (err, results) {
        console.log(results);
        res.render('index.ejs', { grades: results })
    })
});

app.get('/dataProcess.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dataProcess.js'));
});

app.post('/gradesSave', (req, res, next) => {
    const userInput = req.body;
    console.log (userInput);
    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                }
                else
                res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
        })
    })

db.connect((err) => {
    if (err) {
        console.log('unable to connect to database');
        process.exit(1);
    }
    else {
        console.log('DB Connected!')
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
    }
});



module.export = app;