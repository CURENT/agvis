/* ****************************************************************************************
 * File Name:   TimeBox.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/26/2023 (last modified)
 * 
 * Description: TimeBox.js contains the code the SimTimeBox class, which is extended from 
 *              a Leaflet Control. The SimTimeBox updates timer in the top left corner of 
 *              the map when a simulation occurs. It also handles the calculations and 
 *              checking for the Custom Timestamp feature.
 *              
 * API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/modeling/timebox.html
 * ****************************************************************************************/

/** 
 * SimTimeBox Class
 * 
 * @class SimTimeBox
 * @extends {L.Control}
 * 
 * @var {Number} simulation_time - The current time for the simulation.
 * @var {String} text            - The text that will be displayed in the SimTimeBox.
 * @var {String} dval2           - The date selected by the user for the Custom Timestamp feature.
 * @var {String} nval2           - The number of increments for the Custom Timestamp feature.
 * @var {String} yval2           - Whether SimTimeBox will try to set a Custom Timestamp or not.
 * @var {String} tval2           - The hour, minute, and second of the day selected by the user for the Custom Timestamp feature.
 * @var {Number} msmult          - The multiple of milliseconds equal to the increment selected by the user.
 * @var {String} ival2           - The size of each increment on the timer.
 * @var {Date}   ddate           - The Date determined from the Custom Timestamp settings.
 * @var {String} isostring       - The ISO string of the Date determined from the Custom Timestamp settings.
 * 
 * @returns {SimTimeBox}
 */
L.SimTimeBox = L.Control.extend({
    simulation_time: 0.0, //The current time for the simulation.

    /**
     * Adds the SimTimeBox to the map and sets the initial time to 0.
     * 
     * @param {*} map 
     * @returns 
     */
    onAdd: function(map) {
        this.simulation_time = 0;
        this.text = L.DomUtil.create('div');
        this.text.id = "info_text";
        this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
        return this.text;
    },

    /**
     * Updates the SimTimeBox based on the time passed by the Window. The time value is 
     * taken from the simulation data’s timestep values. Depending on user inputs in 
     * the Configuration Settings, it will either just display that time or use it to 
     * calculate a Custom Timestamp.
     * 
     * @memberof SimTimeBox
     * @param {Number} t - The time provided by the Window.
     * @returns
     */
    update: function(t){
        this.simulation_time = t;
        let dval2 = document.getElementById("ts_date").value;        // The date selected by the user for the Custom Timestamp feature.
        let nval2 = Number(document.getElementById("ts_num").value); // The number of increments for the Custom Timestamp feature.
        let yval2 = document.getElementById("ny").value;             // Whether SimTimeBox will try to set a Custom Timestamp or not.
        let tval2 = document.getElementById("ts_time").value;        // The hour, minute, and second of the day selected by the user for the Custom Timestamp feature.
        
        //If they aren't using Timestamp or didn't put in proper information, use the default display.
        if (yval2 === "No") {
            this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
        }
        else {
            
            if ((dval2 == "") || (nval2 < 0) || (!(Number.isFinite(nval2))) || (tval2 == "")) {
                this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
            }
            else {
                let msmult = 1;                                      // The multiple of milliseconds equal to the increment selected by the user.
                let ival2 = document.getElementById("ts_inc").value; // The size of each increment on the timer.
                let sdate = Date.parse(dval2 + " " + tval2);         // The Date determined from the Custom Timestamp settings.
                let fdate = sdate;
                
                //Could be reversed in order to be a litle more efficient, but this is more readable.
                switch(ival2) {
                    case "s":
                        msmult = 1000;
                        break;
                    case "min":
                        msmult = 1000 * 60;
                        break;
                    case "h":
                        msmult = 1000 * 60 * 60;
                        break;
                    case "day":
                        msmult = 1000 * 60 * 60 * 24;
                        break;
                    default:
                        msmult = 1;
                }
        
		    //Actual calculation of the new time.
                fdate = fdate + (msmult * this.simulation_time * nval2);
                
                let ddate = new Date(fdate);
		let dstring = new Date(Date.UTC(ddate.getFullYear(), ddate.getMonth(), ddate.getDate(), ddate.getHours(), ddate.getMinutes(), ddate.getSeconds(), ddate.getMilliseconds()));
                let isostring = dstring.toISOString().split("T");
                
                this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + isostring[0] + " " + isostring[1].slice(0, 12) + "</p>";
            }
        }
    }

});

L.simTimeBox = function(opts) { return new L.SimTimeBox(opts); }

