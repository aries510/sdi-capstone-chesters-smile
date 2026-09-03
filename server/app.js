const express = require('express');
const app = express();
const PORT = 8080;
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    response.status(200).send('Chester Smiles API Homepage....')
})





app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));