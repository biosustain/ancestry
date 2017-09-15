let phyloData = [
    {
        "taxon": null,
        "length": null,
        "children": [
            {
                "taxon": null,
                "length": 1.375,
                "children": [
                    {
                        "taxon": {
                            "name": "H1",
                            "z": 1,
                            "parent": null,
                            "series": 0,
                            "type": "pool"
                        },
                        "length": 1,
                        "children": []
                    },
                    {
                        "taxon": null,
                        "length": 0,
                        "children": [
                            {
                                "taxon": {
                                    "name": "H2",
                                    "parent": null,
                                    "z": 2,
                                    "series": 0,
                                    "type": "pool"
                                },
                                "length": 1,
                                "children": []
                            },
                            {
                                "taxon": null,
                                "length": 0,
                                "children": [
                                    {
                                        "taxon": {
                                            "name": "H3",
                                            "z": null,
                                            "parent": null,
                                            "series": 1,
                                            "type": "pool"
                                        },
                                        "length": 1,
                                        "children": []
                                    },
                                    {
                                        "taxon": null,
                                        "length": 1,
                                        "children": [
                                            {
                                                "taxon": {
                                                    "name": "H4",
                                                    "parent": null,
                                                    "z": 4,
                                                    "series": 0,
                                                    "type": "pool"
                                                },
                                                "length": 0,
                                                "children": []
                                            },
                                            {
                                                "taxon": {
                                                    "name": "H55",
                                                    "parent": null,
                                                    "z": 3.2,
                                                    "series": 1,
                                                    "type": "pool"
                                                },
                                                "length": 0,
                                                "children": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "taxon": null,
                "length": 1.375,
                "children": [
                    {
                        "taxon": null,
                        "length": 2.75,
                        "children": [
                            {
                                "taxon": null,
                                "length": 0.5833333333333334,
                                "children": [
                                    {
                                        "taxon": {
                                            "name": "H5",
                                            "series": 1,
                                            "z": 0,
                                            "type": "pool"
                                        },
                                        "length": 0.2857142857142857,
                                        "children": []
                                    },
                                    {
                                        "taxon": {
                                            "name": "H6",
                                            "z": null,
                                            "parent": null,
                                            "series": 0,
                                            "type": "pool"
                                        },
                                        "length": 1.7142857142857144,
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "taxon": {
                                    "name": "H8",
                                    "z": null,
                                    "parent": null,
                                    "series": 0,
                                    "type": "pool"
                                },
                                "length": 0.41666666666666663,
                                "children": []
                            }
                        ]
                    },
                    {
                        "taxon": {
                            "name": "H7",
                            "z": null,
                            "parent": null,
                            "series": 0,
                            "type": "pool"
                        },
                        "length": 0.25,
                        "children": []
                    }
                ]
            }
        ]
    },
    {
        "taxon": null,
        "length": null,
        "children": [{
            "taxon": {"name": "H1", "z": 1, "parent": null, "series": 0, "type": "pool"},
            "length": 1,
            "children": []
        }, {
            "taxon": null,
            "length": 0.4,
            "children": [{
                "taxon": {"name": "H2", "parent": null, "z": 2, "series": 0, "type": "pool"},
                "length": 1,
                "children": []
            }, {
                "taxon": {"name": "H4", "parent": null, "z": 2, "series": 1, "type": "pool"},
                "length": 0.3,
                "children": []
            }]
        }]
    }
];

let phyloLayout = {
    "nodeTypes": {
        "strain": {
            "r": 4,
            "strokeWidth": 3
        },
        "pool": {
            "r": 6,
            "strokeWidth": 1
        }
    },
    "groupSelection": {
        "enabled": true,
        "selectionRectangle": {
            "stroke-width": 1,
            "stroke-dasharray": 4,
            "rx": 3,
            "ry": 3,
            "stroke": "steelblue"
        }
    },
    "labelCollisionDetection": {
        "enabled": "onDelay",
        "updateDelay": 500
    },
    "showLeafNodes": true,
    "axis": {
        "title": "",
        "show": true,
        "gridOnly": false
    },
    "nodeLabel": {
        "font-size": 12
    },
    "heatmap": {
        "colourBar": {
            "show": true
        },
        "circle": {
            "r": 16
        },
        "opacity": 0.4
    },
    legend: {
        show: true
    }
};

export {phyloData, phyloLayout};