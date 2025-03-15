import fs from "node:fs";
import { program } from "commander";

type ImageDetails = { z; filename: string; original: string; thumb: string };

let contrato = "";
let eventos: string[] = [];

program.requiredOption("-c, --contrato <contrato>", "contract id");
program.requiredOption("-e, --eventos <eventos...>", "event ids");
program.parse();
const options = program.opts();

contrato = options.contrato as string;
eventos = options.eventos as string[];

await Promise.allSettled(eventos.map(downloadEvent));

console.log("Download complete");

async function downloadEvent(evento: string) {
  const response = await fetch(
    "https://formando.difoccus.com.br/api/fotos/api/Api.php",
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
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
    body: null,
    method: "GET",
  });

  const buffer = await imgResponse.arrayBuffer();

  // save to fs
  fs.writeFileSync(`${folder}/${image.filename}.jpg`, Buffer.from(buffer));
}
