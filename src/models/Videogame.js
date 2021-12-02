const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Videogame', {
    id:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey:true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    launching:{
      type:DataTypes.STRING,
    },
    rating:{
      type:DataTypes.INTEGER,
    },
    platforms:{
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull:false,
    },
    image:{
      type: DataTypes.STRING,
      defaultValue:"https://www.google.com/imgres?imgurl=https%3A%2F%2Fmedia.wired.com%2Fphotos%2F603847ccf322ee1eea0074d1%2F4%3A3%2Fw_1800%2Ch_1350%2Cc_limit%2Fwired-games-coding-blackness.jpg&imgrefurl=https%3A%2F%2Fwww.wired.com%2Fstory%2Fblack-character-history-video-games%2F&tbnid=Ffj0_zIYx0QVWM&vet=12ahUKEwimgabW9bP0AhWLOLkGHfmGAOcQMygMegUIARDFAQ..i&docid=tIKwIsgQGIrVOM&w=1800&h=1350&itg=1&q=video%20games&ved=2ahUKEwimgabW9bP0AhWLOLkGHfmGAOcQMygMegUIARDFAQ",
    },
    createdInDb:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });
};
