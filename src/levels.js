const LEVELS = [
    {
        name: 'Level 1',
        diff: 'easy',
        author: 'Frozen Bubble',
        players: 'default',
        board: [
            "0 0 1 1 2 2 3 3",
            " 0 0 1 1 2 2 3 ",
            "2 2 3 3 0 0 1 1",
            " 2 3 3 0 0 1 1 ",
        ]
    },
    {
        name: 'Fruit Salad',
        diff: 'easy',
        author: 'pkubiak',
        players: [
            {x: 100, y: 500, speed: 1.0},
            {x: 220, y: 500, speed: 2.0},
        ],
        board: [
            "0 0 0 0 0 0 0 0",
            " 1 1 1 1 1 1 1 ",
            "2 2 2 2 2 2 2 2",
            " 3 3 3 3 3 3 3 ",
            "4 4 4 4 4 4 4 4",
        ]
    },
    {
        name: 'Fruit Shake',
        diff: 'hard',
        author: 'pkubiak',
        players: [
            {x: 100, y: 500, speed: 1.0},
            {x: 220, y: 500, speed: 2.0},
        ],
        board: [
            "0 1 2 3 4 0 1 2",
            " 2 3 4 0 1 2 3 ",
            "3 4 0 1 2 3 4 0",
            " 0 1 2 3 4 0 1 ",
            "x 2 3 4 0 1 2 x",
            " x x - - - x x ",
            "x - - - - - - x",
        ]
    }
]

for(let level of LEVELS) {
    if(level.players == 'default') {
        level.players = [{x: 160, y: 500, speed: 2.0}];
    }
}