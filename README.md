### The World
* Architecture
    * Buildings are desaturated
    * Surroundings are saturated
    * Materials are "as found"
    * Thermal symbolism
        * Cold areas -> warmth represents safety
        * Hot areas -> cold, wet represents safety
        * Rainy -> dry, etc.
        * Hot areas -> structures are open and disconnected
        * Cold areas -> structures are connected
    * Rooms with function
    * Room evolution optimizes?
        * Dimensions
    * Room decoration
        * Marble floors
        * Concrete floors
        * Wood floors
        * Quartz
    * Room types
        * Church (wood floors, wood furniture, books, symbols...)
        * Library (patterned floors? wood furniture, book piles)
        * Garden (plants)
        * School room (desks, books, boards)
        * Kitchen (fireplace + shelves?)
        * Chemistry Lab
        * Workshop (concrete floor, wood furniture)
        * Machine room (Pistons + gears + steam + engines...)
* Primitive architecture but complex technology
    * Technology created by extinct civilization
    * Inhabitants are utilizing technological remains
* Chemistry / alchemy / magic
    * Elements are a certain amount brittle and acidic
    * Chemical reactions between elements
    * These reactions are turing complete
    * There are "computers" that run on highly brittle elements in a vacuum
    * Objects have energy that can be used for chemistry
    * Sun gives energy
    * Fungi absorb energy from the sun and can be used as sources of high-energy chemicals
    * Reactions can release energy in the form of e.g. kinetic energy
    * Highly brittle elements are basically dust
    * Acidity of -1, 0, 1 are safe for all living organisms
    * Acidity of 0 are gaseous at typical temperature
    * There's no liquids at reasonable temps (maybe very acidic ones?)
* Biomes
    * Fucking tons of sand
    * Sand of all different colors
    * Rocks and stuff
    * Plants? Maybe no green but plant-like things
    * Mushrooms?
### The Mechanics
* Position optimization of AI
    * AI is state machine
        * States optimize for different properties
        * Food (player is far away)
        * Protection (player is near)
        * Offense (player is near)
        * Isolation (run away when player is near)
    * AI isolated to rooms
        * Binding of Isaac, LoZ
        * Naw
    * AI isolated to room types?
        * AI has an affinity for a type of room, but player is not locked off
        * e.g. spirit spawns in church room
        * critters 
* Gameplay Mechanics
    * Room lockdown?
    * Inventory
    * Room types should be more than aesthetic
* Horror Game elements?
    * Fear of death
    * Value of death
* Generation
    * Read 3x3 tiles, wave generate map
    * Some tiles are enemies / drops / etc?
    * Or place enemies procedurally afterward
    * Grid of tiles with list of entities at each tile
    * Entities are enemies, items, machines (levers, pressure plates, etc)
        * Source and destination machines
        * Can be both or multiple
        * Attach sources to nearest destinations
    * TileGenerator makes a grid of enums, where the values are cell types
    * (wall, floor, door, lake, with specificity, i.e. wood floor, stone wall, water)
    * GridGenerator makes a grid of GridCells, which are not components
    * GridCells contain minimal information on their content
    * GridParser transforms a grid into a world, and returns a list of entities?

TODO:

1. Player Animation
1. Additional building textures
1. Wall textures (clipped textures)
1. Plants, other decoration
1. Import and debug AI
1. Health?
1. Projectiles?
1. Triggers on room entrance and exit
    1. Lockdown, enemies spawn

Bugs:

1. Canvas cache bugs if blocksize too small
1. Random white spaces in background (cache related)
