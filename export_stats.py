import nfl_data_py as nfl
import json
import pandas as pd
def export_nflfastr_stats():
# Load 2025 Stats (adjust year as needed)
# nfl_data_py by default fetches the latest available season data
    # Attempt to load 2024 data first, fallback to latest if not available
    df = nfl.load_pbp(2025)
    print(df)
    team_stats = nfl.import_team_by_year([2025])
    off_epa = df.groupby(['season', 'team'])['epa'].mean().reset_index()
    off_sr = df[df['success'] == 1].groupby(['season', 'team']).size().div(df.groupby(['season', 'team']).size(), level='team').reset_index(name='success_rate')
    # Merge with team_stats for other metrics if available and needed
    # # For this example, we will calculate directly from pbp if needed, or use team_stats if it has the required columns
    # 
    # Simplified for direct EPA and SR per play from PBP
    epa_data = df[['season', 'team', 'epa', 'success']]
    
    # Offensive Stats
    offensive_stats = epa_data[epa_data['offense_play'] == 1].groupby(['season', 'team']).agg(off_epa=('epa', 'mean'),off_success_rate=('success', lambda x: (x == 1).mean())).reset_index()
    # Defensive Stats - EPA values are from the *offense's* perspective.
    # So a negative EPA for defense is good. We need to flip the sign or interpret.
    # Assuming 'def_epa' would be calculated as offense's EPA against that defense
    defensive_stats = epa_data[epa_data['defense_play'] == 1].groupby(['season', 'team']).agg(def_epa=('epa', 'mean'), # This is still offensive EPA allowed
                                                                                              def_success_rate=('success', lambda x: (x == 0).mean()) # Defensive success rate (offense failure)
                                                                                              ).reset_index()
    # Merge offensive and defensive stats
    combined_stats = pd.merge(offensive_stats, defensive_stats, on=['season', 'team'], how='outer')
    # Select and format relevant columns
    cols = ['team', 'season', 'off_epa', 'def_epa', 'off_success_rate', 'def_success_rate']
    data = combined_stats[cols].to_dict(orient='records')
    print(data)
    # Ensure the public/data directory exists

    import os
    output_dir = 'public/data'
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'nfl_stats.json')
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)


export_nflfastr_stats()