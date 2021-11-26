const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
// const Videogame = require('../models/Videogame');
const {Videogame, Genres, Videogame_genres} = require('../db');
const router = Router();
const {APIKEY} = process.env;

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
//data es de axios, results de la api


// GAMES DE LA API
const getApiInfo = async() =>{
    const apiUrlGames = await axios.get(`http://api.rawg.io/api/games?key=${APIKEY}`);
    const apiInfoGames = await apiUrlGames.data.results.map(e=>{
        //iterar sobre cada game haciendo un get/id para traer la decritption
        return{
            id: e.id,
            name: e.name,
            image:e.background_image,
            genres: e.genres, //es un array con objetos x c/genero
            platforms: e.platforms
        } 
    });
    return apiInfoGames;
}
//GAMES DE LA DB
const getDbInfo = async() =>{
    return await Videogame.findAll({
        include:{
            model: Genres,
            attributes: ['name'],
            through: {attributes:[],}, //no netendi un pedo que hizo ahi
        }
    })
}

//TODOS LOS GAMES JUNTOS
const getAllVideoGames = async()=>{
    const apiInfo = await getApiInfo();
    const dbInfo = await getDbInfo();
    const allInfo = apiInfo.concat(dbInfo);
    return allInfo;
}

router.get('/videogames', async(req, res)=>{
    const name = req.query.name;
    let allGames = await getAllVideoGames();
    if (name){
        let videogameName = await allGames.filter(e=>e.name.toLowerCase().includes(name.toLowerCase()));
        videogameName.length ? res.status(200).send(videogameName):res.status(404).send('Lo sentimos, no encontramos ese videojuego')
    }else{
        res.status(200).send(allGames)
    }
});


router.get('/genres', async (req, res) => {
    const genresApi = await axios.get(`https://api.rawg.io/api/genres?key=${APIKEY}`);
    const genres = await genresApi.data.results.map(g => { return [g.name] }); //array de arrays
    console.log('genressss',genres);
    const eachGenre = genres.map(g => {
        for (let i = 0; i < genres.length; i++)  return g[i];
    });  //ahora si tengo un array de nombres en lugar de array de arrays
     console.log(eachGenre);
    eachGenre.forEach(e => {
        //  console.log(eachGenre, 'por aca eachgenre');
        Genres.findOrCreate({
            where: { name: e }//name de tabla genre    y videogame es mi variable del foreach
        })
    })
    const allGenres = await Genres.findAll();
    res.send(allGenres);
})


router.post('/videogame', async(req,res)=>{
    let {
        name,
        description,
        launching,
        rating,
        platforms, 
        image,
        genres,
    } = req.body;
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
    res.send('videogame creado con exito')
});


router.get('/videogames/:id', async (req, res)=>{
    const id = req.params.id;
    try {
        if(id.length > 7) {
            let gamePk = await Videogame.findByPk(id);
            if(gamePk) res.status(200).json(gamePk);
        } else {
            let urlId = await axios.get(`https://api.rawg.io/api/games/${id}?key=${APIKEY}`);
            let gameId = await urlId.data;
            if(gameId) res.status(200).json(gameId)
        }
    } catch(err) {
        res.status(404).send("GAME NOT FOUND");}
    // let videogameId;
    // if (id.length>=7 && typeof id === 'string'){
    //     videogameId = await Videogame.findByPk(id);
    // }else{
    //     if(id){
    //         videogameId = await axios.get(`http://api.rawg.io/api/games/${id}?key=${APIKEY}`)
    //     }
    // } 
    // videogameId.length ? res.status(200).json(videogameId) : res.status(404).send('No se encontro el videojuego');
})

module.exports = router;
