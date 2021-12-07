

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