/* ****************************************************************************************
 * File Name:   TimeBox.js
 * Authors:     Nicholas West, Nicholas Parsly
 * Date:        9/26/2023 (last modified)
 * 
 * Description: TimeBox.js contains the code the SimTimeBox class, which is extended from 
 *              a Leaflet Control. The SimTimeBox updates timer in the top left corner of 
 *              the map when a simulation occurs. It also handles the calculations and 
 *              checking for the Custom Timestamp feature.
 * ****************************************************************************************/

L.SimTimeBox = L.Control.extend({
    simulation_time: 0.0,

    onAdd: function(map) {
        this.simulation_time = 0;
        this.text = L.DomUtil.create('div');
        this.text.id = "info_text";
        this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
        return this.text;
    },

    update: function(t){
    
        this.simulation_time = t;
        let dval2 = document.getElementById("ts_date").value;
        let nval2 = Number(document.getElementById("ts_num").value);
        let yval2 = document.getElementById("ny").value;
        let tval2 = document.getElementById("ts_time").value;
        
        //If they aren't using Timestamp or didn't put in proper information, use the default display.
        if (yval2 === "No") {
            this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
        }
        
        else {
            
            if ((dval2 == "") || (nval2 < 0) || (!(Number.isFinite(nval2))) || (tval2 == "")) {
                this.text.innerHTML = "<p style=\"font-size:250%;\"><strong>Simulation time:</strong> " + this.simulation_time + "</p>";
            }
            
            else {
                
                //msmult is the millisecond multiplier. It determines how many ms need to be added to the time per frame.
                let msmult = 1;
                let ival2 = document.getElementById("ts_inc").value;
                let sdate = Date.parse(dval2 + " " + tval2);
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

