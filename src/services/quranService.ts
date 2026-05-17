interface QuranAyah {
  number: number
  text: string
  numberInSurah: number

  surah: {
    number: number
    englishName: string
    name: string
  }
}

interface QuranPageResponse {
  page: number

  ayahs: QuranAyah[]

  surahs: string[]
}

export async function getPage(
  page: number
): Promise<QuranPageResponse> {
  const res = await fetch(
    `https://api.alquran.cloud/v1/page/${page}/quran-simple`
  )

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Quran page ${page}`
    )
  }

  const json = await res.json()

  const data = json.data

  // Extract unique surah names
  const surahSet = new Set<string>()

  data.ayahs.forEach((ayah: QuranAyah) => {
    surahSet.add(ayah.surah.englishName)
  })

  return {
    page: data.number,

    ayahs: data.ayahs.map((ayah: QuranAyah) => ({
      number: ayah.number,
      text: ayah.text,
      numberInSurah: ayah.numberInSurah,
      surah: {
        number: ayah.surah.number,
        englishName: ayah.surah.englishName,
        name: ayah.surah.name
      }
    })),

    surahs: Array.from(surahSet)
  }
}