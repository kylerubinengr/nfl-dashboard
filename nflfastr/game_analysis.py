import streamlit as st
import nfl_data_py as nfl
import pandas as pd
import numpy as np

# Set page config for wider layout
st.set_page_config(page_title="NFL Game Analysis", layout="wide")

st.title("NFL Game Analysis (RBSDM Style)")

# --- Data Loading with Caching ---

@st.cache_data
def load_schedule(year):
    """Loads schedule data to get game IDs and matchups."""
    df = nfl.import_schedules([year])
    return df

@st.cache_data
def load_pbp_data(year):
    """Loads PBP data for the entire season (cached)."""
    df = nfl.import_pbp_data([year])
    return df

# Select Season (Default 2025, fallback to available)
season = 2025
try:
    schedule = load_schedule(season)
    # Filter for games that have happened or are scheduled
    # For simplicity in this demo, we assume the season has games.
    # In a real app, we might check result columns or date.
except Exception as e:
    st.error(f"Error loading schedule: {e}")
    st.stop()

# --- Game Selection UI ---

# Create formatted game labels
# Format: "Week X: Away @ Home"
schedule['game_label'] = (
    "Week " + schedule['week'].astype(str) + ": " + 
    schedule['away_team'] + " @ " + schedule['home_team']
)

# Sort by week then game_id
schedule = schedule.sort_values(['week', 'game_id'])

# Create a mapping from label to game_id
game_map = pd.Series(schedule.game_id.values, index=schedule.game_label).to_dict()

selected_label = st.selectbox("Select a Game:", list(game_map.keys()))
selected_game_id = game_map[selected_label]

# Get Team Names for headers
game_info = schedule[schedule['game_id'] == selected_game_id].iloc[0]
home_team = game_info['home_team']
away_team = game_info['away_team']

# --- Data Processing ---

with st.spinner("Loading Play-by-Play Data..."):
    pbp_season = load_pbp_data(season)

# Filter for selected game
game_data = pbp_season[pbp_season['game_id'] == selected_game_id].copy()

if game_data.empty:
    st.warning("No play-by-play data found for this game yet.")
    st.stop()

# Filter Garbage Time (WP 5-95%)
# Note: wp is often null on some plays (kickoffs etc), but we filter by play_type later mostly.
# However, standard RBSDM filter usually applies to WP before play type filtering or concurrently.
# We keep plays where WP is between 0.05 and 0.95 OR WP is missing (to be safe, though usually valid plays have WP)
game_data_filtered = game_data[
    (game_data['wp'] >= 0.05) & (game_data['wp'] <= 0.95)
]

# Filter Non-Plays (Kneels, Spikes) and limit to Run/Pass
# RBSDM usually focuses on rows where play_type is run or pass, removing spikes/kneels.
# qb_kneel and qb_spike columns are useful.
game_data_filtered = game_data_filtered[
    (game_data_filtered['play_type'].isin(['pass', 'run'])) &
    (game_data_filtered['qb_kneel'] == 0) &
    (game_data_filtered['qb_spike'] == 0)
]

# Define Run/Pass correctly
# Pass: qb_dropback == 1 (includes scrambles, sacks, completed/incomplete passes)
# Run: play_type == 'run' AND qb_dropback == 0 (designed runs)
game_data_filtered['is_pass'] = np.where(game_data_filtered['qb_dropback'] == 1, 1, 0)
game_data_filtered['is_run'] = np.where(
    (game_data_filtered['play_type'] == 'run') & (game_data_filtered['qb_dropback'] == 0), 1, 0
)

# --- Metrics Calculation ---

def calculate_metrics(df):
    if len(df) == 0:
        return pd.Series({'EPA/Play': np.nan, 'Success Rate': np.nan, '1st Down %': np.nan, 'Plays': 0})
    
    epa_per_play = df['epa'].mean()
    success_rate = df['success'].mean()
    # 1st down or TD. 'first_down' col is 1 if made, else 0. 
    # touchdowns also count as conversions if not implicitly handled by first_down (usually are, but good to check)
    # nflfastR 'first_down' includes TDs.
    first_down_pct = df['first_down'].mean()
    
    return pd.Series({
        'EPA/Play': epa_per_play, 
        'Success Rate': success_rate, 
        '1st Down %': first_down_pct,
        'Plays': len(df)
    })

def get_team_stats(df, team_abbr):
    # Filter for when this team is on offense (posteam)
    team_df = df[df['posteam'] == team_abbr]
    
    # Define splits
    splits = {
        'All Plays': team_df,
        'Run': team_df[team_df['is_run'] == 1],
        'Pass': team_df[team_df['is_pass'] == 1],
        'Early Downs (1st/2nd)': team_df[team_df['down'].isin([1, 2])],
        'Late Downs (3rd/4th)': team_df[team_df['down'].isin([3, 4])]
    }
    
    stats = {}
    for label, split_df in splits.items():
        stats[label] = calculate_metrics(split_df)
        
    return pd.DataFrame(stats).T

# Calculate stats for both teams
home_stats = get_team_stats(game_data_filtered, home_team)
away_stats = get_team_stats(game_data_filtered, away_team)

# --- Visualization ---

def style_dataframe(df):
    """Applies RBSDM-like styling to the dataframe."""
    # Create a copy to avoid SettingWithCopy warnings on display
    styled = df.style.format({
        'EPA/Play': '{:.2f}',
        'Success Rate': '{:.1%}',
        '1st Down %': '{:.1%}',
        'Plays': '{:.0f}'
    })
    
    # EPA Coloring (Diverging: Red-White-Green or similar)
    # RBSDM often uses custom gradients. 
    # Here we use built-in gradients. 
    # 'RdYlGn' is Red-Yellow-Green. High EPA (Green) is good.
    styled = styled.background_gradient(
        cmap='RdYlGn', 
        subset=['EPA/Play'], 
        vmin=-0.6, vmax=0.6 # Set reasonable bounds for coloring
    )
    
    # Success Rate and 1st Down % Coloring (Sequential: low to high)
    # 'Greens' or 'YlGn'.
    styled = styled.background_gradient(
        cmap='Greens', 
        subset=['Success Rate', '1st Down %'],
        vmin=0.3, vmax=0.6 # Reasonable bounds for SR
    )
    
    return styled

col1, col2 = st.columns(2)

with col1:
    st.subheader(f"{away_team} (Away)")
    st.dataframe(style_dataframe(away_stats), use_container_width=True)

with col2:
    st.subheader(f"{home_team} (Home)")
    st.dataframe(style_dataframe(home_stats), use_container_width=True)

# --- Player Statistics ---

st.header("Player Statistics")

def calculate_player_metrics(group):
    """Calculates metrics for a group of plays (a player)."""
    if len(group) == 0:
        return pd.Series()
        
    epa_per_play = group['epa'].mean()
    total_epa = group['epa'].sum()
    success_rate = group['success'].mean()
    first_down_pct = group['first_down'].mean() # nflfastR includes TDs in first_down often, but let's be safe
    
    return pd.Series({
        'EPA/play': epa_per_play,
        'Total EPA': total_epa,
        'SR': success_rate,
        '1st%': first_down_pct,
        'Count': len(group)
    })

def get_player_stats_table(df, groupby_col, sort_col='Total EPA'):
    """Groups by player and calculates stats."""
    if df.empty:
        return pd.DataFrame()
        
    stats = df.groupby(groupby_col).apply(calculate_player_metrics)
    
    if stats.empty:
        return pd.DataFrame()
        
    # Formatting
    stats = stats.sort_values(sort_col, ascending=False)
    return stats

def get_team_player_stats(df, team_abbr):
    """Generates the three tables for a specific team."""
    team_df = df[df['posteam'] == team_abbr]
    
    # Passing (Dropbacks)
    pass_df = team_df[team_df['qb_dropback'] == 1]
    passing_stats = get_player_stats_table(pass_df, 'passer_player_name')
    
    # Rushing (Designed Runs)
    rush_df = team_df[(team_df['rush_attempt'] == 1) & (team_df['qb_dropback'] == 0)]
    rushing_stats = get_player_stats_table(rush_df, 'rusher_player_name')
    
    # Receiving (Targets)
    # Filter for pass attempts to capture targets. 
    # receiver_player_name is NaN on throwaways/sacks usually.
    # We want plays where there was a target. 
    target_df = team_df[(team_df['pass_attempt'] == 1) & (team_df['receiver_player_name'].notna())]
    receiving_stats = get_player_stats_table(target_df, 'receiver_player_name')
    
    return passing_stats, rushing_stats, receiving_stats

def style_player_dataframe(df):
    """Styles the player stats dataframe."""
    if df.empty:
        return df
        
    # Select only requested columns
    cols_to_show = ['EPA/play', 'Total EPA', 'SR', '1st%']
    # Add count for internal check but maybe not display if strictly following prompt?
    # Prompt: "Columns to Display: Player Name, EPA/play, Total EPA, SR, 1st%".
    # Player Name is the index.
    
    # Clean up
    display_df = df[cols_to_show]
    
    styled = display_df.style.format({
        'EPA/play': '{:.2f}',
        'Total EPA': '{:.2f}',
        'SR': '{:.0%}',
        '1st%': '{:.0%}'
    })
    
    styled = styled.background_gradient(
        cmap='RdYlGn', 
        subset=['EPA/play', 'Total EPA'], 
        vmin=-0.5, vmax=0.5
    )
    
    styled = styled.background_gradient(
        cmap='Greens', 
        subset=['SR', '1st%'],
        vmin=0.3, vmax=0.6
    )
    
    return styled

# Calculate Player Stats
away_passing, away_rushing, away_receiving = get_team_player_stats(game_data_filtered, away_team)
home_passing, home_rushing, home_receiving = get_team_player_stats(game_data_filtered, home_team)

p_col1, p_col2 = st.columns(2)

with p_col1:
    st.subheader(f"{away_team} Players")
    
    st.markdown("**Dropbacks**")
    st.dataframe(style_player_dataframe(away_passing), use_container_width=True)
    
    st.markdown("**Rush Attempts**")
    st.dataframe(style_player_dataframe(away_rushing), use_container_width=True)
    
    st.markdown("**Pass Targets**")
    st.dataframe(style_player_dataframe(away_receiving), use_container_width=True)

with p_col2:
    st.subheader(f"{home_team} Players")
    
    st.markdown("**Dropbacks**")
    st.dataframe(style_player_dataframe(home_passing), use_container_width=True)
    
    st.markdown("**Rush Attempts**")
    st.dataframe(style_player_dataframe(home_rushing), use_container_width=True)
    
    st.markdown("**Pass Targets**")
    st.dataframe(style_player_dataframe(home_receiving), use_container_width=True)

# Optional: Add Play Log or more details below
with st.expander("Raw Data Snippet"):
    st.dataframe(game_data_filtered[['posteam', 'down', 'ydstogo', 'desc', 'play_type', 'epa']].head(20))
