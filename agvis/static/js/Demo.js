/* ****************************************************************************************
 * File Name:   Demo.js
 * Authors:     Zack Malkmus    
 * Date:        2/5/2024 (last modified)
 * 
 * Description: Handles Demo JS Functions
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/
 * ****************************************************************************************/

// Function to activate a demo button
function activateDemo(index) {
    const buttons = document.querySelectorAll('.demo-button');
    buttons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
    });

    // Add logic to handle button activation here
    if (index == 0) {
        console.log("NA DEMO");

        // Activate NA
        activateSimulation('NA.dimeb');
    } else if (index == 1) {
        console.log("WECC DEMO");

        // Activate WECC
        activateSimulation('wecc.dimeb');
    } else if (index == 2) {
        console.log("NPCC DEMO");

        // Activate NPCC
        activateSimulation('npcc.dimeb');
    } else if (index == 3) {
        console.log("IEEE39 DEMO");

        // Activate IEEE39
        activateSimulation('ieee39.dimeb');
    } else if (index == 4) {
        console.log("ERCOT276 DEMO");

        // Activate ERCOT276
        activateSimulation('ercot276.dimeb');
    } else if (index == 5) {
        console.log("EI528 DEMO");

        // Activate EI528
        activateSimulation('ei528.dimeb');
    } else {
        console.log("FAILED TO LOAD DEMO. INCORRECT ID");
    }
}

async function getSimulationData(filename) {
    const url = `/simulations/${filename}`
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const simulationData = await response.blob();
        return simulationData;

    } catch (e) {
        console.error('Error fetching file:', e);
    }
}

async function activateSimulation(filename) {
    const simulationData = await getSimulationData(filename);

    // Activate simulation here
    console.log(simulationData);

    const load_simulation_input = document.getElementById('opt_loadsimulation_input');

    const myFile = new File([simulationData], filename)

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(myFile);
    load_simulation_input.files = dataTransfer.files;

    var event = new Event('change');
    load_simulation_input.dispatchEvent(event);
}