const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const db = require("./db");
const Joi = require('joi');

const collection = "grades";
var fromGET = []
var dbID = {}
var fromFind = []

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
  }

// schema used for data validation for our database data
const schema = Joi.object().keys({
    id: Joi.number().required(),
    fullName: Joi.string(),
    quarterGrades: Joi.array().items(
        Joi.object().keys({
            quarter: Joi.string(),
            year: Joi.string(),
            homeworkGrade: Joi.array().items(Joi.number()),
            testGrade: Joi.array().items(Joi.number()),
            finalGrade: Joi.number()
        })
    )

});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dataProcess.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dataProcess.js'));
});

app.get('/getDatafromDB', (req, res) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err)
            console.log(err);
        else {
            fromGET = documents;
            res.json(documents);
        }
    });
});

app.post('/gradesSave', (req, res, next) => {
    const userInput = req.body;

    console.log(userInput)
    fromGET.forEach(element => {
        if (element.fullName == userInput.fullName) {
            dbID = db.getPrimaryKey(element._id);
            fromFind = element
            console.log(db.getPrimaryKey(element._id))

        }
    });
    Joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else {
            if (!isEmptyObject(dbID)) {
                    db.getDB().collection(collection).findOneAndUpdate(
                        { _id: db.getPrimaryKey(fromFind._id) },
                        {
                            $set: userInput
                        },
                        {returnOriginal : false},
                        (err, result) => {
                            if (err)
                                console.log(err);
                            else {
                                console.log("Updated on DB")
                                res.json(result);
                                return next()
                            }
                        });

            }
            else {
                db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                    if (err) {
                        const error = new Error("Failed to insert Document");
                        error.status = 400;
                        next(error);
                    }
                    else
                        res.json({ result: result, document: result.ops[0], msg: "Successfully inserted Grades!!!", error: null });
                    return next()
                });
            }

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