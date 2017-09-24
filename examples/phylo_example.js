let phyloData = [
    {
        "taxon":null,
        "length":null,
        "children":[
            {
                "taxon":null,
                "length":1.375,
                "children":[
                    {
                        "taxon":{
                            "name":"H1",
                            "z":1,
                            "series":"group 1",
                            "type":"pool"
                        },
                        "length":1
                    },
                    {
                        "taxon":null,
                        "length":1.3,
                        "children":[
                            {
                                "taxon":{
                                    "name":"H2",
                                    "z":2,
                                    "series":"group 1",
                                    "type":"pool"
                                },
                                "length":1.3
                            },
                            {
                                "taxon":null,
                                "length":0.5,
                                "children":[
                                    {
                                        "taxon":{
                                            "name":"H3",
                                            "z":null,
                                            "series":"group 2",
                                            "type":"pool"
                                        },
                                        "length":1
                                    },
                                    {
                                        "taxon":null,
                                        "length":1,
                                        "children":[
                                            {
                                                "taxon":{
                                                    "name":"H4",
                                                    "z":4,
                                                    "series":"group 1",
                                                    "type":"pool"
                                                },
                                                "length":1.2
                                            },
                                            {
                                                "taxon":{
                                                    "name":"H9",
                                                    "z":3.2,
                                                    "series":"group 2",
                                                    "type":"pool"
                                                },
                                                "length":1.6
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
                "taxon":null,
                "length":1.375,
                "children":[
                    {
                        "taxon":null,
                        "length":2.75,
                        "children":[
                            {
                                "taxon":null,
                                "length":0.58,
                                "children":[
                                    {
                                        "taxon":{
                                            "name":"H5",
                                            "series":"group 2",
                                            "z":0,
                                            "type":"pool"
                                        },
                                        "length":0.28
                                    },
                                    {
                                        "taxon":{
                                            "name":"H6",
                                            "z":null,
                                            "series":"group 1",
                                            "type":"pool"
                                        },
                                        "length":1.7
                                    }
                                ]
                            },
                            {
                                "taxon":{
                                    "name":"H8",
                                    "z":null,
                                    "series":"group 1",
                                    "type":"pool"
                                },
                                "length":0.41
                            }
                        ]
                    },
                    {
                        "taxon":{
                            "name":"H7",
                            "z":null,
                            "series":"group 1",
                            "type":"pool"
                        },
                        "length":0.25
                    }
                ]
            }
        ]
    }
];

let phyloLayout = {
    margin: {top: 40},
    title: 'test',
    "nodeTypes": {
        "pool": {
            "r": 4,
            "strokeWidth": 2
        }
    },
    "labelCollisionDetection": {
        "enabled": "onDelay"
    }
};

export {phyloData, phyloLayout};