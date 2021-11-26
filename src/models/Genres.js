const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Genres', {
    // id:{
    //   type: Datatypes.UUIDV4,
    //   defaultValue: Datatypes.UUIDV4,
    //   allowNull:false,
    //   primaryKey:true,
    // },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // games:{
      //   type: DataTypes.ARRAY(DataTypes.STRING),
      // }
  });
};