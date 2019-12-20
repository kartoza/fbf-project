/*
 * L.Control.WMSLegend is used to add a WMS Legend to the map
 */
let dragOn = false;

L.Control.WMSLegend = L.Control.extend({
    options: {
        position: 'topright',
        uri: '',
        iconClass: ''
    },

    onAdd: function () {
        let that = this;
        var controlClassName = 'leaflet-control-wms-legend',
            legendClassName = 'wms-legend',
            legendIconName = this.options.iconClass,
            stop = L.DomEvent.stopPropagation,
            loadingIconName = 'wms-legend-icon fa fa-spinner fa-spin fa-fw';
        this.container = L.DomUtil.create('div', controlClassName);
        this.icon = L.DomUtil.create('i', legendIconName, this.container);
        this.icon.style.display = 'none';
        this.img = L.DomUtil.create('img', legendClassName, this.container);
        this.img.src = this.options.uri;
        this.img.alt = 'Legend';
        this.img.style.display = 'none';

        this.loadingIcon = L.DomUtil.create('i', loadingIconName, this.container);

        L.DomEvent
            .on(this.img, 'click', this._click, this)
            .on(this.container, 'click', this._click, this)
            .on(this.img, 'mousedown', stop)
            .on(this.img, 'dblclick', stop)
            .on(this.img, 'click', L.DomEvent.preventDefault)
            .on(this.img, 'click', stop);
        this.height = null;
        this.width = null;

        $(this.img).on('load',function() {
            that.loadingIcon.style.display = 'none'
            that.img.style.display = 'block';
        });

        return this.container;
    },
    _click: function (e) {
        if(!dragOn) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            // toggle legend visibility
            var style = window.getComputedStyle(this.img);
            if (style.display === 'none') {
                this.container.style.height = this.height + 'px';
                this.container.style.width = this.width + 'px';
                this.img.style.display = this.displayStyle;
                this.icon.style.display = 'none';
            }
            else {
                if (this.width === null && this.height === null) {
                    // Only do inside the above check to prevent the container
                    // growing on successive uses
                    this.height = this.container.offsetHeight;
                    this.width = this.container.offsetWidth;
                }
                this.displayStyle = this.img.style.display;
                this.img.style.display = 'none';
                this.container.style.height = '34px';
                this.container.style.width = '34px';
                this.icon.style.display = 'block';
            }
        }
    },
});

L.wmsLegend = function (uri, map, iconClass) {
    var wmsLegendControl = new L.Control.WMSLegend;
    wmsLegendControl.options.uri = uri;
    wmsLegendControl.options.iconClass = iconClass
    map.addControl(wmsLegendControl);

    var draggable = new L.Draggable(wmsLegendControl.getContainer());
    draggable.enable();
    draggable.on('dragstart', function () {
        dragOn = true
    });
    draggable.on('dragend', function () {
        setTimeout(function () {
            dragOn = false
        }, 200)
    });
    return wmsLegendControl;
};
