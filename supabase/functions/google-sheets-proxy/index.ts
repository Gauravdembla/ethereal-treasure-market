import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🔒 SECURE: Credentials are only on the server side
const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔒 SECURE: Fetching data from Google Sheets via edge function')

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      throw new Error('Missing Google Sheets configuration')
    }

    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop()

    let sheetRange = ''
    if (endpoint === 'leaderboard') {
      sheetRange = 'Sheet1!A:H'
    } else if (endpoint === 'stats') {
      sheetRange = 'Stats!A:E'
    } else {
      throw new Error('Invalid endpoint')
    }

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetRange}?key=${GOOGLE_SHEETS_API_KEY}`
    
    console.log(`📊 Fetching ${endpoint} data from: ${sheetRange}`)
    
    const response = await fetch(sheetsUrl)
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`)
    }
    
    const data = await response.json()
    let processedData = data.values || []

    // Process leaderboard data with ranking and shuffling
    if (endpoint === 'leaderboard' && processedData.length > 1) {
      console.log(`🔄 Processing ${processedData.length - 1} leaderboard rows`)
      
      // Skip header row and process data
      const dataRows = processedData.slice(1)
      
      // Transform the data into member objects
      const members = dataRows
        .map((row: string[], index: number) => {
          const name = row[3]?.trim() // Column D (Required)
          const points = parseInt(row[4]) || 0 // Column E (Required)
          const avatarUrl = row[2]?.trim() // Column C (Optional)
          const badges = row[5] ? row[5].split(',').map((badge: string) => badge.trim()) : [] // Column F (Optional)
          const level = row[6]?.trim() || '' // Column G (Optional)
          const weeklyGrowth = parseInt(row[7]) || 0 // Column H (Optional)
          
          // Skip if name is missing (required field)
          if (!name) return null
          
          return {
            id: index + 1,
            name,
            points,
            avatar: avatarUrl || generateAvatarFromName(name),
            badges,
            weeklyGrowth,
            level,
            rank: 0 // Will be set after sorting
          }
        })
        .filter((member: any) => member !== null)

      // Sort by points first (highest first)
      members.sort((a: any, b: any) => b.points - a.points)
      
      // Assign ranks first (dense ranking)
      let currentRank = 1
      let lastPoints = members[0]?.points
      
      members.forEach((member: any) => {
        if (member.points !== lastPoints) {
          currentRank++
          lastPoints = member.points
        }
        member.rank = member.points === 0 ? 0 : currentRank
      })
      
      // Group by RANK for shuffling
      const groupedByRank = new Map()
      members.forEach((member: any) => {
        const rankGroup = groupedByRank.get(member.rank) || []
        rankGroup.push(member)
        groupedByRank.set(member.rank, rankGroup)
      })
      
      console.log('📊 Rank groups for shuffling:', 
        Array.from(groupedByRank.entries()).map(([rank, group]: [any, any]) => 
          `Rank ${rank}: ${group.length} people (${group.map((m: any) => m.name).slice(0, 3).join(', ')}${group.length > 3 ? '...' : ''})`
        )
      )
      
      // Shuffle members within each RANK group
      groupedByRank.forEach((group: any[], rank: number) => {
        if (group.length > 1) {
          // Time-based seed for 1-minute rotation
          const shuffleSeed = Math.floor(Date.now() / (1 * 60 * 1000)) + rank
          console.log(`🔀 Shuffling ${group.length} people in rank ${rank} with seed ${shuffleSeed}`)
          
          // Fisher-Yates shuffle with seeded random
          for (let i = group.length - 1; i > 0; i--) {
            const x = Math.sin(shuffleSeed * (i + 1)) * 10000
            const randomFloat = x - Math.floor(x)
            const j = Math.floor(randomFloat * (i + 1))
            ;[group[i], group[j]] = [group[j], group[i]]
          }
          
          console.log(`✅ Shuffled rank ${rank}: ${group.map((m: any) => m.name).join(', ')}`)
        }
      })
      
      // Rebuild the members array with shuffled groups maintaining rank order
      const shuffledMembers: any[] = []
      const sortedRanks = Array.from(groupedByRank.keys()).sort((a: number, b: number) => {
        if (a === 0) return 1
        if (b === 0) return -1
        return a - b
      })
      
      sortedRanks.forEach((rank: number) => {
        const group = groupedByRank.get(rank)!
        shuffledMembers.push(...group)
      })
      
      // Convert back to the original array format that the frontend expects
      processedData = [
        processedData[0], // Keep header row
        ...shuffledMembers.map((member: any) => [
          '', // Column A (empty)
          '', // Column B (empty)  
          member.avatar, // Column C (avatar)
          member.name, // Column D (name)
          member.points.toString(), // Column E (points)
          member.badges.join(','), // Column F (badges)
          member.level, // Column G (level)
          member.weeklyGrowth.toString() // Column H (weekly growth)
        ])
      ]
      
      console.log(`✅ Processed and shuffled ${shuffledMembers.length} members`)
    }

    // Helper function to generate avatar from name
    function generateAvatarFromName(name: string): string {
      const firstLetter = name.charAt(0).toUpperCase()
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#6366F1']
      const colorIndex = name.charCodeAt(0) % colors.length
      return `data:image/svg+xml,${encodeURIComponent(`
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="${colors[colorIndex]}" />
          <text x="20" y="28" text-anchor="middle" fill="white" font-size="16" font-weight="bold">${firstLetter}</text>
        </svg>
      `)}`
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minute cache
        }
      }
    )

  } catch (error) {
    console.error('💥 Error in Google Sheets proxy:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})