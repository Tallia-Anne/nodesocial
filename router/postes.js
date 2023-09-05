const Express = require("express"),
    router = Express.Router(),
    { Op } = require("sequelize"),
    db = require("../database/db");

// cette route permet de créer un postes
router.post("/new", (req, res) => {
    //pouvoir le stoker
    let image = req.body.image;

    db.postes
        .findOne({
            // recuperer la reference du postes
            where: { ref: req.body.ref },
        })
        .then((postes) => {
            if (!postes) {
                db.postes
                    .create(req.body)
                    .then((postesitem) => {
                        db.image
                            .create({
                                Status: 1,
                                image: req.body.image,
                                postesId: postesitem.id,
                            })
                            .then((image) => {
                                res.status(200).json({
                                    postesId: postesitem,
                                    image: image,
                                    message: "ok ",
                                });
                            })
                            .catch((err) => {
                                res.json(err);
                            });
                    })
                    .catch((err) => {
                        res.status(400).send("error" + err);
                    });
            } else {
                postes
                    .update({
                        Status: req.body.stock,
                    })
                    .then((rep) => {
                        res.status(200).json({ postes: rep });
                    })
                    .catch((err) => {
                        res.status(403).json("not updated");
                    });
            }
        })
        .catch((err) => {
            res.status(404).json("Not found");
        });
});

// cette route permet d'afficher tous les postes
router.get("/all", (req, res) => {
    db.postes
        .findAll({
            include: [{
                model: db.image,
            },],
            include: [{
                model: db.users,
            },],
        })
        .then((postes) => {
            if (postes) {
                res.status(200).json({
                    postes: postes,
                });
            } else {
                res.status(404).json("il n'a pas de postes");
            }
        })
        .catch((err) => {
            res.json(err);
        });
});

// supprimer un postes avec les images

router.delete("/delete/:id", (req, res) => {
    const postId = req.params.id;

    // Supprimer les images associées au poste
    db.image
        .destroy({
            where: {
                postesId: postId,
            },
        })
        .then(() => {
            // Supprimer le poste lui-même
            return db.postes.destroy({
                where: {
                    id: postId,
                },
            });
        })
        .then((deletedPost) => {
            if (deletedPost) {
                res.status(200).json({
                    message: "Le poste et les images associées ont été supprimés avec succès.",
                });
            } else {
                res.status(404).json({
                    error: "Le poste avec l'ID spécifié n'a pas été trouvé.",
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: "Une erreur s'est produite lors de la suppression du poste.",
            });
        });
});


// modifier un postes
router.put("/update/:id", (req, res) => {
    const postId = req.params.id;

    // Rechercher le poste à mettre à jour
    db.postes.findByPk(postId)
        .then((poste) => {
            if (!poste) {
                return res.status(404).json({ error: "Le poste avec l'ID spécifié n'a pas été trouvé." });
            }

            // Mettre à jour les propriétés du poste
            poste.nom = req.body.nom;
            poste.description = req.body.description;

            // Enregistrer les modifications dans la base de données
            return poste.save();
        })
        .then((updatedPoste) => {
            // Succès : le poste a été mis à jour avec succès
            res.status(200).json({ message: "Le poste a été mis à jour avec succès.", poste: updatedPoste });
        })
        .catch((error) => {
            // Erreur lors de la mise à jour du poste
            res.status(500).json({ error: "Une erreur s'est produite lors de la mise à jour du poste." });
        });
});




router.get("/limit/:limit", (req, res) => {
    db.postes
        .findAll({
            include: [{
                model: db.image,
            },],
            limit: parseInt(req.params.limit),
        })
        .then((postes) => {
            res.status(200).json({ postes: postes });
        })
        .catch((err) => {
            res.status(502).json("bad req" + err);
        });
});

router.get("/all/:limit/:offset", (req, res) => {
    db.postes
        .findAll({
            include: [{
                model: db.image,
            },],
            offset: parseInt(req.params.offset),
            limit: parseInt(req.params.limit),
        })
        .then((reponse) => {
            res.status(200).json({ postes: reponse });
        })
        .catch((err) => {
            res.json(err);
        });
});

// cette route permet d'ajouter une image
router.post("/addimage", (req, res) => {
    var id = req.body.id;
    db.image
        .create({
            image: req.body.image,
            postesId: req.body.id,
        })
        .then(() => {
            db.postes
                .findOne({
                    where: { id: id },
                    include: [{
                        model: db.image,
                    },],
                })
                .then((postes) => {
                    res.status(200).json({
                        postes: postes,
                    });
                })
                .catch((err) => {
                    res.json(err);
                });
        })
        .catch((err) => {
            res.json(err);
        });
});

router.get("/findBy/:nom", (req, res) => {
    db.postes
        .findAll({
            where: {
                nom: {
                    [Op.like]: "%" + req.params.nom,
                },
            },
            include: [{
                model: db.image,
            },],
        })
        .then((postes) => {
            res.status(200).json({ postes: postes });
        })
        .catch((err) => {
            res.json(err);
        });
});

router.get("/getById/:id", (req, res) => {
    db.postes
        .findOne({
            where: { id: req.params.id },
            include: [{
                model: db.image,
            },],
        })
        .then((postes) => {
            res.status(200).json({ postes: postes });
        })
        .catch((err) => {
            res.json(err);
        });
});




router.get("/afficher/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Utilisez Sequelize pour rechercher les postes associés à l'utilisateur donné
        const userPosts = await db.postes.findAll({
            where: {
                userId: userId,
            },
            include: [
                {
                    model: db.image, // Inclure les images associées
                },
            ],
        });

        // Send the retrieved posts as JSON data in the response
        res.status(200).json({ postes: userPosts });
    } catch (error) {
        // If any error occurs, send an error response
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Error fetching user posts' });
    }
});



module.exports = router;