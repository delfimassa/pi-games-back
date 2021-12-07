const { Op } = require("sequelize");
const { Router } = require("express");
const axios = require("axios");
const { Videogame, Genres, conn } = require("../db");
const router = Router();
const { APIKEY } = process.env;  

// GAMES DE LA API
const getApiInfo = async () => {
  const apiInfoGames = [];
  let i = 1;
  while (i <= 5) {
    const apiUrlGames = await axios.get(
      `http://api.rawg.io/api/games?key=${APIKEY}&page=${i}`
    );
    await apiUrlGames.data.results.map((e) => {
      apiInfoGames.push({
        id: e.id,
        name: e.name,
        image: e.background_image,
        rating: e.rating,
        platforms: e.platforms,
        launching: e.released,
        genres: e.genres.map((elem) => {
          return {
            name: elem.name,
          };
        }), //es un array con objetos x c/genero
        createdInDb: false
      });
    });
    i++;
  }
  return apiInfoGames;
};

//GAMES DE LA DB
const getDbInfo = async () => {
  const dbGames = await Videogame.findAll({
    include: {
      model: Genres,
      attributes: ["name"],
      through: { attributes: [] }, 
    },
  });
  const dbData = dbGames.map((e) => {
    return {
      id: e.id,
      name: e.name,
      image: e.image,
      rating: e.rating,
      platforms: e.platforms,
      launching: e.launching,
      genres: e.Genres,
      createdInDb: true
    };
  });
  return dbData;
};

//TODOS LOS GAMES JUNTOS
const getAllVideoGames = async () => {
  const dbInfo = await getDbInfo();
  // const apiInfo = await getApiInfo();
  // const allInfo = dbInfo.concat(apiInfo);
  // return allInfo;
  return dbInfo;
};

const getByName = async (name) => {
  try {
    let dataDB = await Videogame.findAll({
      where: {
        name: { [Op.iLike]: "%" + name + "%" },
      },
      include: Genres,
    });
    console.log("datadbd", dataDB);
    let ordered = dataDB.map(e=>{
      return {
        id: e.id,
        name: e.name,
        image: e.image,
        rating: e.rating,
        platforms: e.platforms,
        launching: e.launching,
        genres: e.Genres,
        createdInDb: true
      };
    } );
     return ordered;
  } catch (error) {
  return "Videogame not found" ;
  }
};

//////////////////GET VIDEOGAMES AND VG BY NAME//////////////////
router.get("/videogames", async (req, res) => {
  const { name } = req.query;
  let AllVideogames = await getAllVideoGames();

  if (name) {
    let videojuegoByQuery = await getByName(name);

    videojuegoByQuery.length
      ? res.status(200).send(videojuegoByQuery)
      : res.status(404).send("Videogame not found");
  } else {
    res.send(AllVideogames);
  }
});


////////////////GET GENRES/////////////////////
router.get("/genres", async (req, res) => {
  const genresApi = await axios.get(
    `https://api.rawg.io/api/genres?key=${APIKEY}`
  );
  const genres = await genresApi.data.results.map((g) => {
    return [g.name];
  }); //array de arrays [["Actions"], ["Adventure"]]
  // console.log("genressss", genres);
  const eachGenre = genres.map((g) => {
    for (let i = 0; i < genres.length; i++) return g[i];
  }); //ahora si tengo un array de nombres ["Actions", "Adventure"]
  // console.log(eachGenre);
  eachGenre.forEach((e) => {
    Genres.findOrCreate({
      where: { name: e },
    });
  });
  const allGenres = await Genres.findAll();
  res.status(200).send(allGenres);

});

////////////////GET PLATFORMS ///////////////////
// axios.get("/platforms", async(req, res)=>{
//   let platforms= await axios.get(`https://api.rawg.io/api/platforms?key=${APIKEY}`)
//   platforms= platforms.data.results.map(pf => pf.name)
//   res.status(200).send(platforms)
// })

////////////////POST VIDEOGAME/////////////////////
router.post("/videogame", async (req, res) => {
  try {
    let { name, description, launching, rating, platforms, image, genres, createdInDb } =
      req.body;
    let gameCreated = await Videogame.create({
      name,
      description,
      launching,
      rating,
      platforms,
      image,
      createdInDb
    });
    console.log("genres req.body", genres);
    await gameCreated.addGenres(genres);
    console.log("gameCreated", gameCreated);
    res.json({ message: "videogame creado con exito", gameCreated });
  } catch (error) {
    res.send(error);
  }
});

///////////////GET VIDEOGAME BY ID//////////////////
router.get("/videogames/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (id.length > 7) {
      let gamePk = await Videogame.findOne({
        where: {id: id},
        include:{
          model: Genres,
          attributes: ["name"],
          through:{
            attributes:[]
          }
        }
      });
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
