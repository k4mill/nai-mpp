let trainingFcl, testFcl;
let k = 1;
let testCaseNumber = 0;
let correctGuessNumber = 0;
let guessResults = [];

function calculateDistance(testCase, trainingCase) {
    let dst = 0;

    if(testCase.length < trainingCase.length) {
        for(let i = testCase.length - 1; i < trainingCase.length - 1; i++)
            testCase.splice(i, 0, 0);
    }

    testCase.forEach((value, index) => {
        if(index >= testCase.length - 2) return;
        dst += Math.pow(value - trainingCase[index] , 2);
    })
    return dst;
}

function findMode(array) {
    countMap = new Map();

    for(const value of array) {
        if(!countMap.has(value)) countMap.set(value, 1);
        else countMap.set(value, countMap.get(value) + 1);
    }

    const keysArray = Array.from(countMap.keys());

    if(countMap.size < 2) return keysArray[0];

    let maxCount = countMap.get(keysArray[0]);
    let maxCountKey = keysArray[0];
    countMap.forEach((value, key) => {
        if(value > maxCount) {
            maxCount = value;
            maxCountKey = key;
        } 
    })
    
    return maxCountKey;
}

function calculateDistances(trainingFcl, testFcl, k) {    
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

    for(const testCase of testFcl.attributes) {
        if(testCase.length < 2) continue; // at least 1 attribute + 1 decisive attribute

        let distances = [];

        for(const trainingCase of trainingFcl.attributes)
            distances.push(calculateDistance(testCase, trainingCase))

        const unsortedDistances = distances.slice();
        distances.sort();
        const resultArray = [];
        const usedIndexes = [];

        for(let i = 0; i < k; i++) {
            let index = unsortedDistances.indexOf(distances[i]);
            if(usedIndexes.includes(index)) index = unsortedDistances.indexOf(distances[i], index + 1);
            usedIndexes.push(index);
            resultArray.push(trainingFcl.attributes[index][trainingFcl.attributes[index].length - 1]);
        }

        const mode = findMode(resultArray);

        if(mode === testCase[testCase.length - 1]) correctGuessNumber++;
        guessResults.push(mode);
    }

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
            th.innerHTML = "Przewidywanie";
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
                if(td.innerHTML === testFcl.attributes[i][j]) td.style.color = "#78e08f";
                else if(testFcl.attributes[i][j] === '?') td.style.color = "#f6e58d";
                else {
                    td.style.color = "#e55039";
                    td.innerHTML += ` (correct: ${testFcl.attributes[i][j]})`;
                }
            }
            tr.appendChild(td);
        }
        tr.classList.add("d-flex", "justify-content-center");
        tbody.appendChild(tr);
    }
    document.querySelector(".accuracy").innerHTML = `<b>Accuracy: ${Math.round((correctGuessNumber / testCaseNumber) * 1000) / 10}% (${correctGuessNumber}/${testCaseNumber})</b>`
}

document.addEventListener('DOMContentLoaded', () => {
    const trainingInput = document.querySelector("#training-file-input");

    trainingInput.addEventListener('change', async () => {
        trainingFcl = new FileContentLoader(trainingInput.files[0]);
        await trainingFcl.readFileContent();
        document.querySelector("#k-input").max = trainingFcl.attributes.length;
        calculateDistances(trainingFcl, testFcl, k);
    })

    const testInput = document.querySelector("#test-file-input");
    testInput.addEventListener('change', async () => {
        testFcl = new FileContentLoader(testInput.files[0]);
        await testFcl.readFileContent();
        testCaseNumber = testFcl.attributes.length;
        calculateDistances(trainingFcl, testFcl, k);
    })

    const kInput = document.querySelector("#k-input");
    kInput.addEventListener('input', (e) => {
        k = e.target.value;
        calculateDistances(trainingFcl, testFcl, k);
    })

    const customVectorButton = document.querySelector("#custom-vector-button");
    customVectorButton.addEventListener('click', () => {
        if(!testFcl || !trainingFcl) return;

        const input = document.querySelector("#custom-vector");
        testFcl.addAttribute([...input.value.split(';'), '?']);
        calculateDistances(trainingFcl, testFcl, k);
    })
})

