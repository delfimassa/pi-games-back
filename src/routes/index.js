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
      img: e.image,
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
  const apiInfo = await getApiInfo();
  const allInfo = dbInfo.concat(apiInfo);
  return allInfo;
};

async function getByName(name) {
  try {
      let dbData = await Videogame.findAll({
          where: { name: { [Op.like]: `%${name}%` } },
          include: {
              model: Genres,
              attributes: ['name'],
              trough: {
                  attributes: []
              }
          }
      })
      let resultDb=dbData.map(e=>{
          return{
              name: e.name,
              id: e.id,
              rating: e.rating,
              description: e.description,
              img: e.img,
              genres: e.Genres.map(gr=> gr.dataValues.name),
              platforms: e.plataforms,
              launching: e.released || "Release date not available",
              createdInDb : true
          }
      });
      let apiData = await axios.get(`https://api.rawg.io/api/games?key=${APIKEY}&page_size=15&search=${name}`) 
      let resultApi = apiData.data.results.map(e => {
          return {
              name: e.name,
              id: e.id,
              rating: e.rating,
              genres: e.genres.map(g => g.name),
              img: e.background_image,
              platforms: e.platforms == false ? "No disponemos de las plataformas de este juego" : game.platforms.map(plataforma => plataforma.platform.name),
              launching: e.released,
              createdInDb : false
          };
      })
      return [...resultApi, ...resultDb]
  } catch (err) {
      console.log(err)
      return "No results"
  }
}

//////////////////GET VIDEOGAMES//////////////////
router.get("/videogames", async (req, res) => {
  if (req.query.name){
    return res.send(await getByName(req.query.name))
  }
  res.status(200).send(await getAllVideoGames())
  // const name = req.query.name;
  // let allGames = await getAllVideoGames();
  // if (name) {
  //   let videogameName = await allGames.filter((e) =>
  //     e.name.toLowerCase().includes(name.toLowerCase())
  //   );
  //   videogameName.length
  //     ? res.status(200).send(videogameName)
  //     : res.status(404).send("Lo sentimos, no encontramos ese videojuego");
  // } else {
  //   res.status(200).send(allGames);
  // }
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
