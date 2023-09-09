const Sequelize = require('sequelize');
require('dotenv').config();

console.log('\n les donnée:')
console.log('Schema  :', process.env.database_URL)
console.log('User    :', process.env.DB_USER)
console.log('Passwd  :', process.env.DB_PASSWORD)
console.log('Host    :', process.env.DB_HOST)
console.log('Port    :', process.env.DB_PORT, '\n')

const db = {};

const dbinfo = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});



dbinfo
    .authenticate()
    .then(() => {
        console.log("connexion de la base de données");
    })
    .catch((err) => {
            console.error("il n'est pas connecter à la base de données: " + err);
    })


// Les tables

db.postes = require("../models/Postes")(dbinfo, Sequelize);

db.users = require("../models/User")(dbinfo, Sequelize);

db.image = require("../models/Image")(dbinfo, Sequelize);

db.comments = require("../models/Comment")(dbinfo, Sequelize);

// Les relations:

db.users.hasMany(db.comments, { foreignKey: "userId" });
db.postes.hasMany(db.image, { foreignKey: "postesId" });
db.postes.hasMany(db.comments, { foreignKey: "postesId" });

db.users.hasMany(db.postes, { foreignKey: "userId" });
db.postes.belongsTo(db.users, { foreignKey: "userId" });

db.dbinfo = dbinfo;

db.Sequelize = Sequelize;

 //dbinfo.sync({ force: true });

module.exports = db;