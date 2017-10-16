import radialLineagePlotData from './data.js'
import radialLineagePlotLayout from './layout.js'

export default class RadialLineageExampleController {
    constructor() {
        this.plotData = radialLineagePlotData;
        this.plotLayout = radialLineagePlotLayout;

        this.selectedNodes = radialLineagePlotData.filter(d => d.selected);
        this.nodesSelection = function ($nodes) {
            this.selectedNodes = $nodes.map(d => d.data)
        };

        this.onChipRemove = function () {
            this.plotData = radialLineagePlotData.map(node => {
                node.selected = this.selectedNodes.some(d => d.name == node.name);
                return node;
            })
        }
    }
}

