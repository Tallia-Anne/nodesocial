// exporte table with all field
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "Postes", {
        id: {
            type: Sequelize.DataTypes.INTEGER,

            primaryKey: true,

            autoIncrement: true,
        },
        Status: {
            type: Sequelize.DataTypes.BOOLEAN,

            allowNull: true,
        },
        nom: {
            type: Sequelize.DataTypes.STRING(75),
        },

        ref: {
            type: Sequelize.DataTypes.STRING(75),
        },
       
       
        description: {
            type: Sequelize.DataTypes.TEXT,
        },
       
    }, {
        timestamps: true,

        underscored: true,
    }
    );
};