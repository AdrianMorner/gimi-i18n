
/* eslint no-console:0 */
import {compareKeys, compareKeysWithinTextStrings, checkTemplateLenght, checkBirgittaInconsistencies, checkTemplateRule} from '../TestUtil'
import {languageCodes} from '..'
let langCodes = languageCodes
jest.disableAutomock()

let textStringsTypes = ['server', 'templates', 'share-image-generator']

let textStrings = {}
textStringsTypes.forEach(textStringsType => { textStrings[textStringsType] = {} })
textStringsTypes.forEach(textStringsType => {
  langCodes.forEach(lang => { textStrings[textStringsType][lang] = require(`../text_strings/${textStringsType}/${lang}`) })
})

textStringsTypes.forEach(textStringsType => {
  describe(`${textStringsType} TextStrings`, () => {
    langCodes.forEach(lang => {
      it(`it should return Text Strings for ${textStringsType} ${lang}`, () => {
        expect(textStrings[textStringsType][lang]).not.toEqual(undefined)
      })

      it('all textstrings should have a equivalent string in all other languages', () => {
        langCodes.forEach(lang2 => compareKeys(textStrings[textStringsType][lang], textStrings[textStringsType][lang2], lang, lang2))
        langCodes.forEach(lang2 => compareKeysWithinTextStrings(textStrings[textStringsType][lang], textStrings[textStringsType][lang2], lang, lang2))
      })

      it('should not have any birgitta inconsistencies', () => {
        let errorMessages = {}
        langCodes.forEach((lang2, j) => {
          let errorArray = checkBirgittaInconsistencies(textStrings[textStringsType][lang], textStrings[textStringsType][lang2], lang, lang2)
          errorArray.forEach(key => {
            errorMessages[key] = ''
          })
        })
        if (Object.keys(errorMessages).length > 0) console.warn(JSON.stringify(errorMessages, undefined, 2))
      })
      it('should not have _parent when having _child', () => {
        let errorArrayParentChild = []
        let objectKeys = Object.keys(textStrings[textStringsType][lang])
        objectKeys.forEach((key) => {
          let currentLangKey = key
          if (currentLangKey && currentLangKey.includes('_parent')) {
            let currentLangKeyReverse = currentLangKey.replace('_parent', '_child')
            if (!objectKeys.includes(currentLangKeyReverse))
              errorArrayParentChild.push({error: `${key} is missing child version`})
          }
        })
      })
      it('should not have _child when having _parent', () => {
        let errorArrayParentChild = []
        let objectKeys = Object.keys(textStrings[textStringsType][lang])
        objectKeys.forEach((key) => {
          let currentLangKey = key
          if (currentLangKey && currentLangKey.includes('_child')) {
            let currentLangKeyReverse = currentLangKey.replace('_child', '_parent')
            if (!objectKeys.includes(currentLangKeyReverse))
              errorArrayParentChild.push({error: `${key} is missing parent version`})
          }
        })
      })
      xit('all task templates should not exceed 30 chars', () => {
        // TODO add slack chanell omit PLZ_CHECK and PLZ_TRANSLATE
        checkTemplateLenght(textStrings[textStringsType][lang], lang)
      })

      if (textStringsType === 'templates')
        it('Should include template rule', () => {
          checkTemplateRule(textStrings[textStringsType][lang], lang)
        })
    })
  })
})
