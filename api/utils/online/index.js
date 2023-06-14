const search = require('./gSearch');
const scrape = require('./scrape');
const getQuery = require('./getQuery');
const extract_article = require('./extract');
const checkAnswer = require('./checkAnswer');
const question2information = require('./sumURL');
const extractUrls = require('./extractUrls');
const url2information = require('./url2information');

module.exports = { search, scrape, getQuery, extract_article, checkAnswer, question2information, extractUrls, url2information };