import jsdom from 'jsdom';
import marked from 'marked';

export default {
  /**
   * 分析文本并且返回markdown预览内容
   * 内容优先级： p > h2 > li
   */
  parsePreview: (content: string): string => {
    const dom = new jsdom.JSDOM(marked(content))
    const domP = dom.window.document.querySelector("p")
    if (domP && domP.textContent) {
      return domP.textContent
    }

    const domH2 = dom.window.document.querySelector("h2")
    if (domH2 && domH2.textContent) {
      return domH2.textContent
    }

    const domLi = dom.window.document.querySelector('li')
    if (domLi && domLi.textContent) {
      return domLi.textContent
    }

    return ""
  }
}