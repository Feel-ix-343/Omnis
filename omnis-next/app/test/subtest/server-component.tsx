export default async function() {

  // 1 second delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return <>
    Server {new Date().toISOString()}
  </>
}
