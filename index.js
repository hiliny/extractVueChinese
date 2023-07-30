import { globSync } from 'glob'
import path from 'path'
import fs from 'fs'
import Readline from 'readline'
import XLSX from 'xlsx'
import moment from 'moment'
import Transformer from './lib/transform.js'

function readProjectFile (cwd = '/Users/hejie/Desktop/workbench/project/bigTest/') {
  const pattern = '**/*.{vue,js}'
  let configOptions = {
    ignore: ['node_modules/**', 'public/**', 'mock/**'],
    cwd
  }
  let allChineseText = [] // 工程中的中文集合
  let fileArrs = globSync(pattern, configOptions)
  fileArrs.forEach(fileNmae => {
    const filePath = path.resolve(configOptions.cwd, fileNmae)
    let sourceCode = fs.readFileSync(filePath, { encoding: 'utf-8'})
    let ztool = new Transformer(filePath, sourceCode)
    ztool.startTransform()
    let chineseText = ztool.getChineseText()
    let tmpChinese = []
    chineseText.forEach(t => {
      if (!allChineseText.some(xt => xt.chinese === t)) {
        tmpChinese.push({ chinese: t, filePath })
      }
    })
    allChineseText.push(...tmpChinese)
  })
  return allChineseText
}

// 把中文词条导出到excel文件中
function exportChineseToExcel (chineseText) {
  let xlsData = [['中文', '文件路径']]
  chineseText.forEach(item => {
    xlsData.push([item.chinese, item.filePath])
  })
  let workbook = XLSX.utils.book_new()
  let worksheet = XLSX.utils.aoa_to_sheet(xlsData)
  worksheet['!cols'] = [{ wch: 50 }, { wch: 100 }]
  XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
  let outPath = path.resolve(path.resolve(), './dist')
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath)
  }
  let outputPath = outPath + `/中文_${moment().format('YYYYMMDD-HHmmSS')}.xlsx`
  XLSX.writeFile(workbook, outputPath)
  console.log(`文件已生成至: ${outputPath}`)
}

// 程序的主入口
function initProject () {
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Vue工程路径: ',(answer) => {
    if (!answer || !fs.existsSync(answer)) {
      console.error('工程路径不存在!')
    } else {
      let allTxt = readProjectFile(answer)
      exportChineseToExcel(allTxt)
    }
    rl.close()
  })
}

initProject()