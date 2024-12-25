async function example() {
  const result = await Promise.resolve(42)
  console.log(result)
}
example()
