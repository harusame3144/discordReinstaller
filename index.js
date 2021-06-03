console.log(`
/**
 * Copyright (C) 2020 Sangoon_Is_Noob#1683

 * 이 프로그램은 자유 소프트웨어입니다
 * GNU Affero General Public License의 약관에 따라 게시, 재배포 및 또는 수정 가능
 * 자유 소프트웨어 재단, 라이센스 버전 3

 * 이 프로그램은 유용 할 것이라는 희망으로 배포되었지만
 * 어떠한 보증도 하지 않습니다.
 * 상품성 또는 특정 목적에의 적합성에
 * 대한 묵시적 보증조차 포함하지 않습니다.
 * 자세한 내용은 GNU Affero General Public License를 참조하십시오.

 * 이 프로그램과 함께 GNU Affero General Public License의 사본을 받았어야 합니다.
 * 그렇지 않으면 <http://www.gnu.org/licenses/>를 참조하십시오.
 */

/**
  * Copyright (C) 2020 Sangoon_Is_Noob#1683

  * This program is free software: you can redistribute it and/or modify
  * it under the terms of the GNU Affero General Public License as published
  * by the Free Software Foundation, either version 3 of the License

  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU Affero General Public License for more details.

  * You should have received a copy of the GNU Affero General Public License
  * along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */
`)

process.version = '0.1.7'
const fs = require('fs')
const path = require('path')
const child = require('child_process')
const os = require('os')
const https = require('https')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('Never run Discord again after it is turned off. An error may occur.')
console.log('절대 디스코드가 꺼진 후에는 다시 실행하지 마십시오. 오류가 발생할 수 있습니다.')

questionStart()
function questionStart () {
  rl.question('To Start Reinstall. Please Type Enter If not, Press Ctrl + C', () => {
    reqY()
    function reqY () {
      rl.question('Never run Discord again after it is turned off. An error may occur.\nWhen you confirm, press Y and then press Enter: ', (ans) => {
        if (ans.toLowerCase() === 'y') start()
        else reqY()
      })
    }
  })
}

function getDiscordDownload (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res, err) => {
      if (err) reject(new Error(err))
      resolve(res.headers.location)
    })
  })
}

const deleteFolderRecursive = function (dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file)
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        console.log(`Delete Folder ${curPath}`)
        deleteFolderRecursive(curPath)
      } else { // delete file
        console.log(`Delete File ${curPath}`)
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dirPath)
  }
}

if (fs.existsSync(`./discordreinstaller-${process.version}-tmp`)) {
  deleteFolderRecursive(`./discordreinstaller-${process.version}-tmp`)
}
fs.mkdirSync(`./discordreinstaller-${process.version}-tmp`)

async function start () {
  const question = (rl) => {
    rl.question('To Exit, Type "e" and Enter: ', (ans) => {
      if (ans === 'e') {
        if (fs.existsSync(`./discordreinstaller-${process.version}-tmp`)) {
          deleteFolderRecursive(`./discordreinstaller-${process.version}-tmp`)
        }
        process.exit()
      }
      question(rl)
    })
  }
  if (os.platform() === 'win32') {
    console.log(`Windows (${os.platform()}) detected.`)
  } else {
    console.log(`Sorry, Only supports windows (win32) but your os is ${os.platform()}`)
    question(rl)
  }
  const discordUrls = [{ path: 'stable', version: 'Discord' }, { path: 'canary', version: 'DiscordCanary' }, { path: 'ptb', version: 'DiscordPTB' }]
  const discordDownloadUrls = {}

  for (const item of discordUrls) {
    const result = await getDiscordDownload(`https://discord.com/api/downloads/distributions/app/installers/latest?channel=${item.path}&platform=win`)
    discordDownloadUrls[item.version] = result
    console.log(`Version Info | ${item.version}: ${result.split(/\/(Discord|Setup.exe)/g)[0].split('/').slice(-1)}`)
  }

  const discordProcessArray = ['Discord', 'DiscordCanary', 'DiscordPTB']

  const killedProcesses = []

  console.log('Kill All Discord Processes...')
  for (const im of discordProcessArray) {
    console.log(`Kill Process: ${im}.exe`)
    try {
      child.execSync(`taskkill /F /T /IM ${im}.exe`)
      killedProcesses.push(im)
    } catch {
      console.log(`Failed Kill Process: ${im}.exe, Ignore`)
    }
  }

  const appdataArray = fs.readdirSync(process.env.APPDATA).filter(el => el.toLowerCase().startsWith('discord')).map(el => path.join(process.env.APPDATA, el))
  const localAppdata = fs.readdirSync(process.env.LOCALAPPDATA).filter(el => el.toLowerCase().startsWith('discord')).map(el => path.join(process.env.LOCALAPPDATA, el))

  const dirs = Array.prototype.concat(appdataArray, localAppdata)

  if (killedProcesses.length === 0 && dirs.length !== 0) {
    for (const item of localAppdata) {
      const index = discordProcessArray.findIndex(el => el.toLowerCase() === item.split('Local\\')[1].toLowerCase())
      const name = discordProcessArray[index]
      if (!killedProcesses.includes(name)) killedProcesses.push(name)
    }
  }

  console.log(`[DiscordReinstaller] - Detected Discord Versions\n${killedProcesses.join(', ')}`)
  setTimeout(() => {
    for (const dir of dirs) {
      console.log(`Remove Dir ${dir}`)
      try {
        deleteFolderRecursive(dir)
        console.log(`Successfully Rmdir ${dir}`)
      } catch (e) {
        console.log(e)
        console.log(`Failed Rmdir ${dir}, Ignore`)
      }
    }
    if (killedProcesses.length === 0 && dirs.length === 0) {
      rl.question('No Discord Installed. Will you install discord? (stable) Y/N: ', (ans) => {
        switch (ans.toLowerCase()) {
          case 'y':
            downloadDiscordApp('Discord')
            break
          case 'n':
            console.log('Aborted.')
            question(rl)
            break
        }
      })
    } else {
      for (const name of killedProcesses) {
        downloadDiscordApp(name)
      }
    }
  }, 3000)

  const downloadDiscordApp = (version) => {
    console.log(`Downloading ${version} Installer...`)
    download(discordDownloadUrls[version], `./discordreinstaller-${process.version}-tmp/${version}Installer.exe`).then(() => {
      setTimeout(() => {
        // try {
        console.log(`Installing ${version}...`)
        const spawnedInstallerProcess = child.execFile(path.join(process.cwd(), `./discordreinstaller-${process.version}-tmp/${version}Installer.exe`))
        spawnedInstallerProcess.on('exit', () => {
          console.log(`Finished install ${version}`)
          killedProcesses.shift()
          if (killedProcesses.length === 0) question(rl)
        })
        // } catch (e) {
        // console.error(e)
        spawnedInstallerProcess.on('error', () => {
          console.log(`Failed to install ${version}... re-download ${version}, retrying...`)
          downloadDiscordApp(version)
        })
        // }
      }, 3000)
    })
  }

  function download (url, dest) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest)
      const file = fs.createWriteStream(dest, { flags: 'wx' })

      const request = https.get(url, response => {
        if (response.statusCode === 200) {
          response.pipe(file)
        } else {
          file.close()
          fs.unlink(dest, () => {}) // Delete temp file
          reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`))
        }
      })

      request.on('error', err => {
        file.close()
        fs.unlink(dest, () => {}) // Delete temp file
        reject(err.message)
      })

      file.on('finish', () => {
        resolve()
      })

      file.on('error', err => {
        file.close()

        if (err.code === 'EEXIST') {
          reject(new Error('File already exists'))
        } else {
          fs.unlink(dest, () => {}) // Delete temp file
          reject(err.message)
        }
      })
    })
  }
}
