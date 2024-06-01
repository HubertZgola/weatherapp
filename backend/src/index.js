const debug = require('debug')('weathermap');
const Dotenv = require('dotenv').config();
const https = require('https');
const fs = require('fs');

const Koa = require('koa');
const router = require('koa-router')();
const fetch = require('node-fetch');
const cors = require('kcors');

const appId = process.env.APPID || console.log("APPID_ERROR");
const mapURI = process.env.MAP_ENDPOINT || 'http://api.openweathermap.org/data/2.5';
const targetCity = process.env.TARGET_CITY || 'Helsinki,fi';

const port = process.env.PORT || '9000';
const app = new Koa();

// Opcje SSL
const sslOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/weatherapp.polandcentral.cloudapp.azure.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/weatherapp.polandcentral.cloudapp.azure.com/fullchain.pem')
};

app.use(cors());

const fetchWeather = async () => {
  const endpoint = `${mapURI}/weather?q=${targetCity}&appid=${appId}&`;
  const response = await fetch(endpoint);

  return response ? response.json() : {}
};

router.get('/api/weather', async ctx => {
  const weatherData = await fetchWeather();
  ctx.type = 'application/json; charset=utf-8';
  ctx.body = weatherData.weather ? weatherData.weather[0] : {};
});

app.use(router.routes());
app.use(router.allowedMethods());

// Otwarcie serwera HTTPS zamiast zwykłego HTTP
https.createServer(sslOptions, app.callback()).listen(port, () => {
  console.log(`App listening on HTTPS port ${port}`);
});
