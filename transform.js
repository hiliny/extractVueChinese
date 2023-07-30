
import path from 'path'
import babelTraverse from '@babel/traverse'
import { hasChineseCharacter, parseJS, parseVue, FileTypes } from './util.js'
class Transformer {
  sourceCode = ''
  filePath = ''
  fileType = ''
  chineseText = []
  constructor (filePath, sourceCode) {
    this.filePath = filePath
    this.sourceCode = sourceCode
    this.fileType = path.extname(this.filePath)
  }
  startTransform () {
    if(!hasChineseCharacter(this.sourceCode)) return []
    if (this.fileType === FileTypes.JS) {
      this.transformJs(this.sourceCode)
    }
    if (this.fileType === FileTypes.VUE) {
      this.transformVue()
    }
  }
  transformJs (sourceCode) {
    console.log(`正在提取: ${this.filePath}`)
    const ast = parseJS(sourceCode, {
      sourceType: 'module',
      plugins: ['jsx']
    })
    const _this = this
    const visitor = {
      StringLiteral: {
        exit: (nodePath) => {
          if (nodePath.node.value && hasChineseCharacter(nodePath.node.value)) {
            _this.chineseText.push(nodePath.node.value)
          }
        }
      },
      TemplateLiteral: {
        exit (nodePath) {
          // console.log('--- 模版字符串 ---')
          let quasis = nodePath.node.quasis ?? []
          let charCode = 109 // 从m的编码往后设置参数
          let str = ''
          quasis.forEach((item, index) => {
            str += item.value.cooked ?? ''
            if (index < quasis.length - 1) {
              str += '{' + String.fromCharCode(charCode) + '}'
              charCode += 1
              if (charCode > 122) charCode = 41
            }
          })
          if (str && hasChineseCharacter(str)) {
            _this.chineseText.push(str)
          }
        }
      },
      JSXText: {
        exit (nodePath) {
          if (nodePath.node.value && hasChineseCharacter(nodePath.node.value)) {
            _this.chineseText.push(nodePath.node.value)
          }
        }
      }
    }
    babelTraverse.default(ast, visitor)
    return ast
  }
  transformVue () {
    let descriptor = parseVue(this.sourceCode)
    if (descriptor.template?.content && hasChineseCharacter(descriptor.template?.content)) {
      this.recursionElementAst(descriptor.template?.ast)
    }
    let scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content
    if (scriptContent && hasChineseCharacter(scriptContent)) {
      this.transformJs(scriptContent)
    }
  }
  recursionElementAst (node) {
    if (!node) return
    let props = node.props ?? []
    props.forEach(prop => {
      let attr = prop.value?.content || prop.exp?.content
      if (attr && hasChineseCharacter(attr)) {
        this.chineseText.push(attr)
      }
    })
    if (node.type === 2 && hasChineseCharacter(node.content)) {
      this.chineseText.push(node.content)
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      node.children.forEach(child => {
        this.recursionElementAst(child)
      })
    }
  }
  getChineseText () {
    return this.chineseText
  }
}

export default Transformer