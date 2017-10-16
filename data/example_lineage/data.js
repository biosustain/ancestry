export default [
    {
        name: "node_1A",
        z: 9.7,
        parent: null,
        series: "group 2",
        selected: true,
        type: "type2",
        "tooltip": [
            "node_1A",
            "z: 9.7"
        ]
    },
    {
        name: "node_2A",
        z: 0.5,
        parent: "node_1A",
        "inLinkLabel": "abcdefg",
        series: "group 2",
        type: "type2",
        "tooltip": [
            "node_2A",
            "z: 0.5"
        ]
    },
    {
        name: "node_3A",
        z: 6.3,
        parent: "node_2A",
        series: "group 1",
        selected: true,
        type: "type1"
    },
    {
        name: "node_3B",
        parent: "node_2A",
        "inLinkLabel": "abcdefghi",
        series: "group 3",
        type: "type1",
        "tooltip": [
            "node_3B",
            "parent: node_2A"
        ]
    },
    {
        name: "node_3C",
        z: 3.9,
        parent: "node_2A",
        series: "group 2",
        selected: true,
        type: "type1"
    },
    {
        name: "node_4A",
        z: 7.8,
        parent: "node_3A",
        "inLinkLabel": "defgabc",
        series: "group 4",
        type: "type2",
        "tooltip": [
            "node_4A",
            "z: 7.8"
        ]
    },
    {
        name: "node_4B",
        z: 0.6,
        parent: "node_3A",
        series: "group 2",
        selected: true,
        type: "type2"
    },
    {
        name: "node_4C",
        z: 4.9,
        parent: "node_3B",
        "inLinkLabel": "defgabchij",
        series: "group 3",
        type: "type2"
    },
    {
        name: "node_4D",
        z: 8.8,
        parent: "node_3C",
        series: "group 1",
        selected: true,
        type: "type1"
    },
    {
        name: "node_1B",
        z: 3.6,
        parent: null,
        series: "group 2",
        type: "type1"
    },
    {
        name: "node_2B",
        z: 3.6,
        parent: "node_1B",
        "inLinkLabel": "defxyz",
        series: "group 1",
        selected: true,
        type: "type1"
    },
    {
        name: "node_2C",
        z: 0.9,
        parent: "node_1B",
        series: "group 4",
        type: "type2"
    },
    {
        name: "node_3D",
        z: 7.8,
        parent: "node_2B",
        series: "group 2",
        type: "type2"
    },
    {
        name: "node_3E",
        z: 8.9,
        parent: "node_2B",
        "inLinkLabel": "abcxyz",
        series: "group 3",
        type: "type2"
    },
    {
        name: "node_3F",
        z: 1,
        parent: "node_2B",
        "inLinkLabel": "abcxyzdef",
        series: "group 3",
        type: "type2"
    },
    {
        name: "node_3G",
        z: 4.1,
        parent: "node_2B",
        series: "group 1",
        type: "type2"
    },
    {
        name: "node_3H",
        parent: "node_2C",
        "inLinkLabel": "abcdefxyz",
        series: "group 1",
        type: "type2"
    },
    {
        name: "node_4E",
        z: 9.1,
        parent: "node_3D",
        series: "group 4",
        selected: true,
        type: "type2"
    },
    {
        name: "node_4F",
        z: 0.7,
        parent: "node_3E",
        "inLinkLabel": "defabcxyz",
        series: "group 2",
        type: "type1"
    },
    {
        name: "node_4G",
        z: 0.4,
        parent: "node_3F",
        series: "group 2",
        type: "type1"
    },
    {
        name: "node_5A",
        parent: "node_4E",
        series: "group 4",
        type: "type1"
    },
    {
        name: "node_5B",
        parent: "node_4E",
        series: "group 4",
        type: "type1"
    },
    {
        name: "node_5C",
        z: 8.8,
        parent: "node_4F",
        series: "group 4",
        type: "type1"
    },
    {
        name: "node_6A",
        z: 8.7,
        parent: "node_5A",
        series: "group 3",
        selected: true,
        type: "type2"
    },
    {
        name: "node_7A",
        z: 9.1,
        parent: "node_6A",
        series: "group 1",
        selected: true,
        type: "type1"
    },
    {
        name: "node_7B",
        parent: "node_6A",
        series: "group 1",
        selected: true,
        type: "type1"
    },
    {
        name: "node_7C",
        parent: "node_6A",
        series: "group 1",
        selected: true,
        type: "type1"
    }
]
