var dataArray = [];
var oldRawData

getDatafromDB();

const displayfromDB = $("#displayfromDB");



$('#getGrades').on('click', function () {
    displayInHTML();
    console.log(dataArray)
    dataArray.forEach((item, index) => {
        console.log(item)
        fetch('/gradesSave', {
            method: 'post',
            body: JSON.stringify(item),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if (!data.error) {
                getDatafromDB()
            }
            else
                displayMessage(false, data.error.message);
        });

    });

})

function getDatafromDB() {
    fetch('/getDatafromDB', { method: "get" }).then((response) => {
        return response.json();
    }).then((data) => {
        dataArray = data;
        console.log(data);
        displayGrades(data);
    });
}

function htmlAppend(singleData) {
    var stringOut = ""
    var name = ''
    var quarter = ''
    var finalGrade = ''
    name = singleData.fullName
    stringOut = name + ":"
    for (var index = 0; index < singleData.quarterGrades.length; index++) {
        quarter = singleData.quarterGrades[index].quarter
        finalGrade = singleData.quarterGrades[index].finalGrade
        stringOut += " Q" + quarter + " " + finalGrade
    }
    return `<p class="card-text">${stringOut}</p>`;
}

function displayGrades(data) {
    data.forEach((item) => {
        displayfromDB.append(htmlAppend(item));
    });
}


function extractData(array) {
    var stringArr = array;
    var prev_index = 0;
    var fullname = [];
    var gradesArray_H = [];
    var gradesArray_T = [];
    var finalG = 0;
    var quartertoPass
    var year

    dataArray = []
    array.forEach((item, index) => {
        //extract quarter and year
        quarter = item.match(/Quarter.*\d/g)
        if (quarter) {
            var prev_quarter = quartertoPass;
            year = item.match(/\d{4}$/g).toString()
            quartertoPass = item.match(/\d,/g).toString().replace(/,/g, '')
            console.log("Quarter: ")
            console.log(quarter)
            console.log("Year: ")
            console.log(year)
        }



        //extract fullName
        fullNameData = item.match(/\b[A-Z||a-z]{1,}?\b/g);
        if (fullNameData != 'H' && fullNameData != 'T' && fullNameData != 'Quarter') {
            if ((index - prev_index) == 1 && !(stringArr[prev_index].match(/Quarter.\d/g))) {
                name = stringArr[prev_index] + " " + stringArr[index]
                if (fullname.findIndex(x => x == name) < 0) {
                    fullname.push(name);
                }

                console.log("Full name: ")
                console.log(name)
            }
            prev_index = index;
        }

        //extract grades
        gradesData = item.match(/\b[H|T].*\b/g);
        if (gradesData) {
            gradesData = gradesData.toString();
            //homework grades
            if (gradesData.match(/^H/g)) {
                if (gradesArray_H.length == 0) {
                    gradesArray_H = gradesData.split(" ");
                }
                else {
                    gradesArray_H = gradesArray_H.concat(gradesData.split(" "))
                }
                console.log("Homework Grades Unprocessed: ");
                console.log(gradesArray_H);
            }
            //test grades
            if (gradesData.match(/^T/g)) {
                if (gradesArray_T.length == 0) {
                    gradesArray_T = gradesData.split(" ");
                }
                else {
                    gradesArray_T = gradesArray_H.concat(gradesData.split(" "))
                }
                console.log("Test Grades Unprocessed: ");
                console.log(gradesArray_T);

            }
        }
        else {

            gradesArray_H = cleanGrades(gradesArray_H, 'H')
            gradesArray_T = cleanGrades(gradesArray_T)
            if ((gradesArray_H.length != 0 && gradesArray_T.length != 0)) {
                console.log("Homework Grades CLEANED: ");
                console.log(gradesArray_H);
                console.log("Test Grades CLEANED: ");
                console.log(gradesArray_T);
                finalG = finalGrade(gradesArray_H, gradesArray_T);
                console.log("Final Grade: " + finalG)
                if (array[index].match(/Quarter.*\d/g)) {
                    makeJSON(fullname, name, prev_quarter, year, gradesArray_H, gradesArray_T, finalG);

                }
                else {
                    makeJSON(fullname, name, quartertoPass, year, gradesArray_H, gradesArray_T, finalG);
                }
            }
            gradesArray_H = []
            gradesArray_T = []
        }

        if (array.length - 1 == index) {
            gradesArray_H = cleanGrades(gradesArray_H, 'H')
            gradesArray_T = cleanGrades(gradesArray_T)
            if (gradesArray_H.length != 0 && gradesArray_T.length != 0) {
                console.log("Homework Grades CLEANED: ");
                console.log(gradesArray_H);
                console.log("Test Grades CLEANED: ");
                console.log(gradesArray_T);
                finalG = finalGrade(gradesArray_H, gradesArray_T);
                console.log("Final Grade: " + finalG)
                makeJSON(fullname, name, quartertoPass, year, gradesArray_H, gradesArray_T, finalG);
            }
        }


    })


}

function cleanGrades(grades, type) {
    var gradeArray = grades;
    gradeArray = grades.filter(function removeLetters(numbers) {
        return !isNaN(numbers);
    })
    gradeArray = gradeArray.map(function (grade) {
        return parseInt(grade, 10);
    });
    if (type == 'H') {
        const lowest = Math.min.apply(null, gradeArray);
        const pos = gradeArray.indexOf(lowest);
        return gradeArray.slice(0, pos).concat(gradeArray.slice(pos + 1));
    }
    return gradeArray;
}

function makeJSON(fullNameArray, fullName, quarter, year, homeworkGrade, testGrade, finalGrade) {
    var data =
    {
        "id": 0,
        "fullName": '',
        "quarterGrades": [
            {
                "quarter": '',
                "year": '',
                "homeworkGrade": [],
                "testGrade": [],
                "finalGrade": 0
            }
        ]
    }
    if ((fullNameArray == null || fullNameArray == undefined || fullNameArray == []) &&
        (fullName == null || fullName == undefined || fullName == '')) {
        console.log("JSON Data: ")
        console.log(data);
        return data;
    }
    else {
        var index = dataArray.findIndex(x => x.id == (fullNameArray.indexOf(fullName) + 1))
        if (index < 0) {
            index = fullNameArray.indexOf(fullName)
            data.id = index + 1
            data.fullName = fullName
            if (!(quarter == null || quarter == undefined || quarter == '')) data.quarterGrades[0].quarter = quarter
            if (!(year == null || year == undefined || year == '')) data.quarterGrades[0].year = year
            if (!(homeworkGrade == null || homeworkGrade == undefined || homeworkGrade == [])) data.quarterGrades[0].homeworkGrade = homeworkGrade
            if (!(testGrade == null || testGrade == undefined || testGrade == [])) data.quarterGrades[0].testGrade = testGrade
            if (!(finalGrade == null || finalGrade == undefined || finalGrade == [])) data.quarterGrades[0].finalGrade = finalGrade
            dataArray.push(data);
        }
        else {
            var qGradesIndex = dataArray[index].quarterGrades.findIndex(x => (x.year == year && x.quarter == quarter))
            if (qGradesIndex < 0) {
                dataArray[index].quarterGrades.push({})
                qGradesIndex = dataArray[index].quarterGrades.length - 1
            }
            if (!(quarter == null || quarter == undefined || quarter == '')) dataArray[index].quarterGrades[qGradesIndex].quarter = quarter
            if (!(year == null || year == undefined || year == '')) dataArray[index].quarterGrades[qGradesIndex].year = year
            if (!(homeworkGrade == null || homeworkGrade == undefined || homeworkGrade == [])) dataArray[index].quarterGrades[qGradesIndex].homeworkGrade = homeworkGrade
            if (!(testGrade == null || testGrade == undefined || testGrade == [])) dataArray[index].quarterGrades[qGradesIndex].testGrade = testGrade
            if (!(finalGrade == null || finalGrade == undefined || finalGrade == [])) dataArray[index].quarterGrades[qGradesIndex].finalGrade = finalGrade
        }
    }

    return data;
}

function finalGrade(HWGrade, testGrade) {
    var HWAveGrade = aveGrade(HWGrade);
    var testAveGrade = aveGrade(testGrade);

    var finalG = .60 * (testAveGrade) + .40 * (HWAveGrade);


    return finalG.toFixed(1);

}

function aveGrade(Gradearray) {
    var sum = 0;
    for (var i = 0; i < Gradearray.length; i++) {
        sum += parseInt(Gradearray[i], 10);
    }
    var avg = sum / Gradearray.length;
    return avg
}




function display(data, sortedBy) {
    var displayString = "<br>Averages<br>"
    var finalGrades = []
    var fullName
    console.log("Averages")
    data.sort((a, b) => (a.fullName > b.fullName) ? 1 : -1)
    data.forEach((item, index) => {
        fullName = item.fullName
        item.quarterGrades.forEach((itemG, index) => {
            finalGrades.push("Q" + itemG.quarter + " " + itemG.finalGrade)
        })
        console.log(fullName)
        displayString += fullName + ": "
        finalGrades.forEach((itemdispG, index) => {
            console.log(itemdispG)
            displayString += itemdispG + " "
            if (index == finalGrades.length - 1) {
                displayString += "<br>"
            }
        })
        finalGrades = [];
    })

    return displayString;

}


function displayInHTML() {

    var nameValue = document.getElementById("rawTextData").value;
    // if (oldRawData == nameValue){
    //     console.log("returned null")
    //     return null;
    // }
    console.log("get inside the dataprocess");
    var string = nameValue.replace(/[ ]+(?=[^\d])/g, '\n');
    var forDisplay = '<br>'
    forDisplay += nameValue.replace(/\n/g, '<br>');
    var stringArray = [];
    var dispStr
    stringArray = string.split("\n");
    console.log(forDisplay);
    console.log(stringArray);
    extractData(stringArray);
    console.log("Final Data: ")
    console.log(dataArray);
    dispStr = display(dataArray)

    if (dispStr == null || forDisplay == "<br>") {
        forDisplay = "No data found."
        dispStr = forDisplay
    }

    // document.getElementById("all").innerHTML = forDisplay;
    document.getElementById("display").innerHTML = dispStr;
    oldRawData = nameValue;
}

document.getElementById('chooseFile').addEventListener('click', function () {
    document.getElementById('myFile').click();
});

var filedom = document.getElementById('myFile')
if (filedom) {
    filedom.addEventListener('change', getFile)
    console.log(filedom);
}

function getFile(event) {
    trueValue = this.value.replace("C:\\fakepath\\", "");
    document.getElementById('fileName').value = trueValue;
    console.log(trueValue);
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        placeFileContent(
            document.getElementById('rawTextData'),
            input.files[0])
    }
}

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        target.value = content
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}