process.env.GOOGLE_APPLICATION_CREDENTIALS = './translation-script.json';

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import i18next from 'i18next';
import BackEnd from 'i18next-node-fs-backend';
import { handle, missingKeyHandler, LanguageDetector } from 'i18next-express-middleware';
import path from 'path';
import cors from 'cors';
const {Translate} = require('@google-cloud/translate');

const PORT = process.env.PORT || 3001;
const app = express();
const translate = new Translate({projectId: 'translation-scri-1569064424877'});

i18next
  .use(BackEnd)
  .use(LanguageDetector)
  .init({
    backend: {
      addPath: path.resolve(__dirname, '../../locales/{{lng}}/index.json')
    },
    fallbackLng: 'en',
    saveMissing: true,
    debug: false,
    lng: 'en',
    keySeparator: false, // we do not use keys in form messages.welcome
    nsSeparator: '|'
  });

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(morgan('dev'));
app.use(handle(i18next));

app.post('/locales/add/:lng/:ns', missingKeyHandler(i18next));

app.post('/translate', (req, res) => {
    const { text } = req.body;

    translate.translate(text, 'uk')
        .then(response => {
            const [translation] = response;

            console.error('translation', translation);

            res.json({ translation });
        })
        .catch(error => {
            console.error('error', error);
            res.send('something went wrong');
        });
});



app.listen(PORT, error => {
  if (error) {
    console.error(`Error: ${error}`);
  }

  console.log(`Server listening on port ${PORT}`);
});
