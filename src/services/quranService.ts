interface AyahResponse {
  surah: number
  ayah: number
  arabic: string
  englishName: string
}


export async function getAyah(surah: number, ayah: number): Promise<AyahResponse> {
  const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`)
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ayah ${surah}:${ayah}`)
  }

  const data = await res.json()
  const item = data.data

  return {
    surah,
    ayah,
    arabic: item.text,
    englishName: item.surah.englishName
  }
}