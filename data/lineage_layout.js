export default {
    height: 500,
    margin: {
        right: 80,
        bottom: 25
    },
    axis: {
        gridOnly: true
    },
    nodeTypes: {
        type1: {
            r: 4,
            'stroke-width': 3
        },
        type2: {
            r: 6,
            'stroke-width': 2
        }
    },
    seriesColours: {
        'group 1': 'orange',
        'group 2': 'darkgreen',
        'group 3': 'purple',
        'group 4': '#F00'
    },
    labelCollisionDetection: {
        enabled: 'onEveryChange'
    },
    heatmap: {
        enabled: true,
        title: 'z values',
        colourBar: {
            height: '80%'
        }
    },
    legend: {
        show: true,
        x: 1,
        y: 0.5,
        anchor: {
            x: 'left',
            y: 'center'
        },
        orientation: 'vertical'
    }
};