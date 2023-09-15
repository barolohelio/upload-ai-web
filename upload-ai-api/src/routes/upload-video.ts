import { FastifyInstance } from "fastify";
import {fastifyMultipart} from '@fastify/multipart'
import {randomUUID} from "node:crypto"

import path from "node:path";
import fs from 'node:fs'
import {pipeline} from 'node:stream'
import { promisify } from "node:util";

import { prisma } from "../lib/prisma";

//Configurando pipeline funcione com async await
const pump = promisify(pipeline)

//path, fs, crypto, http e etc...

export async function uploadVideoRoute(app: FastifyInstance){
  app.register(fastifyMultipart, {
   limits: {
    fileSize: 1_048_576 * 25, // 25mb
   }
  })


  app.post('/videos', async (request, reply) => {
    const data = await request.file()

    if(!data){
      return reply.status(400).send({error: 'Ta faltando o arquivo zé!'})
    }

    const extension = path.extname(data.filename)

    if(extension != '.mp3'){
      return reply.status(400).send({error: 'Tipo de arquivo inválido, por favor faça upload de MP3.'})
    }

    const fileBaseName = path.basename(data.filename, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}-${extension}`

    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination))
  })
}