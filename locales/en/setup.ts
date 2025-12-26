export default {
    title: "Lobby Setup",
    subtitle: "Define what to vote and how",
    tabs: { 
        candidates: "Candidates", 
        factors: "Voting Factors", 
        settings: "Settings" 
    },
    add_candidate_title: "Add Candidate",
    remove_candidate_title: "Remove Candidate", // Nuova
    remove_candidate_confirm: "Do you really want to remove this candidate?", // Nuova
    candidate_removed: "Candidate removed", // Nuova
    candidate_name_ph: "Name (e.g. Pizza Margherita)",
    candidate_desc_ph: "Description (optional)",
    no_description: "No description", // Nuova
    upload_photo: "Upload Photo",
    list_candidates: "Candidates List",
    static_data_label: "Objective Data",
    trend_high: "Higher is Better",
    trend_low: "Lower is Better",
    factor_name_label: "Factor Name", // Nuova
    factor_name_ph: "E.g. Price, Aesthetics...", // Nuova
    factor_weight: "Weight",
    factor_type_label: "Type", // Nuova
    factor_trend_label: "Trend", // Nuova
    factor_type_static: "Static Data",
    factor_type_vote: "User Vote",
    add_factor_btn: "Add Factor",
    min_one_factor: "You must have at least one voting factor!", // Nuova
    start_voting_btn: "Start Voting",
    no_candidates_msg: "No candidates added yet. Start now!", 
    settings_tab: {
        title: "General Settings",
        scale_label: "Voting Scale (Max)",
        decimals_label: "Allow Decimals",
        danger_zone: "Danger Zone",
        reset_votes_btn: "Reset All Votes",
        reset_confirm: "ARE YOU SURE? This will delete all cast votes.",
        reset_success: "Votes reset successfully."
    }
}