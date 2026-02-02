type KeyMapEntry = { sc: string; vk: string }

export const baseKeyMap: KeyMapEntry[][] = (() => {
  const map: KeyMapEntry[][] = [
    [
      { sc: "29", vk: "OEM_3" },
      { sc: "02", vk: "1" },
      { sc: "03", vk: "2" },
      { sc: "04", vk: "3" },
      { sc: "05", vk: "4" },
      { sc: "06", vk: "5" },
      { sc: "07", vk: "6" },
      { sc: "08", vk: "7" },
      { sc: "09", vk: "8" },
      { sc: "0a", vk: "9" },
      { sc: "0b", vk: "0" },
      { sc: "0c", vk: "OEM_MINUS" },
      { sc: "0d", vk: "OEM_PLUS" },
    ],
    [
      { sc: "10", vk: "Q" },
      { sc: "11", vk: "W" },
      { sc: "12", vk: "E" },
      { sc: "13", vk: "R" },
      { sc: "14", vk: "T" },
      { sc: "15", vk: "Y" },
      { sc: "16", vk: "U" },
      { sc: "17", vk: "I" },
      { sc: "18", vk: "O" },
      { sc: "19", vk: "P" },
      { sc: "1a", vk: "OEM_4" },
      { sc: "1b", vk: "OEM_6" },
      { sc: "2b", vk: "OEM_5" },
    ],
    [
      { sc: "1e", vk: "A" },
      { sc: "1f", vk: "S" },
      { sc: "20", vk: "D" },
      { sc: "21", vk: "F" },
      { sc: "22", vk: "G" },
      { sc: "23", vk: "H" },
      { sc: "24", vk: "J" },
      { sc: "25", vk: "K" },
      { sc: "26", vk: "L" },
      { sc: "27", vk: "OEM_1" },
      { sc: "28", vk: "OEM_7" },
    ],
    [
      { sc: "2c", vk: "Z" },
      { sc: "2d", vk: "X" },
      { sc: "2e", vk: "C" },
      { sc: "2f", vk: "V" },
      { sc: "30", vk: "B" },
      { sc: "31", vk: "N" },
      { sc: "32", vk: "M" },
      { sc: "33", vk: "OEM_COMMA" },
      { sc: "34", vk: "OEM_PERIOD" },
      { sc: "35", vk: "OEM_2" },
    ],
  ]

  const seen = new Set<string>()
  const duplicates: string[] = []
  map.flat().forEach(({ vk }) => {
    if (seen.has(vk)) {
      duplicates.push(vk)
    } else {
      seen.add(vk)
    }
  })
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate VK entries in baseKeyMap: ${[...new Set(duplicates)].join(
        ", ",
      )}`,
    )
  }

  return map
})()
