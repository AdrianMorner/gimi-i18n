
/* eslint no-console:0 */
import {getTextStrings, getText, supportedLanguageCodes, gimiWebLanguageCodes, languageCodes} from '../index'
import {compareKeysForLanguages, findDuplicateJSONKeysInFolders, findDuplicateJSONKeys, compareDollarSigns, checkBirgittaInconsistencies, checkStringLenght} from '../TestUtil'
import fs from 'fs'
import * as path from 'path'

jest.disableAutomock()

describe('TextStrings', () => {
  it('should return Text Strings', () => {
    supportedLanguageCodes.forEach(lang => expect(getTextStrings(lang)).not.toEqual(undefined, 'Cant find TextStrings for: ' + lang))
  })

  it('all textstrings should have a equivalent string in all other languages', () => {
    compareKeysForLanguages(supportedLanguageCodes, getTextStrings, languageCodes)
  })

  it('should not allow duplicate keys in JSON', () => {
    gimiWebLanguageCodes.forEach(lang => {
      let fileText = fs.readFileSync(path.join(__dirname, `../text_strings/gimi-web/${lang}.json`), {encoding: 'utf8'}).split('\n')
      const errors = findDuplicateJSONKeys(fileText, [])
      expect(errors).toEqual([])
    })

    languageCodes.forEach(lang => {
      let fileText = fs.readFileSync(path.join(__dirname, `../text_strings/client/${lang}.json`), {encoding: 'utf8'}).split('\n')
      const errors = findDuplicateJSONKeys(fileText, [])
      expect(errors).toEqual([])
    })
  })

  it('should not have duplicate keys in textStrings', () => {
    findDuplicateJSONKeysInFolders(
      './text_strings/',
      (dir) => dir !== 'ios' && dir !== 'server' && dir !== 'templates' && dir !== 'gimi-web' && dir !== 'gimi-web-redux'
    )
  })

  it('all textstrings should have right amount of $d and $c and $s signs signs', () => {
    supportedLanguageCodes.forEach(lang1 => {
      if (lang1 === 'sv')
        supportedLanguageCodes.forEach(lang2 => {
          if (lang2 === 'en') compareDollarSigns(getTextStrings(lang1), getTextStrings(lang2), lang1, lang2, '$')
        })
    })
    supportedLanguageCodes.forEach(lang1 => {
      if (lang1 === 'sv')
        supportedLanguageCodes.forEach(lang2 => {
          if (lang2 === 'en') compareDollarSigns(getTextStrings(lang1), getTextStrings(lang2), lang1, lang2, '$d')
        })
    })
    supportedLanguageCodes.forEach(lang1 => {
      if (lang1 === 'sv')
        supportedLanguageCodes.forEach(lang2 => {
          if (lang2 === 'en') compareDollarSigns(getTextStrings(lang1), getTextStrings(lang2), lang1, lang2, '$s')
        })
    })
  })

  // Test for including all %1$d, %2$d, %3$d etc..
  // pretty slow test, takes around 8 seconds at the time it was written
  const enTextStrings = getTextStrings('en')
  Object.keys(enTextStrings).forEach(key => {
    supportedLanguageCodes.forEach(compareLang => {
      if (compareLang === 'en') return undefined
      const testingString = getText(key, [], 'capitalize', enTextStrings)
      const variableMatches = testingString.match(/%\d\$d/gm)
      if (!variableMatches || variableMatches.length < 1) return undefined
      const compareString = getText(key, [], 'capitalize', getTextStrings(compareLang))
      return variableMatches.forEach(match => {
        it(key + ' in ' + compareLang + '.json is missing ' + match, () => {
          const includesVariableMatch = compareString.indexOf(match) >= 0
          expect(includesVariableMatch).toEqual(true)
        })
      })
    })
  })

  it('all languages should have english as default', () => {
    expect(getTextStrings('en')).toEqual(getTextStrings(''))
  })

  xit('Text strings should not be more than 20% longer in other languages', () => {
    supportedLanguageCodes.forEach(lang2 => checkStringLenght(getTextStrings('en'), getTextStrings(lang2), 'en', lang2))
  })

  it('should not have any birgitta inconsistencies', () => {
    let errorMessages = {}
    supportedLanguageCodes.forEach((lang1, i) =>
      supportedLanguageCodes.forEach((lang2, j) => {
        let errorArray = checkBirgittaInconsistencies(getTextStrings(lang1), getTextStrings(lang2), lang1, lang2)
        errorArray.forEach(key => {
          errorMessages[key] = ''
        })
      }))
    console.warn(JSON.stringify(errorMessages, undefined, 2))
  })

  it('should not have unclosed brackers', () => {
    let leftSide = 0
    let rightSide = 0
    let error = []
    supportedLanguageCodes.forEach(languageCode => {
      let textString = JSON.stringify(getTextStrings(languageCode))

      leftSide = textString.split('[').length - 1
      rightSide = textString.split(']').length - 1
      if (leftSide !== rightSide)
        error.push(languageCode)
    })
    if (error.lenght > 0) console.warn(error)
    expect(error).toEqual([])
  })

  it('should have valid html tags', () => {
    let errors = []
    supportedLanguageCodes.forEach(languageCode => {
      let textStrings = getTextStrings(languageCode)
      Object.keys(textStrings).forEach((key) => {
        let text = textStrings[key]
        let valid = validateHTMLTag(text)

        if (!valid)
          errors.push(`No valid tags (<b>, </b> etc) in text: ${text}`)
      })
    })
    // console.warn(JSON.stringify(error[0], undefined, 2))
    // if (error.lenght > 0) console.warn(error, undefined, 2)
    expect(JSON.stringify(errors, undefined, 2)).toEqual('[]')
  })
})

it('should be able to validate tag', () => {
  expect(validateHTMLTag('<b>iodfoi')).toEqual(false)
  expect(validateHTMLTag('iodfoi')).toEqual(true)
  expect(validateHTMLTag('iodfoi</b>')).toEqual(false)
  expect(validateHTMLTag('<b>iodfoi< /b>')).toEqual(false)
  expect(validateHTMLTag('<b >iodfoi</b>')).toEqual(false)
  expect(validateHTMLTag('<underline >iodfoi</underline>')).toEqual(false)
  expect(validateHTMLTag('< b>iodfoi</b>')).toEqual(false)
  expect(validateHTMLTag('<b>iodfoi</b>')).toEqual(true)
})

let validateHTMLTag = (testString): boolean => {
  let htmlTagPairs = [
    ['<b>', '</b>'],
    ['<boldGreen>', '</boldGreen>'],
    ['<boldRed>', '</boldRed>'],
    ['<underline>', '</underline>'],
    ['<boldBlueUnderline>', '</boldBlueUnderline>']
  ]

  return !htmlTagPairs.some(pair =>
    pair.some((tag) => testString.includes(tag)) &&
            !pair.every((tag) => testString.includes(tag)))
}
