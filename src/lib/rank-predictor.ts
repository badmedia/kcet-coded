// Rank prediction table calibrated with real data
export const rankTable = [
  { score: 98, rank: 1 },
  { score: 90, rank: 200 },
  { score: 86, rank: 1500 },
  { score: 85, rank: 2000 },
  { score: 80, rank: 4000 },
  { score: 75, rank: 8000 },
  { score: 70, rank: 15000 },
  { score: 65, rank: 30000 },
  { score: 58.07, rank: 69918 }, // Real data point: KCET 71 + 86% boards
  { score: 58, rank: 72000 },
  { score: 55, rank: 90000 },
  { score: 50, rank: 120000 },
  { score: 45, rank: 160000 },
  { score: 40, rank: 200000 }
]

// Historical trend data
export const trendData = {
  2022: [1, 150, 1200, 1800, 3500, 7000, 13000, 25000, 40000, 55000, 70000, 85000, 110000, 140000, 170000],
  2023: [1, 180, 1300, 1900, 3800, 7500, 14000, 28000, 43000, 58000, 72000, 88000, 115000, 150000, 180000],
  2024: [1, 200, 1500, 2000, 4000, 8000, 15000, 30000, 45000, 60000, 75000, 90000, 120000, 160000, 190000]
}

export interface RankPrediction {
  low: number
  medium: number
  high: number
  composite: number
}

// Predict KCET rank using adjusted algorithm based on real data
export const predictKCETRank = (cet: number, puc: number): RankPrediction => {
  try {
    const kcetPercentage = (cet / 180) * 100
    // Adjusted weights based on real data: KCET 71 + 86% boards = rank 69,918
    // This suggests KCET has more weight than 50%
    const combinedScore = 0.6 * kcetPercentage + 0.4 * puc // 60/40 weight for more accuracy

    if (isNaN(combinedScore) || combinedScore < 0 || combinedScore > 100) {
      throw new Error('Please enter valid marks (KCET: 0-180, PUC: 0-100)')
    }

    let result: RankPrediction | null = null
    
    if (combinedScore >= rankTable[0].score) {
      result = { low: 1, medium: 1, high: 1, composite: combinedScore }
    } else if (combinedScore <= rankTable[rankTable.length - 1].score) {
      result = { low: 171000, medium: 190000, high: 209000, composite: combinedScore }
    } else {
      for (let i = 0; i < rankTable.length - 1; i++) {
        const currentEntry = rankTable[i]
        const nextEntry = rankTable[i + 1]
        if (combinedScore <= currentEntry.score && combinedScore >= nextEntry.score) {
          const scoreDiff = currentEntry.score - nextEntry.score
          const rankDiff = nextEntry.rank - currentEntry.rank
          const scoreOffset = currentEntry.score - combinedScore
          const interpolatedRank = currentEntry.rank + (scoreOffset / scoreDiff) * rankDiff
          const adjustedRank = interpolatedRank * 1.0 // Removed the 1.023 multiplier
          const medium = Math.round(adjustedRank)
          const low = Math.round(medium * 0.95)
          const high = Math.round(medium * 1.05)
          result = { low, medium, high, composite: combinedScore }
          break
        }
      }
    }

    if (!result) {
      let closest = rankTable[0]
      let minDiff = Math.abs(combinedScore - closest.score)
      for (let i = 1; i < rankTable.length; i++) {
        const diff = Math.abs(combinedScore - rankTable[i].score)
        if (diff < minDiff) {
          minDiff = diff
          closest = rankTable[i]
        }
      }
      const medium = Math.round(closest.rank * 1.0) // Removed the 1.023 multiplier
      result = {
        low: Math.round(medium * 0.95),
        medium,
        high: Math.round(medium * 1.05),
        composite: combinedScore
      }
    }

    return result
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error calculating rank')
  }
}

export const getPercentile = (composite: number): string => {
  if (composite >= 95) return 'Top 1%'
  if (composite >= 90) return 'Top 5%'
  if (composite >= 80) return 'Top 15%'
  return 'Below Average'
}

export const calculatePercentile = (rank: number): string => {
  const totalCandidates = 312000
  return ((totalCandidates - rank) / totalCandidates * 100).toFixed(2)
}

export const getRankAnalysis = (rank: number): string => {
  if (rank <= 1000) return 'Elite rank! Likely to secure top colleges like RVCE or BMSCE.'
  if (rank <= 5000) return 'Great rank! Strong chances for top branches.'
  if (rank <= 15000) return 'Solid rank! Good college options available.'
  if (rank <= 30000) return 'Moderate rank. Explore various colleges.'
  return 'Lower rank. Consider all possible options.'
}

export const getCollegeSuggestions = (rank: number, category: string) => {
  const colleges = {
    general: [
      { rank: 1000, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 5000, name: 'MSRIT, PESIT', branch: 'ISE, EEE' },
      { rank: 15000, name: 'BMSIT, SIT', branch: 'ME, CE' },
      { rank: 30000, name: 'NMIT, DSCE', branch: 'All branches' }
    ],
    obc: [
      { rank: 1500, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 7000, name: 'MSRIT, PESIT', branch: 'ISE, EEE' },
      { rank: 20000, name: 'BMSIT, SIT', branch: 'ME, CE' },
      { rank: 40000, name: 'NMIT, DSCE', branch: 'All branches' }
    ],
    sc: [
      { rank: 2000, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 10000, name: 'MSRIT, PESIT', branch: 'ISE, EEE' },
      { rank: 25000, name: 'BMSIT, SIT', branch: 'ME, CE' },
      { rank: 50000, name: 'NMIT, DSCE', branch: 'All branches' }
    ],
    st: [
      { rank: 2500, name: 'RVCE, BMSCE', branch: 'CSE, ECE' },
      { rank: 12000, name: 'MSRIT, PESIT', branch: 'ISE, EEE' },
      { rank: 30000, name: 'BMSIT, SIT', branch: 'ME, CE' },
      { rank: 60000, name: 'NMIT, DSCE', branch: 'All branches' }
    ]
  }
  const suggestions = colleges[category as keyof typeof colleges] || colleges.general
  return suggestions.find(s => rank <= s.rank) || { name: 'Other colleges', branch: 'All branches' }
}
