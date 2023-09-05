const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { Op } = require("sequelize");

// Ecrire un commentaire
router.post("/new/:postesId/:userId", async (req, res) => {
    try {
        const { userId, postesId } = req.params;
        const { comments, description } = req.body;

        // Recherche de l'utilisateur par son ID
        const user = await db.users.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        const newComment = await db.comments.create({
            commentaire: comments,
            description: description,
            postesId: postesId,
            userId: userId,
        });

        res.status(200).json({
            commentaire: newComment,
            user: user, // Utilisation du nom de l'utilisateur existant
            message: "Commentaire ajouté avec succès."
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment' });
    }
});



// Cette route permet d'afficher tous les commentaires
router.get("/all", async (req, res) => {
    try {
        // Rechercher tous les commentaires dans la base de données
        const comments = await db.comments.findAll();

        res.status(200).json({ commentaires: comments });
    } catch (error) {
        console.error('Error fetching all comments:', error);
        res.status(500).json({ error: 'Error fetching all comments' });
    }
});

// tous les commentaires pour un utilisateurs
router.get("/mycomments/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Rechercher tous les commentaires associés à l'utilisateur donné
        const userComments = await db.comments.findAll({
            where: {
                userId: userId,
            },
        });

        res.status(200).json({ commentaires: userComments });
    } catch (error) {
        console.error('Error fetching user comments:', error);
        res.status(500).json({ error: 'Error fetching user comments' });
    }
});

// Cette route permet de supprimer un commentaire
router.delete("/delete/:commentId", async (req, res) => {
    try {
        const commentId = req.params.commentId;

        // Supprimer le commentaire de la base de données
        const deletedComment = await db.comments.destroy({
            where: {
                id: commentId,
            },
        });

        if (deletedComment) {
            res.status(200).json({ message: "Le commentaire a été supprimé avec succès." });
        } else {
            res.status(404).json({ error: "Le commentaire avec l'ID spécifié n'a pas été trouvé." });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment' });
    }
});

// Cette route permet de modifier un commentaire
router.put("/update/:commentId", async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comments, description } = req.body;

        // Rechercher le commentaire à mettre à jour
        const commentToUpdate = await db.comments.findOne({
            where: {
                id: commentId
            }
        });

        if (!commentToUpdate) {
            return res.status(404).json({ error: "Le commentaire avec l'ID spécifié n'a pas été trouvé." });
        }

        // Mettre à jour les propriétés du commentaire
        commentToUpdate.commentaire = comments;
        commentToUpdate.description = description;

        // Enregistrer les modifications dans la base de données
        await commentToUpdate.save();

        res.status(200).json({ message: "Le commentaire a été mis à jour avec succès.", commentaire: commentToUpdate });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Error updating comment' });
    }
});








module.exports = router;