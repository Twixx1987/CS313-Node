const express = require('express');
var parser = require('body-parser');
const path = require('path');
const rateCalc = require('./calculateRate');
const PORT = process.env.PORT || 5000;
const { Client } = require('pg');

const connectionString =
  'postgres://lhrvtbcbhnzcsy:0fc42a830f0df3a7b408e27daee55c72602c3a7cf1661569f88649f9f29d61dd@ec2-50-17-225-140.compute-1.amazonaws.com:5432/d3p017654khhj1';

const db = new Client({
    connectionString: connectionString,
    ssl: true
});

express()
    .use(parser.urlencoded({ extended: false }))
    .use(parser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/mathForm', (req, res) => res.render('pages/mathForm'))
    .get('/rateCalc', (req, res) => res.render('pages/postalRateCalculator', {
        type: null,
        weight: null,
        rate: null
    }))
    .get('/getPerson', (req, res) => {
        const { id } = req.query;

        db.connect().then(() => {
            db.query(`SELECT * FROM person WHERE id = ${id}`).then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(result.rows[0]));
                db.end();
            });
        });
    })
    .post('/math', (req, res) => {
            let equation = req.body.lhs + req.body.operator + req.body.rhs;

            let mathResult = eval(equation);

            res.render('pages/result', {
                result: mathResult
            })
        })
    .post('/math_service', (req, res) => {
        let equation = req.body.lhs + req.body.operator + req.body.rhs;

        let mathResult = eval(equation);

        res.json({ result: mathResult })
    })
    .post('/rateCalc', (req, res) => {
        let type = req.body.type;
        let weight = req.body.weight;
        let rate = rateCalc(type, weight);
        res.render('pages/postalRateCalculator', {
            type: type,
            weight : weight,
            rate: rate
            });
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));





express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getPerson', (req, res) => {
      const { id } = req.query;

      db.connect().then(() => {
          db.query(`SELECT * FROM person WHERE id = ${id}`).then(result => {
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify(result.rows[0]));
              db.end();
          });
      });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));