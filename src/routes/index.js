const { Router } = require("express");
const axios = require("axios");
// const Videogame = require('../models/Videogame');
const { Videogame, Genres, Videogame_genres } = require("../db");
const router = Router();
const { APIKEY } = process.env;

// Configurar los routers
//data es de axios, results de la api

// GAMES DE LA API
const getApiInfo = async () => {
  const apiInfoGames = [];
  let i = 1;
  while (i <= 5) {
    //no trae 100 exactos, correjir
    const apiUrlGames = await axios.get(
      `http://api.rawg.io/api/games?key=${APIKEY}&page=${i}`
    );
    await apiUrlGames.data.results.map((e) => {
      apiInfoGames.push({
        id: e.id,
        name: e.name,
        image: e.background_image,
        genres: e.genres.map((elem) => {
          return {
            name: elem.name,
          };
        }), //es un array con objetos x c/genero
        platforms: e.platforms,
      });
    });
    i++;
  }  return apiInfoGames;
};

//GAMES DE LA DB
const getDbInfo = async () => {
  // return await Videogame.findAll({
  //   include: {
  //     model: Genres,
  //     attributes: ["name"],
  //     through: { attributes: [] }, //no netendi un pedo que hizo ahi
  //   },
  // });

  const dbGames = await Videogame.findAll(
    {
    include: {
      model: Genres,
      attributes: ["name"],
      through: { attributes: [] } //no netendi un pedo que hizo ahi
    }
  }
  );
  const dbData = dbGames.map(e=>{
    return{
      id: e.id,
      name: e.name,
      img: e.image,
      rating: e.rating,
      // genres: e.genres
    }
  })
  return dbData;
};

//TODOS LOS GAMES JUNTOS
const getAllVideoGames = async () => {
  const dbInfo = await getDbInfo();
  const apiInfo = await getApiInfo();
  const allInfo = dbInfo.concat(apiInfo);
  return allInfo;
};

router.get("/videogames", async (req, res) => {
  const name = req.query.name;
  let allGames = await getAllVideoGames();
  if (name) {
    let videogameName = await allGames.filter((e) =>
      e.name.toLowerCase().includes(name.toLowerCase())
    );
    videogameName.length
      ? res.status(200).send(videogameName)
      : res.status(404).send("Lo sentimos, no encontramos ese videojuego");
  } else {
    res.status(200).send(allGames);
  }
});

router.get("/genres", async (req, res) => {
  const genresApi = await axios.get(
    `https://api.rawg.io/api/genres?key=${APIKEY}`
  );
  const genres = await genresApi.data.results.map((g) => {
    return [g.name];
  }); //array de arrays [[action"], ['Adventure']]
  console.log("genressss", genres);
  const eachGenre = genres.map((g) => {
    for (let i = 0; i < genres.length; i++) return g[i];
  }); //ahora si tengo un array de nombres en lugar de array de arrays ["Actions", "adventure"]
  console.log(eachGenre);
  eachGenre.forEach((e) => {
    Genres.findOrCreate({
      where: { name: e }, 
    });
  });
  const allGenres = await Genres.findAll();
  res.send(allGenres);

  // const allGenres = await axios.get(`https://api.rawg.io/api/genres?key=${APIKEY}`);
  //   const genArray = await allGenres.data.results.map(elem => elem.name);
  //   genArray.forEach(elem => {
  //       Genres.findOrCreate({
  //           where: { name: elem }
  //       })
  //   })
  //   console.log("genArray:"+ genArray)
  //   const dbGenres = await Genres.findAll();
  //   console.log("dbGenres" + dbGenres)
  //   res.status(200).send(dbGenres);

});

router.post("/videogame", async (req, res) => {
  let { name, description, launching, rating, platforms, image, genres } =
    req.body;
  let gameCreated = await Videogame.create({
    name,
    description,
    launching,
    rating,
    platforms,
    image,
  });

  let genreDb = await Genres.findAll({ where: { name: genres } });
  gameCreated.addGenres(genreDb);
  res.json({message: "videogame creado con exito", gameCreated});
});

router.get("/videogames/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (id.length > 7) {
      let gamePk = await Videogame.findByPk(id);
      if (gamePk) res.status(200).json(gamePk);
    } else {
      let urlId = await axios.get(
        `https://api.rawg.io/api/games/${id}?key=${APIKEY}`
      );
      let gameId = await urlId.data;
      if (gameId) res.status(200).json(gameId);
    }
  } catch (err) {
    res.status(404).send("GAME NOT FOUND");
  }
});

module.exports = router;
