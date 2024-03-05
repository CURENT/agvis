/* ****************************************************************************************
 * File Name:   Demo.js
 * Authors:     Zack Malkmus    
 * Date:        2/5/2024 (last modified)
 * 
 * Description: Handles Demo JS Functions
 * 
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/
 * ****************************************************************************************/

/**
 * A function to activate the Demo buttons
 * 
 * @author Zack Malkmus
 * @param {int} index - Index of the button used on the frontend
 * @returns 
 */
function activateDemo(index) {
    const buttons = document.querySelectorAll('.demo-button');
    buttons.forEach((button, i) => {
        button.classList.toggle('active', i === index);
    });

    // Add logic to handle button activation here
    if (index == 0) {
        console.log("WECC DEMO");

        // Activate WECC
        activateSimulation('wecc.dimeb');
    } else if (index == 1) {
        console.log("NPCC DEMO");

        // Activate NPCC
        activateSimulation('npcc.dimeb');
    } else if (index == 2) {
        console.log("IEEE39 DEMO");

        // Activate IEEE39
        activateSimulation('ieee39.dimeb');
    } else if (index == 3) {
        console.log("ERCOT276 DEMO");

        // Activate ERCOT276
        activateSimulation('ercot276.dimeb');
    } else if (index == 4) {
        console.log("EI528 DEMO");

        // Activate EI528
        activateSimulation('ei528.dimeb');
    } else {
        console.log("FAILED TO LOAD DEMO. INCORRECT ID");
    }
}

/**
 * Grabs simulation data from the backend, stored in the cases folder.
 * 
 * @author Zack Malkmus
 * @param {string} filename - name of the dimeb file to grab
 * @returns 
 */
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

/**
 * Get simulation data and load it into the existing load_simulation_input element.
 * 
 * @author Zack Malkmus
 * @param {string} filename - Name of the simulation to grab (.dimeb)
 * @returns 
 */
async function activateSimulation(filename) {
    // Show the loading spinner
    const body = document.querySelector('body');
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';
    body.classList.add('loading-cursor');

    try {
        // Get simulation file from the backend
        const simulationData = await getSimulationData(filename);

        // Grab the load simulation input
        const load_simulation_input = document.getElementById('opt_loadsimulation_input');

        // Create a new file from the binary
        const myFile = new File([simulationData], filename)

        // Create a datatransfer and load the file into our element
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(myFile);
        load_simulation_input.files = dataTransfer.files;

        // Trigger an onchange event to start the sim
        var event = new Event('change');
        load_simulation_input.dispatchEvent(event);

    } catch (error) {
        console.error('Error loading simulation:', error);
        
    } finally {
        setTimeout(() => {
            // Hide the loading spinner and restore cursor
            loadingSpinner.style.display = 'none';
            body.classList.remove('loading-cursor');

            // Remove the simulation buttons, forcing them to refresh the page.
            const opt_loadsimulation  = document.querySelector(`input[name='opt_loadsimulation']`);
            opt_loadsimulation.disabled = true;

            const demoButtons = document.querySelectorAll('.demo-button');
            demoButtons.forEach(button => {
                button.style.display = 'none';
                button.disabled = true;
            });

            // Enable reset button
            const reset = document.getElementById('reset');
            reset.style.display = "inline-block";
        }, 500);
    }
}

/**
 * Simple refresh the page.
 * 
 * @author Zack Malkmus
 * @returns 
 */
function reset() {
    location.reload(true);
}