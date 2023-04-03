let trainingFcl, testFcl;
let testCaseNumber = 0;
let correctGuessNumber = 0;
let guessResults = [];
let prediction = 'Iris-setosa'
let weights = [];
let previousWeights = [];
const activation = 0;
let learningRate = 0.0005;
let k = 0;

function activate(val) {
    // return 1 / (1 + Math.pow(Math.E, -val));
    return (2 / (1 + Math.pow(Math.E, -val))) - 1;
}

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

function trainWeights(fcl) {
    shuffleArray(fcl.attributes);
    console.log(fcl.attributes)
    let correctCount = 0;
    // if(JSON.stringify(previousWeights) === JSON.stringify(weights)) return;

    while((correctCount / fcl.attributes.length) < 1 && k++ < 5000) {
        correctCount = 0;
        for(let row of fcl.attributes) {
            const expectedResult = row[row.length - 1];
            let rowSum = 0;
            let isCorrect;
    
            weights.forEach((weight, index) => {
                rowSum += weight * row[index];
            })
    
            isCorrect = ((expectedResult === prediction && activate(rowSum) >= activation) ||
                         (expectedResult !== '?' && expectedResult !== prediction && activate(rowSum) < activation));
    
            if(!isCorrect) {
                previousWeights = weights.slice();
                weights.forEach((weight, index) => {
                    weights[index] = weight + (activation - rowSum) * learningRate * row[index];
                })
            }

            else correctCount++;
        }
    }
    
}

function checkResults(fcl) {
    let guessResults = [];
    correctGuessNumber = 0;
    k = 0;

    for(let row of fcl.attributes) {
        const expectedResult = row[row.length - 1];
        let rowSum = 0;
        let isActivated = false;

        weights.forEach((weight, index) => {
            rowSum += weight * row[index];
        });

        if(activate(rowSum) >= activation) isActivated = true;

        console.log(`row sum after activation is ${activate(rowSum)}, expected result is ${expectedResult}`)

        guessResults.push(isActivated);
        if((expectedResult === prediction && isActivated) ||
           (expectedResult !== '?' && expectedResult !== prediction && !isActivated)) correctGuessNumber++;
    }

    return {
        guessResults: guessResults,
        correctGuessNumber: correctGuessNumber
    }
}

function trainPerceptron(trainingFcl, testFcl) {    
    guessResults = [];
    correctGuessNumber = 0;
    if(!trainingFcl || !testFcl) return;
    if(trainingFcl?.attributes.length < 1 || testFcl?.attributes.length < 1) return;
    if(trainingFcl?.attributes[0].length < testFcl?.attributes[0].length) {
        const resultsWrapper = document.querySelector(".results-wrapper");
        resultsWrapper.innerText = 'Niepoprawne dane!';
        return;
    }

    document.querySelector('#custom-vector-wrapper').style.display = 'block';

    for(let i = 0; i < testFcl.attributes[0].length - 1; i++) weights[i] = Math.floor(Math.random() * 100) - 50;

    trainWeights(trainingFcl);
    console.log(weights);
    ({ guessResults, correctGuessNumber } = checkResults(testFcl));
    console.log(guessResults);

    displayResults();
}

function displayResults() {
    const resultsContainer = document.querySelector(".results-wrapper");
    const table = resultsContainer.querySelector("table");
    table.innerHTML = "<thead></thead><tbody></tbody>";
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    const headTr = document.createElement("tr");

    headTr.classList.add("d-flex", "justify-content-center");
    thead.appendChild(headTr);

    for(let i = 0; i < testFcl.attributes[0].length; i++) {
        let th = document.createElement("th");
        th.innerHTML = `#${i+1}`
        th.style.flex = "1";

        if(i === testFcl.attributes[0].length - 1) {
            th.innerHTML = `${prediction}`;
            th.style.flex = "2";
        } 
        thead.querySelector("tr").appendChild(th);
    }

    for(let i = 0; i < testFcl.attributes.length; i++) {
        let tr = document.createElement("tr");

        for(let j = 0; j < testFcl.attributes[i].length; j++) {
            let td = document.createElement("td");
            td.innerHTML = testFcl.attributes[i][j];
            td.style.flex = "1";

            if(j === testFcl.attributes[i].length - 1) {
                td.innerHTML = guessResults[i];
                td.style.flex = "2";
                if(testFcl.attributes[i][j] === '?') td.style.color = "#f6e58d";
                else if(((td.innerHTML === 'true') === (prediction === testFcl.attributes[i][j])) ||
                        ((td.innerHTML === 'false') === (prediction !== testFcl.attributes[i][j])))
                        td.style.color = "#78e08f";
                else td.style.color = "#e55039";
            }
            tr.appendChild(td);
        }
        tr.classList.add("d-flex", "justify-content-center");
        tbody.appendChild(tr);
    }
    document.querySelector(".accuracy").innerHTML = `<b>Dokładność: ${Math.round((correctGuessNumber / testCaseNumber) * 1000) / 10}% (${correctGuessNumber}/${testCaseNumber})</b>`
}

document.addEventListener('DOMContentLoaded', () => {
    const trainingInput = document.querySelector("#training-file-input");
    trainingInput.addEventListener('change', async () => {
        trainingFcl = new FileContentLoader(trainingInput.files[0]);
        await trainingFcl.readFileContent();
        trainPerceptron(trainingFcl, testFcl);
    })

    const testInput = document.querySelector("#test-file-input");
    testInput.addEventListener('change', async () => {
        testFcl = new FileContentLoader(testInput.files[0]);
        await testFcl.readFileContent();
        testCaseNumber = testFcl.attributes.length;
        trainPerceptron(trainingFcl, testFcl);
    })

    const speciesInput = document.querySelector("#species-select");
    speciesInput.addEventListener('change', (e) => {
        prediction = e.target.value;
        trainPerceptron(trainingFcl, testFcl);
    })

    const customVectorButton = document.querySelector("#custom-vector-button");
    customVectorButton.addEventListener('click', () => {
        if(!testFcl || !trainingFcl) return;

        const input = document.querySelector("#custom-vector");
        testFcl.addAttribute([...input.value.split(';'), '?']);
        trainPerceptron(trainingFcl, testFcl);
    })
})

