export async function asyncMap<T, A>(
  array: T[],
  group: number,
  fct: (e: T, index: number) => Promise<A>,
) {
  const acc: A[][] = [];
  for (let i = 0; i < array.length; i += group) {
    const fcts = array.slice(i, i + group).map(async (elmt, index) => {
      return await fct(elmt, index);
    });
    const res = await Promise.all(fcts);
    acc.push(res);
  }
  return acc.flat();
}
