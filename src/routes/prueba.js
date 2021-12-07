

  // router.get("/videogames", async (req, res) => {
//   // const name= req.query.name;
//   // let gamesTotal = await getAllVideoGames;
//   // if(name){
//   //   let gameName = await gamesTotal.filter(e=>e.name.toLowerCase().includes(name.toLowerCase()));
//   //   gameName.length?
//   //   res.status(200).send(gameName) :
//   //   res.status(404).send("no esta el juego")
//   // }else{
//   //   res.status(200).send(gamesTotal)
//   // }

//   // if (req.query.name){
//   //   return res.send(await getByName(req.query.name))
//   // }
//   // res.status(200).send(await getAllVideoGames())

  
//   // const name = req.query.name;
//   // let allGames = await getAllVideoGames();
//   // if (name) {
//   //   let videogameName = await allGames.filter((e) =>
//   //     e.name.toLowerCase().includes(name.toLowerCase())
//   //   );
//   //   videogameName.length
//   //     ? res.status(200).send(videogameName)
//   //     : res.status(404).send("Lo sentimos, no encontramos ese videojuego");
//   // } else {
//   //   res.status(200).send(allGames);
//   // }

// ///!!!!!!!!!!!!!!!!!!!!!!!!!
//   const name = req.query.name;
//   let allGames = await getAllVideoGames();

//   if (name) {
//     let dbData = await Videogame.findAll({
//       where: { name: { [Op.iLike]: `%${name}%` } },
//       include: {
//           model: Genres,
//           attributes: ['name'],
//           trough: {
//               attributes: []
//           }
//       }
//   })

//   // let apiData = await axios.get(`https://api.rawg.io/api/games?key=${APIKEY}&page_size=15?search=${name}`) 
//   // let respuesta = dbData.concat(apiData);
//   let respuesta = dbData;
//   res.send(respuesta)
//   } else {
//     res.status(200).send(allGames);
//   }

// });

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