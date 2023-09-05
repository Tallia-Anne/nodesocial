const express = require('express');
const bodyparser = require('body-parser');
 const cors = require('cors');

let port = 3000;
let hostname = 'localhost'


let app = express();

 app.use(cors());

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({ extended: false }));

// importation des routes

app.use("/users", require("./router/user"));
app.use("/postes", require("./router/postes"));
app.use("/comments", require("./router/comments"));

app.listen(port, hostname, function () {
    console.log("mon server fonction sur http://" + hostname +":" + port + "\n");
});