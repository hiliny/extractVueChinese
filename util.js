import { parse as vueParser } from '@vue/compiler-sfc'
import { parse as babelParser } from '@babel/parser'
// 文件类型枚举
const FileTypes = {
  JS: '.js',
  VUE: '.vue',
  JSX: '.jsx',
  TSX: '.tsx',
  TS: '.ts'
}

// 节点类型枚举
const NodeTypes = {
  ROOT: 0,
  ELEMENT: 1,
  TEXT: 2,
  COMMENT: 3,
  SIMPLE_EXPRESSION: 4,
  INTERPOLATION: 5,
  ATTRIBUTE: 6,
  DIRECTIVE: 7,
  COMPOUND_EXPRESSION: 8,
  IF: 9,
  IF_BRANCH: 10,
  FOR: 11,
  TEXT_CALL: 12,
  VNODE_CALL: 13,
  JS_CALL_EXPRESSION: 14,
  JS_OBJECT_EXPRESSION: 15,
  JS_PROPERTY: 16,
  JS_ARRAY_EXPRESSION: 17,
  JS_FUNCTION_EXPRESSION: 18,
  JS_CONDITIONAL_EXPRESSION: 19,
  JS_CACHE_EXPRESSION: 20,
  JS_BLOCK_STATEMENT: 21,
  JS_TEMPLATE_LITERAL: 22,
  JS_IF_STATEMENT: 23,
  JS_ASSIGNMENT_EXPRESSION: 24,
  JS_SEQUENCE_EXPRESSION: 25,
  JS_RETURN_STATEMENT: 26,
}

// 判断是否包含中文
function hasChineseCharacter(code) {
  return code && /[\u{4E00}-\u{9FFF}]/gmu.test(code)
}

function parseVue(code) {
  return vueParser(code).descriptor
}

function parseJS(code) {
  return babelParser(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  })
}

export {
  FileTypes,
  NodeTypes,
  hasChineseCharacter,
  parseVue,
  parseJS
}