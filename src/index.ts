import { createHash } from "crypto"
import { readdirSync } from "fs"
import { join } from "path"
import { cwd } from "process"

import { mkdir, readFile, writeFile } from "./utils/fileSystem"

const DATA_DIR = join(cwd(), "data/MiHoYoBinData")
const Scene_EXPORT_DIR = join(cwd(), "Scripts/Scene")
const Quest_Share_EXPORT_DIR = join(cwd(), "Scripts/Quest/Share")
const Quest_Client_EXPORT_DIR = join(cwd(), "Scripts/Quest/Client")

let mappingCount = 0

async function mapFiles() {
  const files = readdirSync(DATA_DIR)
  await mkdir(Scene_EXPORT_DIR, { recursive: true })
  await mkdir(Quest_Share_EXPORT_DIR, { recursive: true })
  await mkdir(Quest_Client_EXPORT_DIR, { recursive: true })

  for (let i = 0; i < 100000; i++) {
    const scenePath = `Lua/Scene/${i}/scene${i}.lua.MiHoYoBinData`
    const sceneDummyPointPath = `Lua/Scene/${i}/scene${i}_dummy_points.lua.MiHoYoBinData`
    const questShareConfig = `Lua/Quest/Share/Q${i}ShareConfig.lua.MiHoYoBinData`
    const questClientConfig = `Lua/Quest/Client/Q${i}ClientConfig.lua.MiHoYoBinData`

    const sceneHash = getPathHash(scenePath)
    const sceneDummyPointHash = getPathHash(sceneDummyPointPath)
    const questShareConfigHash = getPathHash(questShareConfig)
    const questClientConfigHash = getPathHash(questClientConfig)

    const sceneFileName = `${sceneHash.slice(0, 8)}.lua`
    const sceneDummyPointFileName = `${sceneDummyPointHash.slice(0, 8)}.lua`
    const questShareConfigFileName = `${questShareConfigHash.slice(0, 8)}.lua`
    const questClientConfigFileName = `${questClientConfigHash.slice(0, 8)}.lua`

    if (files.includes(sceneDummyPointFileName)) {
      mappingCount++
      console.log(`Mapping Scene Dummy Point: ${i}`)
      const data = await readFile(join(DATA_DIR, sceneDummyPointFileName))

      await mkdir(join(Scene_EXPORT_DIR, i.toString()), { recursive: true })
      await writeFile(join(Scene_EXPORT_DIR, i.toString(), `scene${i}_dummy_points.lua`), data.toString())
    }
    if (files.includes(sceneFileName)) {
      mappingCount++

      console.log(`Mapping Scene: ${i}`)
      const data = await readFile(join(DATA_DIR, sceneFileName))

      await mkdir(join(Scene_EXPORT_DIR, i.toString()), { recursive: true })

      await writeFile(join(Scene_EXPORT_DIR, i.toString(), `scene${i}.lua`), data.toString())
    }

    if (files.includes(questShareConfigFileName)) {
      mappingCount++

      console.log(`Mapping QuestShareConfig: ${i}`)
      const data = await readFile(join(DATA_DIR, questShareConfigFileName))
      await writeFile(join(Quest_Share_EXPORT_DIR, `Q${i}ShareConfig.lua`), data.toString())
    }

    if (files.includes(questClientConfigFileName)) {
      mappingCount++

      console.log(`Mapping QuestClientConfig: ${i}`)
      const data = await readFile(join(DATA_DIR, questClientConfigFileName))
      await writeFile(join(Quest_Client_EXPORT_DIR, `Q${i}ClientConfig.lua`), data.toString())
    }
  }
}

function getPathHash(path: string, s = 5): string {
  const l = 256 * 2 ** Math.floor(path.length / 256)
  const hash = createHash("md5")
  hash.update(path)
  hash.update(Buffer.alloc(l - path.length, 0))
  return hash.digest().slice(0, s).reverse().toString("hex")
}

;(async () => {
  console.log("Mapping files...")
  await mapFiles()
  console.log(`Mapping ${mappingCount} files`)
})()
