/**
 * Throttle requests by limiting the number of concurrent operations
 * @param datas The data array to process in parallel
 * @param callback The callback to process each item
 * @param maxConcurrent Maximum number of concurrent operations
 */
export async function throttleRequests<T>(datas: T[], callback: (data: T) => unknown | Promise<unknown>, maxConcurrent = 10) {
  const promises = [];
  let index = 0;

  // Process each item recursively
  async function next() {
    if (index >= datas.length) return;
    const currentIndex = index++;
    await callback(datas[currentIndex]);
    return next();
  }

  // Start the initial batch with max concurrency
  for (let i = 0; i < maxConcurrent; i++) {
    promises.push(next());
  }

  await Promise.all(promises);
}
