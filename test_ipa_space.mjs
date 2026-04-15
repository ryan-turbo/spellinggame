// 验证 IPA 空格分割

const phonetic = '/wɒtʃ ə ˌdiːviːˈdiː/'
const ipaParts = phonetic.replace(/[\[\]\/]/g, '').split(/\s+/)
console.log('原 IPA:', phonetic)
console.log('分割结果:', ipaParts)
console.log('分割数:', ipaParts.length)

console.log('\n问题分析:')
console.log('  watch → "wɒtʃ" ✓')
console.log('  a → "ə" ✓')
console.log('  DVD → "ˌdiːviːˈdiː" ← 这里没有空格！')

console.log('\n期望的 IPA 格式:')
console.log('  /wɒtʃ ə ˌdiː viː ˈdiː/')
console.log('  或: /wɒtʃ ə d iː v iː d iː/')
