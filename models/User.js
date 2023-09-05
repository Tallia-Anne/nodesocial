module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "User", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nom: {
            type: Sequelize.DataTypes.STRING(45),
            allowNull: true
        },
        prenom: {
            type: Sequelize.DataTypes.STRING(45),
            allowNull: true
            },
         image: {
                //set data type with max length
                type: Sequelize.DataTypes.STRING(60),
                // setting allowNull to false will add NOT NULL to the column, which means an error will be if you add info in this column
                allowNull: true,
            },
        email: {
            type: Sequelize.DataTypes.STRING(255),
            /*ne peut pas être nul et sera unique*/
            allowNull: false,
            unique: true
            },
        
        password: {
            type: Sequelize.DataTypes.STRING(255),
            /*ne peut pas être nul et sera unique*/
            allowNull: false,

        },
        forget: {
            //set data type with max length
            type: Sequelize.DataTypes.STRING(60),
            // setting allowNull to false will add NOT NULL to the column, which means an error will be if you add info in this column
            allowNull: true,
        },
        Status: {
            type: Sequelize.DataTypes.TINYINT(1),
            allowNull: true,
        },
        /*inserer une image (avatar) va covertir en binaire*/
        role: {
            type: Sequelize.DataTypes.STRING(45),
            allowNull: false,
        },

    }, {

        timestamps: true,
        underscored: true
    }
    );
};