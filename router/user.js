const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../database/db");

process.env.SECRET_KEY = "secret";
// s'inscrit
router.post("/register", (req, res) => {
    if (req.body.role !== "admin" && req.body.role !== "") {
        role = "user";
    } else {
        role = "admin";
    }
    db.users
        .findOne({
            where: { email: req.body.email },
        })
        .then((user) => {
            if (!user) {
                password = bcrypt.hashSync(req.body.password, 10);
                db.users
                    .create({
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        email: req.body.email,
                        password: password,
                        role: role,
                    })
                    .then((item) => {
                        var nodemailer = require("nodemailer");
                        var transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "erinawambiekele@gmail.com",
                                pass: "kwvdrkmkrhaqczkg",
                            },
                           
                        });

                        var mailOptions = {
                            from: "erinawambiekele@gmail.com",
                            to: item.email,
                            subject: "Bienvenue dans notre application",
                            text: " Je vous souhaite une bienvenue:  " + item.email,
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.error("Error while sending email:", error);
                                res.status(500).json({ error: "Error while sending email" });
                            } else {
                                console.log("Email sent: " + info.response);
                                // Rest of your code for generating token and sending response
                            }
                        });
                    })
                    .catch((createErr) => {
                        console.error("Error while creating user:", createErr);
                        res.status(401).json({ error: "Error while creating user" });
                    });
            } else {
                res.json("User already exists in the database");
            }
        })
        .catch((findErr) => {
            console.error("Error while finding user:", findErr);
            res.status(500).json({ error: "Error while finding user" });
        });
});

// afficher tous les utilisateurs
router.get("/all", (req, res) => {
    
    db.users.findAll()
        .then((users) => {
            if (users) {
                res.status(200).json({
                    users: users
                })
            } else {
                res.status(404).json("il n'a pas d'utilisateur")
            }
        })
        .catch((err) => {
             res.json(err);
        });
});


// se connecter
router.post("/login", (req, res) => {
    console.log(req.body);
    db.users.findOne({
        where: { email: req.body.email }
    }).then(user => {
        if (user) {
            if (bcrypt.compareSync(req.body.password,
                user.password)) {
                var userdata = {
                    id: user.id,
                    role: user.role,
                    nom: user.nom,
                    prenom: user.prenom
                }
                let token = jwt.sign(userdata,
                    process.env.SECRET_KEY, {
                    expiresIn: 1440
                });
                res.status(200).json({ auth: true, token: token })
            } else {
                res.json({
                    auth: false,
                    message: "error email or password"
                })
            }
        } else {
            return res.status(404).json('user not found')
        }
    })
        .catch(err => {
            res.json(err)
        })
});
//route: c'est le profile
router.get("/profile/:id", (req, res) => {
    db.users
        .findOne({
            where: { id: req.params.id },
        })
        .then((user) => {
            if (user) {
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: 1440,
                });
                res.status(200).json({ token: token });
            } else {
                res.json("error: le user n'est pas dans la base de donnée !!");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});

router.put("/update/:id", (req, res) => {
    db.users.findOne({
        where: { id: req.params.id }
    })
        .then(user => {
            if (user) {
                const { nom, prenom, image } = req.body;

                // Mettre à jour les propriétés de l'utilisateur
                user.nom = nom;
                user.prenom = prenom;
                user.image = image;
              
               

                user.save()
                    .then(updatedUser => {
                        // Générer le token avec les nouvelles données de l'utilisateur
                        const token = jwt.sign(updatedUser.toJSON(), process.env.SECRET_KEY, {
                            expiresIn: 1440 // en secondes
                        });
                        res.status(200).json({ token: token });
                    })
                    .catch(err => {
                        res.status(402).send("Impossible de mettre à jour l'utilisateur : " + err);
                    });
            } else {
                res.status(404).json({ message: "Utilisateur non trouvé dans la base de données" });
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Erreur lors de la recherche de l'utilisateur : " + err });
        });
});

// route permet valider son adresse mail
router.post("/validemail", (req, res) => {
    db.users
        .findOne({
            // recuperer le email
            where: { email: req.body.email },
        })
        .then((user) => {
            if (user) {
                if (user.Status !== 1) {
                    // changer le status qui devient un compte valide et il peut l'utiliser
                    user
                        .update({
                            Status: 1,
                        })
                        // L'utilisateur va recevoir ce message
                        .then(() => {
                            res.json({
                                message: "votre compte a été activer",
                            });
                        })
                        .catch((err) => {
                            res.json(err);
                        });
                } else {
                    res.json("votre compte est déja validé");
                }
            } else {
                res.status(404).json("user not found !!!");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});

// route permet faire mot de passe oublié
router.post("/forgetpassword", (req, res) => {
    var randtoken = require("rand-token");
    // ça generer le token
    var token = randtoken.generate(16);
    db.users
        .findOne({
            // recuperer l'adresse email
            where: { email: req.body.email },
        })
        .then((user) => {
            if (user) {
                user
                    .update({
                        forget: token,
                    })
                    .then((item) => {
                        var nodemailer = require("nodemailer");
                        var transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "erinawambiekele@gmail.com",
                                pass: "kwvdrkmkrhaqczkg",
                            },

                        });

                        var mailOptions = {
                            from: "erinawambiekele@gmail.com",
                            to: item.email,
                            subject: "Mot de passe oublié",

                            text: " Voici le lien pour mettre à jour " +
                                " " +
                               
                                " " +
                                " le code de mot de passe oublié:" +
                                " " +
                                item.forget,
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                res.json(error);
                                console.log(error);
                            } else {
                                console.log("email sent" + info.response);
                                res.json("email sent" + info.response);
                            }
                        });
                    })
                    .catch((err) => {
                        res.json(err);
                    });
            } else {
                res.status(404).json("user not found");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});
// route permet de mettre à jour le mot de passe
router.post("/updatepassword", (req, res) => {
    db.users
        .findOne({
            // recuperer le token du forget
            where: { forget: req.body.forget },
        })
        .then((user) => {
            if (user) {
                // hacher de mot de passe
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                // mettre à jour seulement le password de l'utilisateur
                user
                    .update({
                        password: req.body.password,
                        forget: null,
                    })

                    .then(() => {
                        res.json({
                            message: "votre mot de passe est mis à jour",
                        });
                    })
                    .catch((err) => {
                        res.json(err);
                    });
            } else {
                res.json("link not validé");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});


// supprimer un utilisateur
// Supprimer un utilisateur
router.delete("/delete/:id", (req, res) => {
    db.users
        .destroy({
            where: { id: req.params.id }
        })
        .then(() => {
            res.json({ message: "Utilisateur supprimé avec succès" });
        })
        .catch(err => {
            res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
        });
});



module.exports = router;