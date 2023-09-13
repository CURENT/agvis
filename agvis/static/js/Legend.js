/**
 * ============================================================================
 * File Name:   Legend.js
 * Author:      Zack Malkmus
 * Date:        9/6/2023 (last modified)
 * ============================================================================
 * This class creates a new legend for AGVis that is draggable and updatable
 * @author  Zack Malkmus
 * @param   {Object} win - The AGVis window that the legend is associated with.
 * @returns {Object}       The new legend element.
 */
L.DynamicLegend = L.Control.extend({
    options: {
        position: 'bottomright',
    },

    /**
     * Initialize the legend.
     * @memberof    L.DynamicLegend
     * @param       {Object} win - The AGVis window that the legend is associated with.
     * @returns     {void}
     * @constructor
     */
    initialize: function(win) {
        this.win = win;
    },

    /**
     * Create the legend element.
     * @memberof L.DynamicLegend
     * @returns  {Element}       - The legend element.
     */
    onAdd: function() {
        // Legend Container
        let div = L.DomUtil.create('div', 'info leaflet-bar');
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);
        div.style.backgroundColor = 'white';
        div.style.boxSizing = 'border-box';
        div.style.padding = '5px';
        div.style.paddingLeft = '15px';
        div.style.paddingRight = '15px';
        div.style.width = '300px';
        div.style.height = '75px';
        div.style.userSelect = 'none';

        // Make the legend draggable
        L.DomEvent.on(div, 'mousedown', this.onDragStart, this);
        L.DomEvent.on(document, 'mousemove', this.onDrag, this);
        L.DomEvent.on(document, 'mouseup', this.onDragEnd, this);

        // Title and Units labels
        let topLabels = L.DomUtil.create('div', '', div);
        topLabels.style.width = '100%';
        topLabels.style.height = '16px';

        this.title = L.DomUtil.create('div', '', topLabels);
        this.title.style.float = 'left';
        this.title.style.width = '45%';

        this.units = L.DomUtil.create('div', '', topLabels);
        this.units.style.float = 'right';
        this.units.style.width = '55%';

        // Create Dynamic Gradient
        let gradient = L.DomUtil.create('div', '', div);
        gradient.style.backgroundImage = 'linear-gradient(to right, #0b00ff, #0044ff, #0044ff, #279eff, #41cef1, #41cef1, #ffffff, #ffb41e, #ffb41e, #ff9537, #ff4727, #ff4727, #ff0000)';
        gradient.style.width = '100%';
        gradient.style.height = '20px';
        gradient.style.border = '1px solid grey';
        gradient.style.borderRadius = '2px';

        // Min and max labels
        let bottomLabels = L.DomUtil.create('div', '', div);
        bottomLabels.style.width = '100%';

        this.min = L.DomUtil.create('div', '', bottomLabels);
        this.min.style.float = 'left';

        this.max = L.DomUtil.create('div', '', bottomLabels);
        this.max.style.float = 'right';

        // Initialize the legend values
        this.update();

        return div;
    },

    /**
     * Set the legend to be draggable.
     * @memberof L.DynamicLegend
     * @param    {Object} e - The event object.
     * @returns  {void}
     */
    onDragStart: function (e) {
        this.dragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.originalX = parseInt(this._container.style.left) || 0;
        this.originalY = parseInt(this._container.style.top) || 0;

    },

    /**
     * Update the legend position while dragging.
     * @memberof L.DynamicLegend
     * @param    {Object} e - The event object.
     * @returns  {void}
     */
    onDrag: function (e) {
        if (!this.dragging) return;

        let deltaX = e.clientX - this.dragStartX;
        let deltaY = e.clientY - this.dragStartY;

        this._container.style.left = this.originalX + deltaX + 'px';
        this._container.style.top = this.originalY + deltaY + 'px';
  
    },

    /**
     * Stop dragging the legend.
     * @memberof L.DynamicLegend
     * @returns  {void}
     */
    onDragEnd: function () {
        this.dragging = false;
    },

    /**
     * Used to update the legend values when the user changes the state or min/max values of the state.
     * @memberof L.DynamicLegend
     * @returns  {void}
     * @see      ConfigControl.js
     * @see      Window.js
     */
    update: function() {
        if (this.win.state == this.win.states.angl) {
            this.title.innerHTML = "<span>V Angle</span>";
            this.units.innerHTML = "<span>(rad)</span>";
            this.min.innerHTML = "<span>" + this.win.options.amin + "</span>";
            this.max.innerHTML = "<span>" + this.win.options.amax + "</span>";
        } 
        else if (this.win.state == this.win.states.volt) {
            this.title.innerHTML = "<span>V Magnitude</span>";
            this.units.innerHTML = "<span>(p.u.)</span>";
            this.min.innerHTML = "<span>" + this.win.options.vmin + "</span>";
            this.max.innerHTML = "<span>" + this.win.options.vmax + "</span>";
        }
        else if (this.win.state == this.win.states.freq) {
            this.title.innerHTML = "<span>Frequency</span>";
            this.units.innerHTML = "<span>(p.u.)</span>";
            this.min.innerHTML = "<span>" + this.win.options.fmin + "</span>";
            this.max.innerHTML = "<span>" + this.win.options.fmax + "</span>";
        }
    },
});