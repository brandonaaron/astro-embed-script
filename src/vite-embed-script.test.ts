import test from 'node:test'
import assert from 'node:assert'

import { buildCode, getMatchingScript, transform } from './vite-embed-script'

test('getMatchingScript', () => {
  const testStr1 = 'other markup...<script src="testing.js"></script>'
  assert.strictEqual(getMatchingScript(testStr1).next().value, false, 'requires a src attribute with value')

  const testStr2 = 'other markup...<script is:embeded></script>'
  assert.strictEqual(getMatchingScript(testStr2).next().value, false, 'requires a src attribute with value')

  const testStr3 = 'other markup...<script is:embeded src></script>'
  assert.strictEqual(getMatchingScript(testStr3).next().value, false, 'requires a src attribute with value')

  const testStr4 = 'other markup...<script is:embeded src="testing.js"></script>'
  const astroEmbedScriptMatch4 = {
    openingTag: '<script is:embeded src="testing.js">',
    srcAttribute: 'src="testing.js"',
    path: 'testing.js',
    attributes: '',
  }
  const iterator4 = getMatchingScript(testStr4)
  assert.deepEqual(iterator4.next().value, astroEmbedScriptMatch4, 'value match with no extra attributes')

  const testStr5 = 'other markup...<script is:inline is:embeded src="testing.js" data-other-attr data-another="value"></script>'
  const astroEmbedScriptMatch5 = {
    openingTag: '<script is:inline is:embeded src="testing.js" data-other-attr data-another="value">',
    srcAttribute: 'src="testing.js"',
    path: 'testing.js',
    attributes: 'is:inline data-other-attr data-another="value"',
  }
  const iterator5 = getMatchingScript(testStr5)
  assert.deepEqual(iterator5.next().value, astroEmbedScriptMatch5, 'value match with extra attributes')

  const testStr6 = 'other markup...<script is:embeded src="testing1.js"></script><script src="testing2.js"></script><script is:embeded src="testing3.js"></script>...'
  const astroEmbedScriptMatch6_1 = {
    openingTag: '<script is:embeded src="testing1.js">',
    srcAttribute: 'src="testing1.js"',
    path: 'testing1.js',
    attributes: '',
  }
  const astroEmbedScriptMatch6_2 = {
    openingTag: '<script is:embeded src="testing3.js">',
    srcAttribute: 'src="testing3.js"',
    path: 'testing3.js',
    attributes: '',
  }
  const iterator6 = getMatchingScript(testStr6)
  assert.deepEqual(iterator6.next().value, astroEmbedScriptMatch6_1, 'multiple matches 1')
  assert.deepEqual(iterator6.next().value, astroEmbedScriptMatch6_2, 'multiple matches 2')
  assert.deepEqual(iterator6.next().value, false, 'multiple matches 3')
})

test('buildCode', async () => {
  const builtCode = await buildCode('./src/test-fixtures/test-fixture-1.js')
  assert.strictEqual(builtCode, '"use strict";(()=>{var e="fixture 1";})();\\n')
})

test('transform', async () => {
  const testCode = '<head><title>test</title><script is:embeded src="./src/test-fixtures/test-fixture-1.js"></script><script src="testing.js"></script><script>true</script><script data-test="ok" src="./src/test-fixtures/test-fixture-2.js" is:embeded></script></head>'
  const updatedCode = await transform(testCode)
  const expectedCode = '<head><title>test</title><script>"use strict";(()=>{var e="fixture 1";})();\\n</script><script src="testing.js"></script><script>true</script><script data-test="ok">"use strict";(()=>{var e="fixture 2";})();\\n</script></head>'
  assert.strictEqual(updatedCode, expectedCode)
})
