export default {
    height: 500,
    margin: {
        right: 75
    },
    nodeTypes: {
        'type1': {
            r: 4,
            'stroke-width': 3
        },
        type2: {
            r: 6,
            'stroke-width': 1
        }
    },
    heatmap: {
        enabled: true,
        colorScale: [
            [0, 'orange'],
            [1, 'green']
        ],
        colorBar: {
            show: true
        }
    },
    labelCollisionDetection: {
        enabled: 'onEveryChange'
    }
};