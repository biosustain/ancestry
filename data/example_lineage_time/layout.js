export default {
    height: 500,
    backgroundColor: 'white',
    margin: {
        right: 30,
        left: 30,
        bottom: 20
    },
    link: {
        stroke: '#888'
    },
    axis: {
        gridOnly: true
    },
    labelCollisionDetection: {
        enabled: 'onEveryChange'
    },
    minViewportWidth: {
        timeIntervalInPixels: 150
    },
    brush: {
        drawTrees: false,
        lockY: true,
        height: 12,
        margin: {
            top: 35
        },
        axis: {
            x: {
                showGrid: false
            }
        }
    },
    controls: {
        brush: {
            active: true
        }
    }
};