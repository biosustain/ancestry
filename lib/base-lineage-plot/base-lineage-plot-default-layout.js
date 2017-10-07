export default {
    title: null,
    width: null,
    height: 600,
    backgroundColor: 'none',
    textColor: 'black',
    margin: {
        right: 10,
        left: 10,
        top: 10,
        bottom: 10
    },
    axis: undefined, /* defined on child level */
    plotPadding: {
        x: null,
        y: null
    },
    nodeTypes: {},
    seriesColors: {},
    nodeLabel: {
        'font-size': 12,
        dy: 4, // usually 1/3 of font-size works fine
        'font-family': 'Roboto,Helvetica Neue,sans-serif'
    },
    linkLabel: {
        'font-size': 12,
        dy: 4,
        'font-family': 'Roboto,Helvetica Neue,sans-serif'
    },
    link: {
        fill: 'none',
        stroke: '#ccc',
        'stroke-width': 1
    },
    linkCaptureWidth: 10,
    showLinkArrowhead: false,
    labelCollisionDetection: {
        enabled: 'never',
        updateDelay: 500,
        order: {
            linkLabel: 1,
            nodeLabel: 1
        }
    },
    minViewportWidth: {
        generationWidth: 0,
        timeIntervalInSeconds: 3600 * 24 * 30, // month
        timeIntervalInPixels: 0
    },
    groupSelection: {
        enabled: false,
        selectionRectangle: {
            'stroke-width': 1,
            'stroke-dasharray': 4,
            rx: 3,
            ry: 3,
            stroke: 'steelblue'
        }
    },
    heatmap: {
        enabled: true,
        title: null,
        colorScale: [
            [0, '#008ae5'],
            [1, 'yellow']
        ],
        colorBar: {
            show: false,
            height: '90%',
            width: 30,
            padding: {
                left: 10,
                right: 0
            }
        },
        circle: {
            r: 16
        },
        opacity: 0.4
    },
    legend: {
        show: false,
        x: 1.,
        y: 0.5,
        anchor: {
            x: 'left',
            y: 'center'
        },
        orientation: 'vertical',
        backgroundColor: null
    },
    tooltip: {
        show: false,
        showSeriesBar: false,
        align: 'left'
    },
    brush: {
        margin: {
            top: 20,
            bottom: 0
        },
        height: 200,
        lockY: false,
        boxRectangle: {
            'stroke-width': 1,
            'stroke': '#aaa'
        },
        drawTrees: true,
        axis:  undefined, /* defined on child level */
        brushRectangleOnFullView: true
    },
    nodeLabelPositions: [
        {
            x: 10,
            y: 0,
            'text-anchor': 'start'
        },
        {
            x: -10,
            y: 0,
            'text-anchor': 'end'
        }
    ],
    controls: {
        download: {
            show: true,
            format: 'png',
            position: 0
        },
        zoom: {
            show: true,
            active: false,
            position: 2
        },
        brush: {
            show: true,
            active: false,
            position: 3
        },
        select: {
            show: true,
            active: false,
            position: 4
        },
        label: {
            show: true,
            active: true,
            position: 5
        }
    }
};