import axios from 'axios';
import util from 'util';
import fs from 'fs';
import path from 'path';

const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);

async function main() {
  const htmlPath = path.join(__dirname, '..', 'tmp', 'page.html');
  const htmlContent = fs.readFileSync(htmlPath, { encoding: 'utf8' });

  const urlRegex =
    /src="(https:\/\/n3ep81xgbj\.execute-api\.us-east-1\.amazonaws\.com\/[^"]*)"/g;

  // Extrair todas as correspondências da expressão regular
  let match: RegExpExecArray | null;
  const urls: string[] = [];

  while ((match = urlRegex.exec(htmlContent)) !== null) {
    urls.push(match[1]);
  }

  for (let i = 0; i < 4; i++) {
    console.log(urls[i]);
  }

  const parsedURLs = urls.map((url) => {
    const replaceSize = url.replace('size=256', 'size=512');
    const removeWaterMark = replaceSize.replace(/&amp;watermarkId=[^&]*/, '');

    return removeWaterMark;
  });

  const imagesDir = path.resolve(__dirname, '..', 'images');
  if (!fs.existsSync(imagesDir)) {
    await mkdirAsync(imagesDir);
  }

  await Promise.all(
    parsedURLs.map(async (url, index) => {
      return axios
        .get(url, { responseType: 'arraybuffer' })
        .then((response) =>
          writeFileAsync(
            path.join(imagesDir, `${index + 1}.jpg`),
            response.data
          )
        )
        .catch((err) =>
          console.error(`Erro ao baixar a imagem ${index + 1}:`, err)
        );
    })
  );
}

console.log('Running...');
main()
  .then(() => console.log('Done!'))
  .catch(console.error);
