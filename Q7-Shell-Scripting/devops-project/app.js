const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("Automated DevOps App 🚀");
});

app.listen(3000, () => console.log("Server running"));
