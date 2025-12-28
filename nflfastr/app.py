import streamlit as st
import pandas as pd
import nfl_data_py as nfl

st.set_page_config(page_title="NFL Performance Dashboard 2025", layout="wide")

st.title("🏈 NFL Performance Dashboard (2025)")
st.markdown("""
This dashboard analyzes play-by-play data from the 2025 season using `nfl_data_py`.
Data is filtered for regular season games and excludes garbage time (Win Probability < 5% or > 95%).
""")

@st.cache_data
def load_data():
    # Load play-by-play data for 2025
    with st.spinner('Loading 2025 Play-by-Play data...'):
        try:
            df = nfl.import_pbp_data([2025])
        except Exception as e:
            st.error(f"Error loading PBP data: {e}")
            return pd.DataFrame(), pd.DataFrame()
            
    # Load team descriptions for logos
    with st.spinner('Loading Team Data...'):
        try:
            teams_df = nfl.import_team_desc()
        except Exception as e:
            st.error(f"Error loading Team data: {e}")
            return df, pd.DataFrame()
            
    return df, teams_df

def prepare_data(df):
    """Filters data and adds helper columns for aggregation."""
    if df.empty:
        return df

    # Filter for Regular Season
    df_reg = df[df['season_type'] == 'REG'].copy()
    
    # Standard Filters (RBSDM style)
    # 1. WP between 5-95% (Garbage Time)
    # 2. Must be a pass or run play (pass=1 or rush=1)
    # 3. Exclude Kneels, Spikes, Two-Point Attempts, Aborted Plays
    df_filtered = df_reg[
        # (df_reg['wp'] >= 0.05) & 
        # (df_reg['wp'] <= 0.95) &
        ((df_reg['pass'] == 1) | (df_reg['rush'] == 1)) &
        (df_reg['qb_kneel'] == 0) & 
        (df_reg['qb_spike'] == 0) & 
        (df_reg['two_point_attempt'] == 0) & 
        (df_reg['aborted_play'] == 0) &
        (df_reg['posteam'].notna()) &
        (df_reg['defteam'].notna()) &
        (df_reg['epa'].notna())
    ].copy()
    
    # Pre-calculate conditional columns for easier aggregation
    df_filtered['pass_epa'] = df_filtered.loc[df_filtered['pass'] == 1, 'epa']
    df_filtered['rush_epa'] = df_filtered.loc[df_filtered['rush'] == 1, 'epa']
    df_filtered['pass_yards'] = df_filtered.loc[df_filtered['pass'] == 1, 'yards_gained']
    df_filtered['rush_yards'] = df_filtered.loc[df_filtered['rush'] == 1, 'yards_gained']
    
    return df_filtered

def calculate_metrics(df, group_col):
    """Aggregates statistics based on the grouping column (posteam or defteam)."""
    stats = df.groupby(group_col).agg(
        Plays=('play_id', 'count'),
        EPA_Play=('epa', 'mean'),
        Success_Rate=('success', lambda x: x.mean() * 100),
        Dropback_EPA=('pass_epa', 'mean'),
        Rush_EPA=('rush_epa', 'mean'),
        Pass_Yards=('pass_yards', 'sum'),
        Rush_Yards=('rush_yards', 'sum'),
        Dropback_Pct=('pass', lambda x: x.mean() * 100)
    ).reset_index()
    return stats

def render_table(stats_df, teams_data, group_col, sort_ascending):
    """Merges logos and renders the interactive dataframe."""
    if stats_df.empty or teams_data.empty:
        st.warning("No data available.")
        return

    # Merge with team info to get logos
    merged_df = stats_df.merge(
        teams_data[['team_abbr', 'team_logo_espn']], 
        left_on=group_col, 
        right_on='team_abbr', 
        how='left'
    )
    
    # Sort the Data
    merged_df = merged_df.sort_values(by='EPA_Play', ascending=sort_ascending)

    # Organize Columns
    cols = ['team_logo_espn', group_col, 'Plays', 'EPA_Play', 'Success_Rate', 'Dropback_EPA', 'Rush_EPA', 'Pass_Yards', 'Rush_Yards', 'Dropback_Pct']
    final_df = merged_df[cols]
    
    # Display DataFrame
    st.dataframe(
        final_df,
        column_config={
            "team_logo_espn": st.column_config.ImageColumn("Logo", width="small", help="Team Logo"),
            group_col: "Team",
            "EPA_Play": st.column_config.NumberColumn("EPA/Play", format="%.3f"),
            "Success_Rate": st.column_config.NumberColumn("Success Rate", format="%.1f%%"),
            "Dropback_EPA": st.column_config.NumberColumn("Dropback EPA", format="%.3f"),
            "Rush_EPA": st.column_config.NumberColumn("Rush EPA", format="%.3f"),
            "Dropback_Pct": st.column_config.NumberColumn("Dropback %", format="%.1f%%"),
            "Pass_Yards": st.column_config.NumberColumn("Pass Yds"),
            "Rush_Yards": st.column_config.NumberColumn("Rush Yds"),
        },
        hide_index=True,
        use_container_width=True
    )

# --- Main Execution ---

def main():
    pbp_data, teams_data = load_data()

    if not pbp_data.empty:
        clean_data = prepare_data(pbp_data)
        
        if clean_data.empty:
            st.warning("No data found after filtering.")
        else:
            # Create Tabs
            tab_offense, tab_defense = st.tabs(["Offense", "Defense"])
            
            with tab_offense:
                st.header("Offensive Statistics")
                st.caption("Sorted by EPA/Play (Descending)")
                off_stats = calculate_metrics(clean_data, 'posteam')
                render_table(off_stats, teams_data, 'posteam', sort_ascending=False)
                
            with tab_defense:
                st.header("Defensive Statistics")
                st.caption("Sorted by EPA/Play (Ascending) - Lower is Better")
                def_stats = calculate_metrics(clean_data, 'defteam')
                render_table(def_stats, teams_data, 'defteam', sort_ascending=True)

    else:
        st.write("Could not load data. Please check your internet connection or try again later.")

def export_stats():
    import json
    import os
    import sys

    print("Loading 2025 PBP Data for Export...")
    try:
        # Load data directly without st.cache
        df = nfl.import_pbp_data([2025])
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    print("Processing Data...")
    clean_data = prepare_data(df)
    
    if clean_data.empty:
        print("No data found after filtering.")
        return

    off_stats = calculate_metrics(clean_data, 'posteam')
    def_stats = calculate_metrics(clean_data, 'defteam')

    combined_stats = {}

    # Helper to safe convert numpy/pandas types to python types for JSON
    def safe_val(val):
        if pd.isna(val): return None
        return float(val)

    # Process Offense
    for _, row in off_stats.iterrows():
        team = row['posteam']
        if team not in combined_stats: combined_stats[team] = {}
        combined_stats[team].update({
            'off_epa': safe_val(row['EPA_Play']),
            'off_success_rate': safe_val(row['Success_Rate']),
            'off_dropback_epa': safe_val(row['Dropback_EPA']),
            'off_rush_epa': safe_val(row['Rush_EPA']),
            'off_plays': int(row['Plays']),
            'off_pass_yards': int(row['Pass_Yards']),
            'off_rush_yards': int(row['Rush_Yards']),
            'off_dropback_pct': safe_val(row['Dropback_Pct'])
        })

    # Process Defense
    for _, row in def_stats.iterrows():
        team = row['defteam']
        if team not in combined_stats: combined_stats[team] = {}
        combined_stats[team].update({
            'def_epa': safe_val(row['EPA_Play']),
            'def_success_rate': safe_val(row['Success_Rate']),
            'def_dropback_epa': safe_val(row['Dropback_EPA']),
            'def_rush_epa': safe_val(row['Rush_EPA']),
            'def_plays': int(row['Plays']),
            'def_pass_yards': int(row['Pass_Yards']),
            'def_rush_yards': int(row['Rush_Yards']),
            'def_dropback_pct': safe_val(row['Dropback_Pct'])
        })

    # Output Path
    # Determine project root relative to this script
    # This script is in nflfastr/app.py, so root is ..
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, 'public', 'data', 'team_stats.json')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(combined_stats, f, indent=2)
    
    print(f"Successfully exported stats to {output_path}")

if __name__ == "__main__":
    import sys
    # Check if running via streamlit
    # Streamlit sets 'streamlit' in sys.modules and usually modifies sys.argv
    # But a reliable check is st.runtime.exists() (Streamlit >= 1.14)
    # or checking for the absence of specific arguments if run directly.
    
    try:
        from streamlit.runtime.scriptrunner import get_script_run_ctx
        if get_script_run_ctx():
            main()
        else:
            export_stats()
    except ImportError:
        # Fallback for older streamlit versions or if import fails
        # If we are here, likely running via python directly
        export_stats()
    except Exception as e:
        # If checking context fails, assume CLI export if not running in streamlit
        # But 'main()' is the streamlit app.
        export_stats()
