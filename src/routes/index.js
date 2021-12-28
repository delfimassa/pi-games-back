const { Op } = require("sequelize");
const { Router } = require("express");
const axios = require("axios");
const { Videogame, Genres, conn } = require("../db");
const router = Router();
const { APIKEY } = process.env;
// const router = Router();
// GAMES DE LA API
const getApiInfo = async () => {
  const apiInfoGames = [];
  let i = 1;
  while (i <= 5) {
    const apiUrlGames = await axios.get(
      `http://api.rawg.io/api/games?key=${APIKEY}&page=${i}`
      //pasar a usando .next en variable  + promise all llamando variables para optimizar tiempo
    );
    await apiUrlGames.data.results.map((e) => {
      apiInfoGames.push({
        id: e.id,
        name: e.name,
        image: e.background_image,
        rating: e.rating,
        platforms: e.platforms,
        launching: e.released,
        metacritic: e.metacritic,
        genres: e.genres.map((elem) => {
          return {
            name: elem.name,
          };
        }), //es un array con objetos x c/genero
        createdInDb: false,
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
      createdInDb: true,
    };
  });
  return dbData;
};

//TODOS LOS GAMES JUNTOS
const getAllVideoGames = async () => {
  const dbInfo = await getDbInfo();
  const apiInfo = await getApiInfo();
  const allInfo = dbInfo.concat(apiInfo);
  return allInfo;
};

async function getByNameApi(name) {
  try {
    let videogameName = await axios.get(
      `http://api.rawg.io/api/games?search=${name}&key=${APIKEY}`
    );
    let homeData = await videogameName.data.results.map((e) => {
      return {
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
        createdInDb: false,
      };
    });
    return homeData;
  } catch (err) {
    console.log(err);
  }
}

const getByNameDb = async (name) => {
  try {
    const dbGamesByName = await Videogame.findAll({
      where: { name: { [Op.iLike]: `%${name}%` } },
      include: {
        model: Genres,
        attributes: ["name"],
        trough: {
          attributes: [],
        },
      },
    });
    const dbData = dbGamesByName.map((e) => {
      return {
        id: e.id,
        name: e.name,
        image: e.image,
        rating: e.rating,
        platforms: e.platforms,
        launching: e.launching,
        genres: e.Genres,
        createdInDb: true,
      };
    });
    return dbData;
  } catch (err) {
    console.log(err);
  }
};

//TODOS LOS GAMES JUNTOS BY NAME
const getAllVideoGamesByName = async (name) => {
  const dbInfoByName = await getByNameApi(name);
  const apiInfoByName = await getByNameDb(name);
  const allInfoByName = dbInfoByName.concat(apiInfoByName);
  return allInfoByName;
};

//////////////////GET VIDEOGAMES AND VG BY NAME//////////////////
router.get("/videogames", async (req, res) => {
  const { name } = req.query;
  let allGames = await getAllVideoGames();
  if (name) {
    let resultsByName = await getAllVideoGamesByName(name);
    resultsByName.length ? res.send(resultsByName) : res.send("not found");
    // let videogameName = await allGames.filter((e) =>
    //   e.name.toLowerCase().includes(name.toLowerCase())
    // );
    // videogameName.length
    //   ? res.send(videogameName)
    //   : res.send("not found");
  } else {
    res.send(allGames);
  }
});

////////////////GET GENRES/////////////////////
router.get("/genres", async (req, res) => {
  const genresApi = await axios.get(
    `https://api.rawg.io/api/genres?key=${APIKEY}`
  );
  const genres = await genresApi.data.results.map((g) => {
    return [g.name];
  }); //array de arraycitos [["Actions"], ["Adventure"]]
  const eachGenre = genres.map((g) => {
    for (let i = 0; i < genres.length; i++) return g[i];
  }); //ahora si tengo un array de nombres ["Actions", "Adventure"]
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
    let {
      name,
      description,
      launching,
      rating,
      platforms,
      image,
      genres,
      createdInDb,
    } = req.body;
    console.log(req.body);
    let gameCreated = await Videogame.create({
      name,
      description,
      launching,
      rating,
      platforms,
      image,
      createdInDb,
    });
    let genreDb = await Genres.findAll({ where: { name: genres } }); //name de tabla genre
    gameCreated.addGenres(genreDb);
    res.json({ message: "videogame creado con exito", gameCreated });
  } catch (error) {
    res.send(error);
  }
});

///////////////GET VIDEOGAME BY ID//////////////////
async function getGameIdApi(id) {
  try {
    let game = await axios.get(
      `https://api.rawg.io/api/games/${id}?key=1f02d81818664102a6fa63065e5be1ab`
    );
    return {
      name: game.data.name,
      id: game.data.id,
      rating: game.data.rating,
      description: game.data.description,
      released: game.data.released,
      genres: game.data.genres
        ? game.data.genres
        : "No disponemos del genero de este juego",
      // .map(genre => genre.name) : "No disponemos del genero de este juego",
      img: game.data.background_image,
      platforms: game.data.platforms
        ? game.data.platforms.map((plataforma) => plataforma.platform.name)
        : "No disponemos de las plataformas de este juego",
      stores: game.data.stores
        ? game.data.stores.map((store) => store.store.name)
        : "No disponemos los stores de este juego",
    };
  } catch (err) {
    return [];
  }
}

router.get("/videogames/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (id.length > 7) {
      let gamePk = await Videogame.findOne({
        where: { id: id },
        include: {
          model: Genres,
          attributes: ["name"],
          through: {
            attributes: [],
          },
        },
      });
      if (gamePk) res.status(200).json(gamePk);
    } else {
      let gameapi = await getGameIdApi(id);
      if (gameapi) res.status(200).send(gameapi);
    }
  } catch (err) {
    res.status(404).send("GAME NOT FOUND");
  }
});

module.exports = router;
