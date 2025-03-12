import fs from "node:fs";
import { program } from "commander";

type ImageDetails = { z; filename: string; original: string; thumb: string };

let session = "notneeeded";
let contrato = "";
let eventos: string[] = [];

program.requiredOption("-c, --contrato <contrato>", "contract id");
program.requiredOption("-e, --eventos <eventos...>", "event ids");
program.parse();
const options = program.opts();

session = options.session;
contrato = options.contrato as string;
eventos = options.eventos as string[];

await Promise.allSettled(eventos.map(downloadEvent));

console.log("Download complete");

async function downloadEvent(evento: string) {
  const response = await fetch(
    "https://formando.difoccus.com.br/api/fotos/api/Api.php",
    {
      headers: {
        accept: "*/*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie: `PHPSESSID=${session}`,
      },
      body: `apiuser=api&apipin=g3r3nc14d0r&action=getfotos&contrato=${contrato}&evento=${evento}`,
      method: "POST",
    }
  );
  const list = (await response.json()) as ImageDetails[];
  // create folder if not exist
  const folder = `./${evento}`;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  for (let i = 0; i < list.length; i++) {
    console.log(
      `Downloading image ${list[i].filename} (${i + 1}/${list.length})`
    );
    await downloadImage(list[i], folder);
  }
}

async function downloadImage(image: ImageDetails, folder: string) {
  const imgResponse = await fetch(image.original, {
    headers: {
      accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/  *,*/*;q=0.8",
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "sec-ch-ua":
        '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "image",
      "sec-fetch-mode": "no-cors",
      "sec-fetch-site": "same-origin",
      cookie: `PHPSESSID=${session}`,
    },
    body: null,
    method: "GET",
  });

  const buffer = await imgResponse.arrayBuffer();

  // save to fs
  fs.writeFileSync(`${folder}/${image.filename}.jpg`, Buffer.from(buffer));
}
