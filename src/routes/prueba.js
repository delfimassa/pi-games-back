const getDbInfo = async () => {
    const dbGames = await Videogame.findAll({
      include: {
        model: Genres,
        attributes: ["name"],
        through: { attributes: [] } //no netendi un pedo que hizo ahi
      },
    });
  
    const dbData = dbGames.map(e=>{
      return{
        id: e.id,
        name: e.name,
        rating: e.rating,
        image: e.image,
        createdInDb: e.createdInDb,
        genres: e.genres.map(e=>{e.name})
      }
    })
    return dbData;
  };