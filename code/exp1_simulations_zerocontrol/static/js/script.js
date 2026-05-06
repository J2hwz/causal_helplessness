//------------------------ Variables ------------------------//

// // HTML
// var ins_pages = ['ins_1','ins_2','ins_3','ins_4','ins_5','ins_6','ins_7','ins_8','ins_9','ins_10','ins_11','ins_12','ins_13'];
// var ins_position = 0;

// // Participant data
// var subject_data = {};
// var trial_data = {};
// var causal_query_data = {};
// var pre_control;
// var pre_difficulty;
// var post_control;
// var post_difficulty;
// var false_attempts = 0;

// var upi;
// var start_time = new Date();

// Trial variables 
var n_trials = 6;
var order_all = [1,2,3,4,5,6]; 
var n_interventions = 0

// Counterbalance variables
var counter_balance = ["A", "B"];
var counter_balance_order = [];

// Condition variables 
var condition = 4;
// var conditions = ["P", "Q", "R", "S"];

// Task variables
var time_step = 0.5; // Decided on 2500, with 30 time steps 
var timeout = 30; // Maximum number of steps per trial
var trial_score = 0; // Score for each trial (successful control)
var total_score = 10; // Start with 10 so they can make at least 10 interventions without going into the negative

// Slider variables: Whether or not x was clicked during a time step
var xclicked = false; 
var yclicked = false; 
var zclicked = false;

// Slider variables: Whether or not x was held from the previous time step
var xheld = false; 
var yheld = false;
var x = 0;
var y = 0;
var z = 0;

// Chart variables
var reward_centre = 50; // Centre of shaded reward region
var reward_width; // 1/2 width of shaded reward region
var shade_colour = 'rgb(157, 212, 55, .5)';
var n_datapoints = 15; // Maximum number of datapoints to be plotted

// OU network variables 
var xHist = [0]; // List of values X (int)
var yHist = [0]; // List of values Y (int)
var zHist = [0]; // List of values Z (int)

var x_beta, y_beta, z_beta; // Beta values for OU process

var sigma; // Amount of noise added to system                     
var theta = 0.8; // How sharply the values revert to the mean (or value attached to the cause/s)
var beta_spread; // Whether or not the beta values are spread out across a uniform distribution
var causes = {
    'x': [0,0,0],
    'y': [0,0,0],
    'z': [0,0,0]
}

// Option for beta_spread: 1 for distribution only if interventions, 2 for uniform distribution for all connection weights
var beta_spread_option = 2;

// Causal Query variables
var selected_structure = 0; // To track selected structure for each trial

var graph = 1;


// Causal graph presets
var presets = {
    'Reg': {
        'x': [0, 0, 0],
        'y': [0, 0, 0],
        'z': [1, -1, 0]
    },
    'Inv': {
        'x': [0, 0, 0],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'Common_2': {
        'x': [0, 0, 0],
        'y': [-1, 0, 0],
        'z': [-1, 1, 0]
    },
    'Common_2_B': {
        'x': [0, -1, 0],
        'y': [0, 0, 0],
        'z': [1, -1, 0]
    },
    'Chain_2': {
        'x': [0, -1, 0],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'Chain_2_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, 0],
        'z': [0, -1, 0]
    },
    'Common_3': {
        'x': [0, 1, 0],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'Common_3_B': {
        'x': [0, 0, 0],
        'y': [1, 0, 0],
        'z': [-1, -1, 0]
    },
    'ChainFeed_5': {
        'x': [0, -1, 1],
        'y': [0, 0, 0],
        'z': [-1, 0, 0]
    },
    'ChainFeed_5_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, 1],
        'z': [0, -1, 0]
    },
    'ChainFeed_2': {
        'x': [0, 0, 1],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'ChainFeed_2_B': {
        'x': [0, 0, 0],
        'y': [0, 0, 1],
        'z': [-1, -1, 0]
    },
    'CommonFeed_1': {
        'x': [0, -1, -1],
        'y': [0, 0, 0],
        'z': [-1, -1, 0]
    },
    'CommonFeed_1_B': {
        'x': [0, 0, 0],
        'y': [-1, 0, -1],
        'z': [-1, -1, 0]
    }
}

// Array to store trial data
let trialData = [];

// Function to save data to CSV
function saveToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," +
        data.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

function downloadTrialDataAsCSV(trial_data, filename) {
    const keys = Object.keys(trial_data);
    const maxLength = Math.max(...keys.map(key => trial_data[key].length));

    const rows = [];
    rows.push(keys.join(","));

    for (let i = 0; i < maxLength; i++) {
        const row = keys.map(key => trial_data[key][i] !== undefined ? trial_data[key][i] : "");
        rows.push(row.join(","));
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Variables for iterating across conditions and graphs
let conditionIndex = 0;
let graphIndex = 0;
const conditions = [4];
const graphs = [1, 3, 5, 7, 9, 11];
const trialsPerConditionGraph = 1000;

// ---------------- Main navigation functions ---------------- //

// This function runs when the page loads, shows/hides sections of the html code
function start() {
    $('#demo_choice').show();
    $('#demo_task').hide();

    // Hide buttons initially
    $('#straight_to_task').show();

    // Buttons to proceed to task after choosing graph and condition
    $('#straight_to_task').click(function () { 
        goto_task();
        setup_task();

        $('#demo_choice').hide();
        $('#demo_task').show();
    }); 

    

    // Trigger the checker when relevant elements change
    $('.query_img').click(function () {
        condition_checker(); // Check conditions when an image is clicked
    });

    $('#causal_relationship_container input[type="radio"]').change(function () {
        condition_checker(); // Check conditions when a radio button is selected
        condition = $(this).val();
    });

}

// Function to check if both conditions are met
function condition_checker() {
    const isImageSelected = selected_structure !== 0; // Check if an image is selected
    const isRadioSelected = document.querySelector('#causal_relationship_container input[type="radio"]:checked') !== null; // Check if a radio button is selected

    // Enable or disable the button based on the conditions
    if (isImageSelected && isRadioSelected) {
        $('#straight_to_task').show(); // Enable the button
    } else {
        $('#straight_to_task').hide(); // Disable the button
    }
}

// Go to main task
function goto_task() {

    load_graph(graph); // Load the assigned condition

    // Update score display
    $("#step_score_display").html("<b>Score: " + total_score + "</b>");
}

// Initial setup of the experimental task
function setup_task() {

    // Initialise the trial_count
    trial_count = 0;

    // Randomly choose condition and setup
    setup_condition();

    // Setup slider positions 
    set_sliders();

    // Setup reward area on slider Z
    set_reward_area();

    // Setup chart and variables 
    setup_chart();

    // Setup interface logic
    setup_interface();

    trial_data = {
        x_val: [],
        y_val: [],
        z_val: [],
        x_int: [],
        y_int: [],
        z_int: [],
        step_counter: [],
        cum_int: [],
        cum_total_score: [],
        cum_trial_score: [],
        reward: [],
        trial_count: []
    };
}



// -------- Functions to reset chart and sliders between trials -------- //

// Load graph for each trial count 
function load_graph(graph) {

    if (graph == 1){
        update_model('Common_2');
        // console.log('Graph 1A');
    } else if (graph == 3){
        update_model('Chain_2');
        // console.log('Graph 2A');
    } else if (graph == 5){
        update_model('Common_3');
        // console.log('Graph 3A');
    } else if (graph == 7){
        update_model('ChainFeed_5');
        // console.log('Graph 4A');
    } else if (graph == 9){
        update_model('ChainFeed_2');
        // console.log('Graph 5A');
    } else if (graph == 11){
        update_model('CommonFeed_1');
        // console.log('Graph 6A');
    } else if (graph == 2){
        update_model('Common_2_B');
        // console.log('Graph 1B');
    } else if (graph == 4){
        update_model('Chain_2_B');
        // console.log('Graph 2B');
    } else if (graph == 6){
        update_model('Common_3_B');
        // console.log('Graph 3B');
    } else if (graph == 8){
        update_model('ChainFeed_5_B');
        // console.log('Graph 4B');
    } else if (graph == 10){
        update_model('ChainFeed_2_B');
        // console.log('Graph 5B');
    } else {
        update_model('CommonFeed_1_B');
        // console.log('Graph 6B');
    }
}

// Helper: Update causal model with the selected preset 
function update_model(preset) {
    causes = presets[preset];

    // Set Chart Label
    setup_chart();
}

// --------------- Setup trials functions --------------- //

function setup_condition() {

    if (condition == 1){
        // Low reward saliency, high noise (low control)
        reward_width = 10;
        sigma = 18;
        beta_spread = true;
    } else if (condition == 2){
        // Low reward saliency, low noise (high control)
        reward_width = 10;
        sigma = 4;
        beta_spread = false;
    } else if (condition == 3){
        // High reward saliency, high noise (low control)
        reward_width = 20;
        sigma = 18;
        beta_spread = true;
    } else {
        // High reward saliency, low noise (high control)
        reward_width = 20;
        sigma = 4;
        beta_spread = false;
    }
}

// Setup sliders to control variables using slider function in jquery
function set_sliders() {
    var generalConfig = {
        orientation: 'vertical',
        animate: 'fast',
        range: "min",
        min: -100,
        max: 100
    };

    // Slider X
    $("#slider-x").slider($.extend({}, generalConfig, {

        create: function(event, ui) { // When slider is created, set its value to x 
            $("#slider-x").slider("value", x);
        },

        slide: function(event, ui) {
            x = parseInt($('#slider-x').slider("value"));
            xclicked = true;
            xheld = true;  
            $('#slider-y').slider('disable');
        }, 

        change: function(event, ui) { // Change value of x when participant stops dragging slider i.e. slider changes value
            x = parseInt($('#slider-x').slider("value"));
        }, 

        // When participant begins sliding the slider, disable slider y (only one slider can be used per timestep)
        start: function(event, ui) { 
            xclicked = true;
            xheld = true;  
            $('#slider-y').slider('disable');
        },

        stop: function(event, ui) {
            $(':focus').blur();
            xheld = false;
        }

    }));

    // Slider Y
    $("#slider-y").slider($.extend({}, generalConfig, {
        create: function(event, ui) { // When slider is created, set its value to x 
            $("#slider-y").slider("value", y);
        },

        slide: function(event, ui) {
            y = parseInt($('#slider-y').slider("value")); // Record value on slide with function; Slide meaning that every integer move
            yclicked = true;
            yheld = true;
            $('#slider-x').slider('disable');
        }, 
        
        change: function(event, ui) {
            y = parseInt($('#slider-y').slider("value"));
        }, 

        start: function(event, ui) {
            yclicked = true;
            yheld = true;
            $('#slider-x').slider('disable');
        },

        stop: function(event, ui) {
            $(':focus').blur();
            yheld = false;
        }
    }));

    // Slider Z
    $("#slider-z").slider($.extend({}, generalConfig, { // Extend function applies 
        create: function(event, ui) {
            $("#slider-z").slider("value", z);
        },
        
        slide: function(event, ui) {
            return false; // Make it so that participants can't interact with slider Z
        },

        change: function(event, ui) {
            z = parseInt($('#slider-z').slider("value"));
        },
    }));

    $("#slider-z").slider({
        range: false
    })
}

// Setup reward region on slider (Taken from Btesh's Dynamic Control Example)
function set_reward_area() {
    var rewardArea = $('<div id="reward-area" class="ui-slider-range ui-corner-all ui-widget-header"></div>')
    // var rewardHandle = $('<span id="reward-counter-handle" class="reward-counter" style="font-family: Arial, Helvetica, sans-serif;">0</span>')
    rewardArea.css({
        "bottom": `${(reward_centre - reward_width + 100) * 0.5}%`,
        "height": `${reward_width}%`,
        "background-color": shade_colour,
    })
    $(`#slider-handle-z`).after(rewardArea)
}

function setup_chart() {
    var canvas_html = "<canvas id='progress-chart'></canvas>";
    $(".chart-container").html(canvas_html); // Replacing the chart-container div with a chart from chart.js
    var ctx = document.getElementById("progress-chart").getContext("2d") // Fetches a 2D drawing context of the newly created canvas element

    Chart.defaults.font.size = 18; // Changing default size of all fonts in the chart

    chart = new Chart(ctx, {
        // Type of chart: Line chart
        type: "line",

        // Data 
        data: {
            labels: [0],
            datasets: [{
                label: "X", // X datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: 5,
                borderColor: 'rgb(140, 140, 255)',
                backgroundColor: 'rgb(140, 140, 255)',
                pointBackgroundColor: 'rgb(0, 0, 255)',
                fill: false
            },
            {
                label: "Y", // Y datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: 5,
                borderColor: 'rgb(255, 140, 140)',
                backgroundColor: 'rgb(255, 140, 140)',
                pointBackgroundColor: 'rgb(255, 0, 0)',
                fill: false
            },
            {
                label: "Z", // Z datapoints
                data: [0],
                tension: 0, // Disable line smoothing
                pointRadius: function(context) {
                    var index = context.dataIndex;
                    var value = context.dataset.data[index];
                    var rew_min = reward_centre - reward_width;
                    var rew_max = reward_centre + reward_width;

                    if (value >= rew_min && value <= rew_max) {
                        return 7; // Bigger radius for points inside shaded range
                    } else {
                        return 5; // Same point radius as X or Y otherwise
                    }
                },
                borderColor: 'rgb(151, 240, 151)',
                backgroundColor: 'rgb(151, 240, 151)',
                pointBackgroundColor: 'rgb(30, 174, 30)',
                fill: false
            }
        ]
        },

        options: {  
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Steps',
                    }
                },
                y: {
                    suggestedMin: -100, 
                    suggestedMax: 100,
                    beginAtZero: false,
                    ticks: {
                        stepSize: 20,
                        autoSkip: false
                    }
                },
            },

            animations: {
                x: { duration: 800 }, // X-axis animation duration
                y: { duration: 0 }   // Y-axis animation duration
            },

            plugins: {    
                // Adding shading for reward area 
                annotation: {
                    annotations: {
                        box1: {
                            type: 'box',
                            yMin: reward_centre - reward_width,
                            yMax: reward_centre + reward_width,
                            borderWidth: 0,
                            backgroundColor: shade_colour,
                        }
                    }
                }
            }
        }
    })
}

function setup_interface() {

    // Sliders
    $('#slider-x').slider('disable');
    $('#slider-y').slider('disable');
    $('#slider-z').slider('disable');

    // Buttons
    $('#view_score_button').hide();

    // Ensure step count reflects the one given by the variable 
    $("#step_countdown_display").html("Steps: 0/" + timeout);

    //Setup start button
    $('#start_button').click(function () {
        // console.log('Game began');
        $('#start_button').hide();
        $('#slider-x').slider('enable');
        $('#slider-y').slider('enable');
        $('#slider-z').slider('enable');

        count = 0;
        
        // Record data - 0th Step
        record(x, y, z, xclicked, yclicked, zclicked, 0, 0, total_score, trial_score, false, trial_count);

        // Main game loop is here
        interval = setInterval(step, time_step)
    });

    // If view score button is clicked, go to trial_score slide
    $('#view_score_button').click(function() {
        $('#consent').hide();
        $('#experiment-trial').hide();
        $('#trial_score').show();
        $('#relationship_container').hide();
    
        // Calculate total score and change display
        $("#total_score_display").html("<b>Total score: " + total_score + "</b>");
    });

    // If next trial button on the score display is clicked 
    $('#next_trial_button').click(function() {
        const selected_radio = document.querySelector('.causal_relationship_container input[name="relationship"]:checked');

        if (selected_structure == 0 || selected_radio == null) {
            alert('Please select both a structure and a relationship.')
        } else {
            // Save Causal Query Answers
            var likert_relationship = Number(document.querySelector('.causal_relationship_container input[name="relationship"]:checked').value);
            causal_query_data.selected_structure.push(selected_structure);
            causal_query_data.selected_relationship.push(likert_relationship);
            // console.log(causal_query_data);

            // Reset Causal Query - Remove highlight of causal structure
            const images = document.querySelectorAll('.image_container img');
            images.forEach(img => img.classList.remove('selected'));
            selected_structure = 0;
            
            // Remove highlight from causal relationship buttons 
            document.getElementById('regular').disabled = true;
            document.getElementById('inverse').disabled = true;
            document.querySelectorAll('input[name="relationship"]').forEach(input => input.checked = false);

            //Initialise New Condition or go to end of round questions 
            if (trial_count==2) {
                // Go to end of round questions 
                $('#trial_score').hide();
                $('#end_round_summary').show();

                // Update total points scored on the end of round slide
                $("#end_round_score").html("<b>You have scored a total of " + total_score + " points.</b>");
            } else if (trial_count==5) {
                // Go to end of round questions 
                $('#trial_score').hide();
                $('#end_round_summary').show();

                // Update total points and wording
                $('#end_round_header').html("End of Test Rounds");
                $('#end_round_1').html("You have now finished all test rounds.");
                $("#end_round_score").html("<b>You have scored a total of " + total_score + " points.</b>");
                $('#end_round_2').html("Please answer the following questions about the <b>test</b> rounds:");
            } else {
                initialise_next_trial();
            }
        }
    });
}

// Main game loop
function step() {
            
    // Advance Count
    count = count + 1;

    // console.log("Step: " + count);

    // Advance CDC Task while count <= timeout
    if (count <= timeout){

        // Step of OU process
        ouNetwork();

        // Step in trial for data recording purposes 
        var new_step = count;

        // Visualise data on chart  
        add_data(chart, new_step, [x, y, z]);

        // Remove data if too much is plotted here max datapoints is
        if (chart.data.datasets[0].data.length > n_datapoints) {
            removeData(chart);
        }

        // Update amount of interventions 
        if (xclicked == true || yclicked == true) {
            total_score--; // Deduct total score by 1 for each intervention 
            n_interventions++; // Add 1 to number of interventions for this trial

            $("#intervention_display").html("<b>You moved the sliders " + n_interventions + " times.</b>");
        } else if (xheld == true || yheld == true) {
            total_score--; // Deduct total score by 1 for each intervention 
            n_interventions++; // Add 1 to number of interventions for this trial

            $("#intervention_display").html("<b>You moved the sliders " + n_interventions + " times.</b>");
        }

        // Visualise score (increase if target in range)
        var reward = false;
        if (z <= (reward_centre + reward_width) && z >= (reward_centre - reward_width)) {       
            total_score += 5; // Add 3 points to total score
            trial_score += 5; // Keep track of amount scored during this trial
             
            reward = true;

            $("#trial_score_display").html("<b>Points scored in previous round: " + trial_score + "</b>");
        }

        // Visualise countdown
        if (count <= timeout) {
            $("#step_score_display").html("<b>Score: " + total_score + "</b>");
            $("#step_countdown_display").html("<i>Steps: " + count  + "/" + timeout + "</i>");
        }
        
        // Record whether participant had the tab open or closed
        if (document.hasFocus()) {
            var focus = 1
        } else {
            var focus = 0
        }

        // Record data
        record(x, y, z, xclicked, yclicked, zclicked, new_step, n_interventions, total_score, trial_score, reward, trial_count);
    }

    // Set xclicked (yclicked, zclicked) to false after ouNetwork() and data recording
    xclicked = false;
    yclicked = false;
    // zclicked = false;

    // Enable Sliders (previous, action disabled one of the two sliders)
    $('#slider-x').slider('enable');
    $('#slider-y').slider('enable');

    // Stop game at timeout
    if (count > timeout){
        //Reset Task
        $('#slider-x').slider('disable');
        $('#slider-y').slider('disable');
        $('#slider-z').slider('disable');
        $('#view_score_button').show();

        console.log('Graph: ' + graph + ' Condition: ' + condition + ' Trial: ' + trial_count + " Trial score: " + trial_score + " Reward width:" + reward_width + " Noise:" + sigma + " Beta spread: " + beta_spread);

        initialise_next_trial();
    }
}

// Add data to chart for each step
function add_data(chart, step_count, new_data) {
    chart.data.labels.push(round(step_count, 1)); // Add step count on x-axis
    chart.data.datasets.forEach((dataset, index) => { // Add x, y, z data for each index in the list
        dataset.data.push(new_data[index]);
    });
    chart.update();
}

// Remove old datapoints from chart if too many plotted
function removeData(chart) {
    chart.data.labels.shift();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    chart.update();
}

//------------ OU Network Computation ------------//

// Ou Network value updates
function ouNetwork() {
    // Logic for the OU Network
    var $sliders = $('.slider');

    // Compute new value for each slider 
    $sliders.each(function(index, element) { // Do for each of the variables/sliders
        var $slider = $(element);
        var var_name = $slider.attr('id').slice(-1);
        
        var old_value = parseInt($slider.slider("value"));
        var new_value;

        if ((var_name=='x' && xclicked==true) || (var_name=='y' && yclicked==true) || (var_name=='x' && xheld==true) || (var_name=='y' && yheld==true)) {
            new_value = old_value; // If either x or y slider is clicked during that step, retain that value, else apply ou increment on other values
        } else {
            mean_attractor = attractor(var_name, causes);
            new_value = ouIncrement(var_name, mean_attractor); // ouIncrement(old_value, sigma, dt, theta, mean_attractor);
        }

        // No values above 100 or below -100
        if (new_value > 100) {
            new_value = 100;
        } else if (new_value < -100) {
            new_value = -100;
        } 

        $slider.slider("value", new_value);
    })
}

// Helper: Compute attractor value 
function attractor(variable_name, causes) {
    var coefs = causes[variable_name];
    var last_step = count; 

    // Generate random values for variables with interventions in no control condition
    if (beta_spread == true && beta_spread_option == 1) {
        // Update first value of coefs only if x has been intervened on
        if (xclicked == true || xheld == true) { 
            x_beta = generateRandomCoefficient(coefs[0]);
        } else {
            x_beta = coefs[0];
        }

        // Update second value of coefs only if y has been intervened on
        if (yclicked == true || yheld == true) { 
            y_beta = generateRandomCoefficient(coefs[1]);
        } else {
            y_beta = coefs[1];
        }

        z_beta = coefs[2];
    } else if (beta_spread == true && beta_spread_option == 2) {
        x_beta = generateRandomCoefficient(coefs[0]);
        y_beta = generateRandomCoefficient(coefs[1]);
        z_beta = generateRandomCoefficient(coefs[2]);
    } else {
        x_beta = coefs[0];
        y_beta = coefs[1];
        z_beta = coefs[2];
    }

    // Compute x,y,z attractor values for control condition
    var x_att = xHist[last_step] * x_beta;
    var y_att = yHist[last_step] * y_beta;
    var z_att = zHist[last_step] * z_beta;

    return x_att + y_att + z_att;
}

// Helper: Generate random beta coefficient for OU update in no control condition
function generateRandomCoefficient(coef) {
    switch (coef) {
        case 1:
            return rbeta(1, 3) * 1;
            // return Math.random() + Number.EPSILON; // Random between 0 and 1 (inclusive of 0 and 1)
        case -1:
            return rbeta(1, 3) * -1;
            // return Math.random() - 1 + Number.EPSILON; // Random between -1 and 0 (inclusive of -1 and 0)
        default:
            return 0; // Retain 0 if coef is 0
    }
}

// Helper: Compute OU update for a variable
function ouIncrement(variable_name, attractor) {
    var last_step = count;

    if (variable_name == 'x') {
        // console.log(theta*(attractor-xHist[last_step]));
        return xHist[last_step] + theta*(attractor-xHist[last_step]) + sigma*normalRandom();
    } else if (variable_name == 'y') {
        // console.log(theta*(attractor-yHist[last_step]));
        return yHist[last_step] + theta*(attractor-yHist[last_step]) + sigma*normalRandom();
    } else {
        // console.log(theta*(attractor-zHist[last_step]));
        return zHist[last_step] + theta*(attractor-zHist[last_step]) + sigma*normalRandom();
    }
}

// --- Data recording for plot and data base --- //
function record(x, y, z, int_x, int_y, int_z, new_step, n_interventions, total_score, trial_score, reward, trial_count) {

    xHist.push(x);
    yHist.push(y);
    zHist.push(z);

    trial_data.x_val.push(x);
    trial_data.y_val.push(y);
    trial_data.z_val.push(z);
    trial_data.x_int.push(+ int_x);
    trial_data.y_int.push(+ int_y);
    trial_data.z_int.push(+ int_z);
    trial_data.step_counter.push(new_step);
    trial_data.cum_int.push(n_interventions);
    trial_data.cum_total_score.push(total_score);
    trial_data.cum_trial_score.push(trial_score);
    trial_data.reward.push(reward);
    trial_data.trial_count.push(trial_count);
}

// Function to handle image selection
function select_structure(imageId) {
    // Clear all image selections
    const images = document.querySelectorAll('.image_container img');
    images.forEach(img => img.classList.remove('selected'));

    // Highlight the newly selected image
    selected_structure = imageId;
    document.getElementById(`img${imageId}`).classList.add('selected');

    // Enable the radio buttons
    graph = imageId;

    displayGraphImage(imageId);
}

function displayGraphImage(graphNumber) {
    // Map graph numbers to image paths
    const graphImages = {
        1: './static/assets/images/graph1a.png',
        2: './static/assets/images/graph1b.png',
        3: './static/assets/images/graph2a.png',
        4: './static/assets/images/graph2b.png',
        5: './static/assets/images/graph3a.png',
        6: './static/assets/images/graph3b.png',
        7: './static/assets/images/graph4a.png',
        8: './static/assets/images/graph4b.png',
        9: './static/assets/images/graph5a.png',
        10: './static/assets/images/graph5b.png',
        11: './static/assets/images/graph6a.png',
        12: './static/assets/images/graph6b.png'
    };

    // Get the image element
    const graphImageElement = document.getElementById('graph_image');

    // Update the src attribute based on the graph number
    if (graphImages[graphNumber]) {
        graphImageElement.src = graphImages[graphNumber];
        graphImageElement.alt = `Graph ${graphNumber}`;
    } else {
        graphImageElement.src = '';
        graphImageElement.alt = 'No graph available';
        console.warn(`No image found for graph number: ${graphNumber}`);
    }
}

function initialise_next_trial() {
    // Add trial data to the array
    trialData.push([trial_count, graph, condition, trial_score, total_score]);

    // Check if we have completed the current condition and graph
    if (trial_count === trialsPerConditionGraph - 1) {
        trial_count = 0; // Reset trial count for the next condition/graph

        // Move to the next graph
        graphIndex++;

        // If all graphs for the current condition are done, move to the next condition
        if (graphIndex >= graphs.length) {
            graphIndex = 0;
            conditionIndex++;
        }

        // If all conditions and graphs are completed, save the data to a CSV file
        if (conditionIndex >= conditions.length) {
            // Add headers to the data
            const headers = ["trial_count", "graph", "condition", "trial_score", "total_score"];
            trialData.unshift(headers);

            // Save the data to a CSV file
            saveToCSV(trialData, "zero_control_cond2.csv");

            downloadTrialDataAsCSV(trial_data, "zero_control_intervention_cond2.csv");

            // Clear the trial data array for the next batch
            trialData = [];
            clearInterval(interval);
            return; // Stop further trials
        }

        // Update the current condition and graph
        condition = conditions[conditionIndex];
        graph = graphs[graphIndex];

        load_graph(graph);
        setup_condition();

    } else {

        trial_count += 1;

    }

    // Reset the task interface for the next trial
    $('#experiment-trial').show();
    $('#trial_score').hide();
    $('#view_score_button').hide();

    // Stopping the unique interval ID
    clearInterval(interval);

    // Resetting the slider values back to 0
    $('.slider').slider("value", 0);

    // Resetting array of x, y, & z values
    xHist = [0];
    yHist = [0];
    zHist = [0];

    // Reset scores and number of interventions for the previous trial
    trial_score = 0;
    n_interventions = 0;
    $("#trial_score_display").html("<b>Points scored in previous round: 0</b>");
    $("#intervention_display").html("<b>You moved the sliders 0 times.</b>");

    $('#start_button').show();

    // Update step score to reflect total score currently
    $("#step_score_display").html("<b>Score: " + total_score + "</b>");

    // Update step countdown
    $("#step_countdown_display").html("Steps: 0/" + timeout);

    // Start the next trial
    $('#slider-x').slider('enable');
    $('#slider-y').slider('enable');
    $('#slider-z').slider('enable');

    count = 0;

    // Record data - 0th Step
    record(x, y, z, xclicked, yclicked, zclicked, 0, 0, total_score, trial_score, false, trial_count);

    // Main game loop is here
    interval = setInterval(step, time_step);
}

// --- Normal distribution and math functions --- //
// https://gist.github.com/bluesmoon/7925696

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);}

var spareRandom = null;

function normalRandom() {
	var val, u, v, s, mul;

	if(spareRandom !== null)
	{
		val = spareRandom;
		spareRandom = null;
	}
	else
	{
		do
		{
			u = Math.random()*2-1;
			v = Math.random()*2-1;

			s = u*u+v*v;
		} while(s === 0 || s >= 1);

		mul = Math.sqrt(-2 * Math.log(s) / s);

		val = u * mul;
		spareRandom = v * mul;
	}
	return val;
}

function normalRandomInRange(min, max) {
	var val;
	do
	{
		val = normalRandom();
	} while(val < min || val > max);
	
	return val;
}

function normalRandomScaled(mean, stddev){
	var r = normalRandom();

	r = r * stddev + mean;

    //return Math.round(r);
    // returns non rounded float
    return r;
}

function lnRandomScaled(gmean, gstddev){
	var r = normalRandom();

	r = r * Math.log(gstddev) + Math.log(gmean);

	return Math.round(Math.exp(r));
}

// ---------- Beta distribution for varying connection weights (beta) ---------- //
// Taken from https://stackoverflow.com/questions/9590225/is-there-a-library-to-generate-random-numbers-according-to-a-beta-distribution-f

// javascript shim for Python's built-in 'sum'
function sum(nums) {
    var accumulator = 0;
    for (var i = 0, l = nums.length; i < l; i++)
      accumulator += nums[i];
    return accumulator;
}
  
  // In case you were wondering, the nice functional version is slower.
  // function sum_slow(nums) {
  //   return nums.reduce(function(a, b) { return a + b; }, 0);
  // }
  // var tenmil = _.range(1e7); sum(tenmil); sum_slow(tenmil);
  
  // like betavariate, but more like R's name
function rbeta(alpha, beta) {
    var alpha_gamma = rgamma(alpha, 1);
    return alpha_gamma / (alpha_gamma + rgamma(beta, 1));
}
  
// From Python source, so I guess it's PSF Licensed
var SG_MAGICCONST = 1 + Math.log(4.5);
var LOG4 = Math.log(4.0);
  
function rgamma(alpha, beta) {
    // does not check that alpha > 0 && beta > 0
    if (alpha > 1) {
      // Uses R.C.H. Cheng, "The generation of Gamma variables with non-integral
      // shape parameters", Applied Statistics, (1977), 26, No. 1, p71-74
        var ainv = Math.sqrt(2.0 * alpha - 1.0);
        var bbb = alpha - LOG4;
        var ccc = alpha + ainv;
    
        while (true) {
            var u1 = Math.random();
            if (!((1e-7 < u1) && (u1 < 0.9999999))) {
            continue;
            }
            var u2 = 1.0 - Math.random();
            v = Math.log(u1/(1.0-u1))/ainv;
            w = alpha*Math.exp(v);
            var z = u1*u1*u2;
            var r = bbb+ccc*v-w;
            if (r + SG_MAGICCONST - 4.5*z >= 0.0 || r >= Math.log(z)) {
            return w * beta;
            }
        }
    } else if (alpha == 1.0) {
        var u = Math.random();
        while (u <= 1e-7) {
            u = Math.random();
        }
        return -Math.log(u) * beta;
    } else { // 0 < alpha < 1
        // Uses ALGORITHM GS of Statistical Computing - Kennedy & Gentle
        while (true) {
            var u3 = Math.random();
            var b = (Math.E + alpha)/Math.E;
            var p = b*u3;
            if (p <= 1.0) {
                w = Math.pow(p, (1.0/alpha));
            }
            else {
                w = -Math.log((b-p)/alpha);
            }
            var u4 = Math.random();
            if (p > 1.0) {
                if (u4 <= Math.pow(w, (alpha - 1.0))) {
                break;
                }
            }
            else if (u4 <= Math.exp(-w)) {
                break;
            }
        }
        return w * beta;
    }
}