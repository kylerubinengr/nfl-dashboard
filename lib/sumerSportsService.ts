// A simple HTML table parser. This is brittle and should be replaced if a JSON API becomes available.
function parseSumerTable(html: string): Record<string, any> {
    try {
        const teamStats: Record<string, any> = {};

        // Extract the table headers first
        const theadMatch = html.match(/<thead>(.*?)<\/thead>/s);
        const headerRowMatch = theadMatch ? theadMatch[1].match(/<tr>(.*?)<\/tr>/s) : null;
        const headers: string[] = [];
        if (headerRowMatch) {
            const thMatches = headerRowMatch[1].matchAll(/<th[^>]*>(.*?)<\/th>/sg);
            for (const match of thMatches) {
                const headerTextMatch = match[1].match(/<p[^>]*>(.*?)<\/p>|<div[^>]*>(.*?)<\/div>|([^<]+)/s);
                headers.push(headerTextMatch ? (headerTextMatch[1] || headerTextMatch[2] || headerTextMatch[3]).trim() : '');
            }
        }

        const teamNameIdx = headers.indexOf('Team');
        const epaIdx = headers.indexOf('EPA/Play');
        const successRateIdx = headers.indexOf('Success %');

        if (teamNameIdx === -1 || epaIdx === -1 || successRateIdx === -1) {
            console.warn("SumerSports table headers missing expected columns (Team, EPA/Play, Success %). Headers found:", headers);
            return {};
        }

        const tbodyMatch = html.match(/<tbody>(.*?)<\/tbody>/s);
        if (!tbodyMatch) return {};
        
        const rows = tbodyMatch[1].split('<tr>').slice(1); // Split by <tr> and remove empty first element
        
        rows.forEach(row => {
            const cells = row.split(/<td[^>]*>/).slice(1); // Split by <td...> and remove empty first element
            if (cells.length < Math.max(epaIdx, successRateIdx) + 1) return;

            const teamCellHtml = cells[teamNameIdx];
            const epaCellHtml = cells[epaIdx];
            const successRateCellHtml = cells[successRateIdx];

            // Extract team abbreviation from logo src (e.g., /transparent/LA.svg -> LA)
            const logoSrcMatch = teamCellHtml.match(/<img[^>]*src="[^"]+\/transparent\/([^.]+)\.svg"/);
            const teamAbbr = logoSrcMatch ? logoSrcMatch[1] : null;

            if (!teamAbbr) {
                // Fallback to text if logo src not found or is generic
                const textMatch = teamCellHtml.match(/<p[^>]*>(.*?)<\/p>/s);
                const fullTeamName = textMatch ? textMatch[1].trim() : null;
                // Attempt to map full name to abbr if possible (might require another map)
                // For now, if no logo abbr, skip
                return;
            }
            
            const extractValue = (cellHtml: string) => {
                const valueMatch = cellHtml.match(/<div[^>]*>(.*?)<\/div>/s) || cellHtml.match(/>([^<]+)</);
                return valueMatch ? (valueMatch[1] || valueMatch[2] || valueMatch[3]).trim() : 'N/A';
            };

            const epaValue = extractValue(epaCellHtml);
            const successRateValue = extractValue(successRateCellHtml);

            teamStats[teamAbbr] = {
                ...teamStats[teamAbbr], // Preserve data from other tables
                epa: epaValue,
                success_rate: successRateValue,
            };
        });
        return teamStats;
    } catch (e) {
        console.error("Failed to parse SumerSports HTML table:", e);
        return {};
    }
}

export async function getSumerSportsStats() {
    try {
        // Adding a User-Agent header to mimic a browser, as sites might block default fetch
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
        };

        const [offensiveRes, defensiveRes] = await Promise.all([
            fetch('https://sumersports.com/teams/offensive/', { headers, next: { revalidate: 3600 } }),
            fetch('https://sumersports.com/teams/defensive/', { headers, next: { revalidate: 3600 } }),
        ]);

        if (!offensiveRes.ok || !defensiveRes.ok) {
            console.error(`Failed to fetch SumerSports data. Offensive Status: ${offensiveRes.status}, Defensive Status: ${defensiveRes.status}`);
            throw new Error('Failed to fetch SumerSports data');
        }

        const offensiveHtml = await offensiveRes.text();
        const defensiveHtml = await defensiveRes.text();

        const offensiveStats = parseSumerTable(offensiveHtml);
        const defensiveStats = parseSumerTable(defensiveHtml);
        
        console.log("SumerSports Offensive Stats Parsed:", offensiveStats ? Object.keys(offensiveStats).length : 0, "teams");
        console.log("SumerSports Defensive Stats Parsed:", defensiveStats ? Object.keys(defensiveStats).length : 0, "teams");

        const combinedStats: Record<string, any> = {};

        // Combine offensive and defensive stats
        const allTeamAbbrs = new Set([...Object.keys(offensiveStats), ...Object.keys(defensiveStats)]);

        for (const teamAbbr of allTeamAbbrs) {
            combinedStats[teamAbbr] = {
                off_epa: offensiveStats[teamAbbr]?.epa || 'N/A',
                off_success_rate: offensiveStats[teamAbbr]?.success_rate || 'N/A',
                def_epa: defensiveStats[teamAbbr]?.epa || 'N/A',
                def_success_rate: defensiveStats[teamAbbr]?.success_rate || 'N/A',
            };
        }

        return combinedStats;

    } catch (error: any) {
        console.error("Error fetching or parsing SumerSports data:", error);
        return {};
    }
}