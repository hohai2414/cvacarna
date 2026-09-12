export function calculateLifePathNumber(dateString: string): number {
  if (!dateString) return 0
  
  // Format: YYYY-MM-DD
  const cleanDate = dateString.replace(/\D/g, '')
  if (!cleanDate) return 0

  let sum = 0
  for (const char of cleanDate) {
    sum += parseInt(char, 10)
  }

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    let newSum = 0
    const sumStr = sum.toString()
    for (const char of sumStr) {
      newSum += parseInt(char, 10)
    }
    sum = newSum
  }

  return sum
}
