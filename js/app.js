const cheerio = require ('cheerio')
const fs = require ('fs');
const { exit } = require('process');
const request = require ('request-promise')

arrayCountryStatic = [
    'Albania',
    'Argentina',
    'Alemania',
    'Bolivia',
    'Brasil',
    'Canada',
    'Chile',
    'Colombia',
    'El Salvador',
    'Espana',
    'Estados Unidos',
    'Francia',
    'Grecia',
    'Honduras',
    'Italia',
    'Mexico',
    'Nicaragua',
    'Panama',
    'Peru',
    'Portugal',
    'Uruguay',
    'Venezuela',
    // 'Andorra',
    // 'Austria',
    // 'Belgica',
    // 'Bosnia y Herzegovina',
    // 'Bulgaria', // no
    // 'Croacia', // no
    // 'Republica Checa',
    // 'Dinamarca', // no
    // 'Finlandia',
    // 'Ciudad del Vaticano',
    // 'Islandia', // no
    // 'Letonia', // no
    // 'Liechtenstein',
    // 'Lituania',
    // 'Luxemburgo',
    // 'Macedonia del Norte',
    // 'Malta',
    // 'Monaco', // no
    // 'Países Bajos', // no
    // 'Noruega', // no
    // 'Polonia', // no
    // 'Rumania', // no
    // 'San Marino',
    // 'Eslovaquia', // no
    // 'Eslovenia', // no
    // 'Suecia', // no
    // 'Suiza', // no
    // 'Reino Unido',
    // 'Montenegro',
    // 'Argelia', // no
    // 'Benin', // no
    // 'Republica del Congo', // no
    // 'Republica Democratica del Congo', // no
    // 'China',
    // 'Corea del Sur',
    // 'Singapur',
    // 'Turquía',
    // 'Australia',
    // 'Nauru',
    // 'Nueva Zelanda'
  ]

arrayCountryStatic.map((pais) => {
    console.log(pais)
})

const getDataCountry =  async () => {
    let data = []
    let url = 'https://es.db-city.com'
    let $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    })
    let content =  await $('.sidecontent .li2 a').each((i, el) => {
        let country = $(el).attr('title')
        data.push(country)
    })
    return await data
}

const getDataStateForCountry = async (country) => {

    let objCountryState = new Object()
    let arrayState = []
    let url = `https://es.db-city.com/${country}`
    let $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    })
    let content =  await $('#block_sub .h2content .td33.otd tbody a').each((index, el) => {
        let state = $(el).attr('title')
        let link = $(el).attr('href')

        arrayState.push({ "index": index, "link": link, "name": state })
    })
    objCountryState.name = country
    objCountryState.state = arrayState

    return await objCountryState
}

const getDataCityForState = async (state) => {
    let arrayCity = []
    let url = `https://es.db-city.com${state}`
    let $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    })
    let content = await $('#block_dir .h2content table tbody tr td a').each((index, el) => {
        if($(el).attr('title')) {
            let city = $(el).attr('title')
            arrayCity.push(city)
        }
    })
    let content2 = await $('#block_bigcity .h2content table tbody tr td a').each((index, el) => {
        if($(el).attr('title')) {
            let city = $(el).attr('title')
            arrayCity.push(city)
        }
    })
    return await arrayCity
}

const getData = async () => {
    let array = []
    let dataForCountry = arrayCountryStatic
    for (let i = 0; i < dataForCountry.length; i++) {
        console.log(`Cargando informacion de ${dataForCountry[i]}`)
        let dataStateForCountry = await getDataStateForCountry(dataForCountry[i])
        for (let o = 0; o < dataStateForCountry.state.length; o++) {
            let stateLink = dataStateForCountry.state[o].link
            console.log(stateLink.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
            let DataCityForState = await getDataCityForState(stateLink.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))

            dataStateForCountry.state[o].city = DataCityForState
            console.log(dataStateForCountry.state[o])
        }
        array.push(dataStateForCountry)
    }
    return await array
}

// getData().then(
//     data => {
//         fs.writeFile('js/data.json', JSON.stringify(data), (err) => {
//             if(err) throw err
//             console.log('=========================')
//             console.log(' Archivo JSON, Guardado!!')
//             console.log('=========================')
//         })
//     }
// )