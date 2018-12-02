const COLORS = {  
    "Sand1": "#565656",
    "Sand2": "#6e5457",
    "Sand3": "#6D5051",
    "Sand4": "#834B5F",
    "Sand5": "#A98978",
    "Sand6": "#A7705A",
    "Sand7": "#B88968",
    "Sand8": "#82694A",
    "Sand9": "#A98978",
    "Sand10":"#B88968",
    "Sand11":"#B88968",
    "Sand12":"#A37B5F",
    "Sand13":"#C8B998",
    "Marble0":"#968282",
    "Marble1":"#e4cbaa",
    "Wood0":"#523b22",
    "Wood1":"#8b7453",
    "Wood2":"#8b6c58",
    "Wood3":"#543a29",
    "Blackwood0":"#333133",
    "Blackwood1":"#0f0f0f",
    "Blackwood2":"#636162",
    "Lightwood0":"#e0c4b0",
    "Lightwood1":"#e8b995"
};
const COLOR_SCHEME: { [key:string]:[string,number][]; } = {
    "Sand":[
        ["#565656",0.2],
        ["#6e5457",0.1],
        ["#6D5051",0.025],
        ["#834B5F",0.025],
        ["#A98978",0.025],
        ["#A7705A",0.025],
        ["#B88968",0.0375],
        ["#82694A",0.0125],
        ["#A98978",0.0375],
        ["#B88968",0.025],
        ["#B88968",0.1],
        ["#A37B5F",0.1],
        ["#C8B998",0.2875]
    ],
    "Mesa":[
        ["#c07860", 0.000190],
        ["#d8a8a8", 0.000063],
        ["#f0a878", 0.001270],
        ["#f0c090", 0.066921],
        ["#c09078", 0.002794],
        ["#f0d8c0", 0.002159],
        ["#f0c090", 0.060000],
        ["#f0d8a8", 0.003873],
        ["#d8a890", 0.050000],
        ["#c0a878", 0.000635],
        ["#f0c0a8", 0.050000],
        ["#d89060", 0.001587],
        ["#d8a890", 0.050000],
        ["#d89078", 0.054540],
        ["#f0c0c0", 0.000127],
        ["#f0c0a8", 0.085397],
        ["#d8c0a8", 0.071683],
        ["#f0a890", 0.059492],
        ["#c0a890", 0.000698],
        ["#d8a890", 0.050000],
        ["#d8a878", 0.063937],
        ["#d8a890", 0.050000],
        ["#d8c090", 0.059746],
        ["#d8a890", 0.050000],
        ["#f0c0a8", 0.050000],
        ["#d8a890", 0.054127],
        ["#d8a878", 0.060000],
        ["#d8c0c0", 0.000063],
        ["#c09060", 0.000698]
    ],
    "White Mesa":[
        ["#d8d8c0", 0.472558],
        ["#d8d8d8", 0.404393],
        ["#f0d8d8", 0.052351],
        ["#d8c0c0", 0.046718],
        ["#c0c0c0", 0.011938],
        ["#c0c0a8", 0.006718],
        ["#f0d8c0", 0.002274],
        ["#c0d8c0", 0.001034],
        ["#f0f0d8", 0.000827],
        ["#c0a8a8", 0.000620],
        ["#a8a8a8", 0.000310],
        ["#a8a890", 0.000155],
        ["#d8c0a8", 0.000103]
    ],
    "Marble":[
        ["#f4f4f4",.5],
        ["#d5d5d5",.5]
    ],
    "Wood":[
        ["#523b22",.35],
        ["#8b7453",.15],
        ["#8b6c58",.4],
        ["#543a29",.1]
    ],
    "Blackwood":[
        ["#333133",.333],
        ["#0f0f0f",.333],
        ["#636162",.334]
    ],
    "Lightwood":[
        ["#e0c4b0",.5],
        ["#e8b995",.5]
    ]
};

{
let h,s,v;
h=s=v=0;

for(let idx=0;idx<COLOR_SCHEME["Sand"].length;idx++){
    const entry = COLOR_SCHEME["Sand"][idx];
    const color = entry[0];
    const percentage:number = <number>entry[1];
    const hsv:[number, number, number] = new Color(color).to_hsv();
    h += percentage*hsv[0];
    s += percentage*hsv[1];
    v += percentage*hsv[2];
}

for(let key in COLOR_SCHEME){
    const new_key = key + "_normalized";
    COLOR_SCHEME[new_key] = [];

    for(let idx=0;idx<COLOR_SCHEME[key].length;idx++){
        const entry = COLOR_SCHEME[key][idx];
        const color = new Color(entry[0]);
        const hsv = color.to_hsv();
        color.set_hsv(hsv[0], (s+hsv[1])/2, (v+hsv[2])/2);

        COLOR_SCHEME[new_key].push([color.to_hex(), entry[1]]);
    }
}
}


/*
   const COLORS = {
   "Wet Sand":"#dccba7",
   "Water":"#7e9fa1",
   "Red Clay":"#b38768",
   "Wet Sand Shadowed":"#4b3f2e",
   "Stone":"#8c8c7f",
   "Plant":"#908149",
   "White Stone Shadowed":"#697078",
   "White Stone":"#e4cbaa",
   "Dark Gray Stone":"#585451",
   "Sky":"#a6b7c3",
   "Blue Clothes":"#282b57",
   "Light Green Stone":"#d8d8c0",
   "Green Stone":"#a8a890",
   "Dark Green Stone":"#787860",
   "Dark Purple Clothes":"#303048",
   "Purple Clothes":"#484860",
   "Light Purple Clothes":"#606078",
   "Wet Red Clay":"#bd896e",
   "Wet Clay":"#b9a391",
   "Dry Plant":"#977c65",
   "Dark Red Clay":"#563025",
   "Dark Water":"#563025"
   }

   const COLOR_SCHEME = {  
   "Hot Sand Desert":{  
   "Wet Sand":0.777,
   "Water":0.123,
   "Red Clay":0.69,
   "Wet Sand Shadowed":0.021,
   "Stone":0.09,
   "Plant":0.01
   },
   "White Stone Desert":{  
   "White Stone Shadowed":0.498,
   "White Stone":0.365,
   "Dark Gray Stone":0.104,
   "Sky":0.020,
   "Blue Clothes":0.013
   },
   "Green Stone Desert":{  
   "Light Green Stone":0.825778,
   "Green Stone":0.143555,
   "Dark Green Stone":0.024356,
   "Dark Purple Clothes":0.004711,
   "Purple Clothes":0.000889,
   "Light Purple Clothes":0.000711
   },
   "Red Clay Desert":{  
   "Wet Red Clay":0.623,
   "Wet Clay":0.256,
   "Sky":0.076,
   "Dry Plant":0.041,
   "Dark Red Clay":0.02,
   "Dark Water":0.02
   }
   }
 */
