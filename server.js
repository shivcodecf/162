const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 9879;


const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http:localhost:9876/numbers/";


let windowNumbers = [];


app.use(bodyParser.json());


async function fetchNumbers(numberId) {
    try {
        const response = await axios.get(TEST_SERVER_URL + numberId);
        if (response.status === 200) {
            return response.data.numbers || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching numbers:", error);
        return [];
    }
}


function updateWindow(newNumbers) {
    windowNumbers.push(...newNumbers);
    windowNumbers = Array.from(new Set(windowNumbers));  // Remove duplicates
    if (windowNumbers.length > WINDOW_SIZE) {
        windowNumbers = windowNumbers.slice(-WINDOW_SIZE);  // Keep only the latest WINDOW_SIZE numbers
    }
}


app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;
    const numbersFromServer = await fetchNumbers(numberId);
    updateWindow(numbersFromServer);
    
    const windowPrevState = windowNumbers.slice(0, -numbersFromServer.length);
    const windowCurrState = windowNumbers.slice(-WINDOW_SIZE);
    const average = windowCurrState.length > 0 ? windowCurrState.reduce((a, b) => a + b, 0) / windowCurrState.length : 0;

    const response = {
        numbers: numbersFromServer,
        windowPrevState: windowPrevState,
        windowCurrState: windowCurrState,
        avg: average.toFixed(2)
    };
    res.json(response);
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



